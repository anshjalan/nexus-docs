import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Quill from "quill";
import api from "../utils/api";
import socket from "../utils/socket";

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, false] }],
  [{ font: [] }],
  ["bold", "italic", "underline", "strike"],
  [{ script: "sub" }, { script: "super" }],
  [{ color: [] }, { background: [] }],
  [{ align: [] }],
  [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
  [{ indent: "-1" }, { indent: "+1" }],
  ["blockquote", "code-block"],
  ["link", "image"],
  ["clean"],
];

const EMPTY_CONTENT = { ops: [{ insert: "\n" }] };

const useDocumentEditor = (documentId) => {
  const [title, setTitle] = useState("Untitled Document");
  const [saveStatus, setSaveStatus] = useState("saved");
  const [connected, setConnected] = useState(socket.connected);
  const [editorReady, setEditorReady] = useState(false);
  const [documentMeta, setDocumentMeta] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const wrapperRef = useRef(null);
  const quillRef = useRef(null);
  const titleTimeoutRef = useRef(null);
  const contentTimeoutRef = useRef(null);
  const saveInFlightRef = useRef(false);
  const queuedSaveRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const pendingContentRef = useRef(false);
  const isApplyingRemoteRef = useRef(false);
  const latestContentRef = useRef(EMPTY_CONTENT);

  const updateEditorStats = useCallback(() => {
    if (!quillRef.current) return;

    const text = quillRef.current.getText().trim();
    const words = text ? text.split(/\s+/).length : 0;
    setWordCount(words);
    setCharacterCount(text.length);
  }, []);

  const refreshDocumentMeta = useCallback(
    async (preserveLocalTitle = true) => {
      const res = await api.get(`/api/documents/${documentId}`);
      const doc = res.data.data;

      setDocumentMeta(doc);
      setLastSavedAt(doc.updatedAt ? new Date(doc.updatedAt) : null);

      if (!preserveLocalTitle) {
        setTitle(doc.title || "Untitled Document");
      }

      return doc;
    },
    [documentId]
  );

  const persistContent = useCallback(
    async ({ keepalive = false, contentOverride } = {}) => {
      const content = contentOverride || latestContentRef.current;
      if (!content || !pendingContentRef.current) return;

      try {
        if (keepalive) {
          const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/documents/${documentId}`, {
            method: "PATCH",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ content }),
            keepalive: true,
          });

          if (!response.ok) {
            throw new Error("Keepalive save failed");
          }

          pendingContentRef.current = false;
          return;
        }

        if (saveInFlightRef.current) {
          queuedSaveRef.current = true;
          return;
        }

        saveInFlightRef.current = true;
        setSaveStatus("saving");
        const res = await api.patch(`/api/documents/${documentId}`, { content });

        if (content === latestContentRef.current) {
          pendingContentRef.current = false;
          setSaveStatus("saved");
          setLastSavedAt(res.data?.data?.updatedAt ? new Date(res.data.data.updatedAt) : new Date());
          setDocumentMeta((prev) => (prev ? { ...prev, updatedAt: res.data?.data?.updatedAt || prev.updatedAt } : prev));
        }
      } catch (error) {
        console.error("Failed to persist document content:", error.message);
        setSaveStatus("error");
      } finally {
        if (!keepalive) {
          saveInFlightRef.current = false;

          if (queuedSaveRef.current) {
            queuedSaveRef.current = false;
            persistContent({ contentOverride: latestContentRef.current });
          }
        }
      }
    },
    [documentId]
  );

  const scheduleContentSave = useCallback(() => {
    if (contentTimeoutRef.current) {
      clearTimeout(contentTimeoutRef.current);
    }

    contentTimeoutRef.current = setTimeout(() => {
      persistContent();
    }, 700);
  }, [persistContent]);

  const handleTitleChange = useCallback(
    (e) => {
      const newTitle = e.target.value;
      setTitle(newTitle);

      if (titleTimeoutRef.current) {
        clearTimeout(titleTimeoutRef.current);
      }

      titleTimeoutRef.current = setTimeout(async () => {
        try {
          setSaveStatus("saving");
          const res = await api.patch(`/api/documents/${documentId}`, { title: newTitle });
          setSaveStatus("saved");
          setLastSavedAt(res.data?.data?.updatedAt ? new Date(res.data.data.updatedAt) : new Date());
          setDocumentMeta((prev) =>
            prev ? { ...prev, title: newTitle, updatedAt: res.data?.data?.updatedAt || prev.updatedAt } : prev
          );
        } catch (error) {
          setSaveStatus("error");
          console.error("Failed to update title:", error.message);
        }
      }, 500);
    },
    [documentId]
  );

  useEffect(() => {
    const handleConnect = () => {
      setConnected(true);
      socket.emit("join-document", documentId);
    };

    const handleDisconnect = () => setConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [documentId]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingContentRef.current) {
        persistContent({ keepalive: true });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && pendingContentRef.current) {
        persistContent({ keepalive: true });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [persistContent]);

  useEffect(() => {
    if (!wrapperRef.current) return;

    hasLoadedRef.current = false;
    setEditorReady(false);
    wrapperRef.current.innerHTML = "";

    const editorDiv = document.createElement("div");
    wrapperRef.current.appendChild(editorDiv);

    const quill = new Quill(editorDiv, {
      theme: "snow",
      placeholder: "Start writing something amazing...",
      modules: {
        toolbar: TOOLBAR_OPTIONS,
      },
    });

    quill.disable();
    quill.setText("Loading...");
    quillRef.current = quill;

    const handleReceiveChanges = (delta) => {
      isApplyingRemoteRef.current = true;
      quill.updateContents(delta);
      isApplyingRemoteRef.current = false;
      latestContentRef.current = quill.getContents();
      updateEditorStats();
    };

    const handleTextChange = (delta, oldDelta, source) => {
      updateEditorStats();

      if (source !== "user" || isApplyingRemoteRef.current) return;

      pendingContentRef.current = true;
      latestContentRef.current = quill.getContents();
      setSaveStatus("unsaved");

      socket.emit("send-changes", {
        documentId,
        delta,
      });

      scheduleContentSave();
    };

    socket.on("receive-changes", handleReceiveChanges);
    quill.on("text-change", handleTextChange);

    return () => {
      if (contentTimeoutRef.current) {
        clearTimeout(contentTimeoutRef.current);
      }

      if (titleTimeoutRef.current) {
        clearTimeout(titleTimeoutRef.current);
      }

      persistContent();
      socket.off("receive-changes", handleReceiveChanges);
      quill.off("text-change", handleTextChange);
      socket.emit("leave-document", documentId);
      quillRef.current = null;
    };
  }, [documentId, persistContent, scheduleContentSave, updateEditorStats]);

  useEffect(() => {
    refreshDocumentMeta(false)
      .then((doc) => {
        if (!quillRef.current || hasLoadedRef.current) return;

        latestContentRef.current = doc.content?.ops ? doc.content : EMPTY_CONTENT;
        quillRef.current.setContents(latestContentRef.current);
        quillRef.current.enable();
        hasLoadedRef.current = true;
        setEditorReady(true);
        setSaveStatus("saved");
        updateEditorStats();
      })
      .catch((error) => {
        console.error("Failed to fetch document:", error.message);
      });
  }, [refreshDocumentMeta, updateEditorStats]);

  const readingTime = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [wordCount]);

  const lastSavedLabel = useMemo(() => {
    if (!lastSavedAt) return "Not saved yet";

    return lastSavedAt.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }, [lastSavedAt]);

  return {
    wrapperRef,
    title,
    saveStatus,
    connected,
    editorReady,
    documentMeta,
    wordCount,
    characterCount,
    lastSavedLabel,
    readingTime,
    handleTitleChange,
    refreshDocumentMeta,
  };
};

export default useDocumentEditor;