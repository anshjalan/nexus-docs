import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const SearchBox = ({
  value = "",
  onChange,
  placeholder = "Search documents...",
  className = "",
}) => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!value.trim()) {
      setDocuments([]);
      return;
    }

    let isMounted = true;
    const timeoutId = setTimeout(async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/api/documents/get");
        if (isMounted) {
          setDocuments(res.data.data || []);
          setIsOpen(true);
        }
      } catch (error) {
        if (isMounted) {
          setDocuments([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [value]);

  const matchedDocuments = useMemo(() => {
    const normalizedQuery = value.trim().toLowerCase();
    if (!normalizedQuery) return [];

    return documents
      .filter((doc) => (doc.title || "Untitled Document").toLowerCase().includes(normalizedQuery))
      .slice(0, 6);
  }, [documents, value]);

  const handleSelect = (id) => {
    setIsOpen(false);
    onChange?.("");
    navigate(`/document/${id}`);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={() => {
          if (value.trim()) {
            setIsOpen(true);
          }
        }}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 bg-surface-100/80 border border-surface-200/60 rounded-xl
          focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-300
          focus:bg-white transition-all duration-200 text-sm text-surface-700 placeholder:text-surface-400"
      />

      {isOpen && value.trim() && (
        <div className="absolute top-[calc(100%+0.5rem)] left-0 right-0 z-50 overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-xl shadow-surface-900/10">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-surface-500">Searching documents...</div>
          ) : matchedDocuments.length > 0 ? (
            matchedDocuments.map((doc) => (
              <button
                key={doc._id}
                type="button"
                onClick={() => handleSelect(doc._id)}
                className="flex w-full items-center justify-between gap-3 border-b border-surface-100 px-4 py-3 text-left transition-colors last:border-none hover:bg-primary-50/60"
              >
                <span className="truncate text-sm font-medium text-surface-700">
                  {doc.title || "Untitled Document"}
                </span>
                <span className="shrink-0 text-xs text-surface-400">Open</span>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-surface-500">No matching documents found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
