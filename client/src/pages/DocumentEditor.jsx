import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ShareModal from "../components/ShareModal";
import EditorHeader from "../components/editor/EditorHeader";
import EditorInfoBar from "../components/editor/EditorInfoBar";
import EditorLoadingState from "../components/editor/EditorLoadingState";
import EditorMetaBar from "../components/editor/EditorMetaBar";
import useDocumentEditor from "../hooks/useDocumentEditor";
import "quill/dist/quill.snow.css";

const DocumentEditor = () => {
  const { id: documentId } = useParams();
  const navigate = useNavigate();
  const [shareOpen, setShareOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const {
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
  } = useDocumentEditor(documentId);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${focusMode ? "bg-surface-100" : "gradient-mesh"}`}>
      <EditorHeader
        title={title}
        onTitleChange={handleTitleChange}
        onBack={() => navigate("/")}
        onToggleFocusMode={() => setFocusMode((prev) => !prev)}
        onOpenShare={() => setShareOpen(true)}
        saveStatus={saveStatus}
        connected={connected}
        focusMode={focusMode}
      />

      <EditorMetaBar
        wordCount={wordCount}
        readingTime={readingTime}
        lastSavedLabel={lastSavedLabel}
        owner={documentMeta?.owner}
        collaborators={documentMeta?.collaborators}
      />

      {!editorReady && <EditorLoadingState />}

      <main className={`flex-1 px-4 pb-10 ${!editorReady ? "hidden" : "animate-fade-in"}`}>
        <div className={`mx-auto transition-all duration-300 ${focusMode ? "max-w-5xl pt-6" : "max-w-6xl pt-8"}`}>
          <EditorInfoBar characterCount={characterCount} />

          <div className="document-editor-shell rounded-[30px] border border-surface-200/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] overflow-hidden">
            <div ref={wrapperRef} className="document-editor-wrapper" />
          </div>
        </div>
      </main>

      <ShareModal
        documentId={documentId}
        isOpen={shareOpen}
        onClose={async () => {
          setShareOpen(false);

          try {
            await refreshDocumentMeta(true);
          } catch (error) {
            console.error("Failed to refresh document sharing info:", error.message);
          }
        }}
      />
    </div>
  );
};

export default DocumentEditor;
