import {
  ArrowLeft,
  CheckCircle2,
  CloudOff,
  Focus,
  Loader2,
  Minimize2,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";

const SAVE_STATUS_CONFIG = {
  saved: { icon: CheckCircle2, text: "All changes saved", color: "text-success-500" },
  saving: { icon: Loader2, text: "Saving changes...", color: "text-surface-500" },
  unsaved: { icon: CloudOff, text: "Unsaved changes", color: "text-warning-500" },
  error: { icon: CloudOff, text: "Save failed", color: "text-danger-600" },
};

const EditorHeader = ({
  title,
  onTitleChange,
  onBack,
  onToggleFocusMode,
  onOpenShare,
  saveStatus,
  connected,
  focusMode,
}) => {
  const saveStatusView = SAVE_STATUS_CONFIG[saveStatus] || SAVE_STATUS_CONFIG.saved;
  const StatusIcon = saveStatusView.icon;

  return (
    <header className="sticky top-0 z-40 border-b border-surface-200/80 bg-white/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            id="back-to-dashboard"
            onClick={onBack}
            className="p-2 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-surface-100 transition-all duration-200"
            title="Back to Dashboard"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-surface-400 mb-1">
              Collaborative Editor
            </p>
            <input
              id="document-title-input"
              type="text"
              value={title}
              onChange={onTitleChange}
              className="text-base sm:text-xl font-semibold text-surface-800 bg-transparent border-none outline-none w-full
                focus:bg-surface-50 rounded-lg px-2 py-1 -ml-2 transition-colors duration-200
                placeholder:text-surface-400"
              placeholder="Untitled Document"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`hidden md:flex items-center gap-1.5 rounded-full bg-surface-50 px-3 py-1.5 text-xs font-medium ${saveStatusView.color} transition-colors`}>
            <StatusIcon size={14} className={saveStatus === "saving" ? "animate-spin" : ""} />
            <span>{saveStatusView.text}</span>
          </div>

          <div
            className={`hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
              connected ? "bg-success-500/10 text-success-500" : "bg-danger-500/10 text-danger-600"
            }`}
            title={connected ? "Connected" : "Disconnected"}
          >
            {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{connected ? "Connected" : "Offline"}</span>
          </div>

          <button
            onClick={onToggleFocusMode}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-surface-50 px-3 py-1.5 text-xs font-medium text-surface-600 hover:bg-surface-100 transition-colors"
          >
            {focusMode ? <Minimize2 size={14} /> : <Focus size={14} />}
            <span>{focusMode ? "Exit focus" : "Focus mode"}</span>
          </button>

          <button
            onClick={onOpenShare}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold
            text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors duration-200"
          >
            <Users size={16} />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default EditorHeader;
