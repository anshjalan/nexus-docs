import { Trash2, FileText, Clock } from "lucide-react";

const DocumentCard = ({ doc, onOpen, onDelete }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div
      onClick={onOpen}
      className="group flex items-center justify-between px-5 py-4
        border-b border-surface-100 last:border-none cursor-pointer
        hover:bg-primary-50/50 transition-all duration-200"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0
          group-hover:bg-primary-200 transition-colors duration-200">
          <FileText size={18} className="text-primary-600" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-surface-800 truncate group-hover:text-primary-700 transition-colors">
            {doc.title || "Untitled Document"}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Clock size={12} className="text-surface-400" />
            <p className="text-xs text-surface-400">
              {formatDate(doc.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation(); //Stop from opening document due to preant div's onClick = {onOpen}
          onDelete(doc._id);
        }}
        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 rounded-lg text-surface-400
          hover:text-danger-600 hover:bg-danger-500/10 transition-all duration-200"
        title="Delete document"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export default DocumentCard;