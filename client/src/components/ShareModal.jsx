import { useState, useRef, useEffect } from "react";
import { X, UserPlus, Trash2, Loader2, Crown, Users, Mail } from "lucide-react";
import api from "../utils/api";

const ShareModal = ({ documentId, isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const modalRef = useRef(null);
  const inputRef = useRef(null);

  const handleClose = () => {
    setEmail("");
    setError("");
    setSuccess("");
    setLoading(false);
    setFetching(true);
    onClose();
  };

  const refreshShareData = async () => {
    const res = await api.get(`/api/documents/${documentId}`);
    const doc = res.data.data;
    setOwner(doc.owner || null);
    setCollaborators(doc.collaborators || []);
  };

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        handleClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClick);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  // Fetch document data
  useEffect(() => {
    if (!isOpen) return;

    const fetchDoc = async () => {
      setFetching(true);
      try {
        await refreshShareData();
      } catch (err) {
        setError("Failed to load sharing info");
      } finally {
        setFetching(false);
      }
    };

    fetchDoc();
  }, [isOpen, documentId]);

  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post(`/api/documents/${documentId}/collaborators`, { email: email.trim() });
      setSuccess(`Added ${email}`);
      setEmail("");
      setTimeout(() => setSuccess(""), 3000);

      await refreshShareData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add collaborator");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collabEmail) => {
    setError("");
    setSuccess("");

    try {
      await api.delete(`/api/documents/${documentId}/collaborators`, {
        data: { email: collabEmail },
      });
      await refreshShareData();
      setSuccess(`Removed ${collabEmail}`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove collaborator");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl shadow-surface-900/20 animate-scale-in overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center">
              <Users size={18} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-surface-900">Share Document</h2>
              <p className="text-xs text-surface-400">Invite collaborators to edit</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Add Collaborator Form */}
        <div className="px-6 py-4">
          <form onSubmit={handleAddCollaborator} className="flex gap-2">
            <div className="relative flex-1">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
              {/* <span className="text-red-400">*</span> */}
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Add by email address..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400
                  transition-all duration-200 text-sm text-surface-800 placeholder:text-surface-400"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl
                hover:bg-primary-700 active:scale-[0.98] transition-all duration-200
                shadow-md shadow-primary-600/25 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <UserPlus size={16} />
              )}
              Add
            </button>
          </form>

          {error && (
            <div className="mt-3 px-3 py-2 bg-danger-500/10 border border-danger-500/20 rounded-lg text-danger-600 text-xs animate-slide-down">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-3 px-3 py-2 bg-success-500/10 border border-success-500/20 rounded-lg text-success-500 text-xs animate-slide-down">
              {success}
            </div>
          )}
        </div>

        {/* People List */}
        <div className="px-6 pb-5">
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
            People with access
          </p>

          <div className="space-y-1 max-h-64 overflow-y-auto">
            {fetching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="text-surface-400 animate-spin" />
              </div>
            ) : (
              <>
                {/* Owner */}
                {owner && (
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-surface-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-linear-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {owner.firstName?.charAt(0)?.toUpperCase() || "O"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-surface-800">
                          {owner.firstName} {owner.lastName}
                        </p>
                        <p className="text-xs text-surface-400">{owner.email}</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                      <Crown size={12} />
                      Owner
                    </span>
                  </div>
                )}

                {/* Collaborators */}
                {collaborators.map((collab) => (
                  <div
                    key={collab._id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-surface-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-surface-200 rounded-full flex items-center justify-center text-surface-600 text-xs font-semibold">
                        {collab.firstName?.charAt(0)?.toUpperCase() || "C"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-surface-800">
                          {collab.firstName} {collab.lastName}
                        </p>
                        <p className="text-xs text-surface-400">{collab.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-surface-400">Editor</span>
                      <button
                        onClick={() => handleRemoveCollaborator(collab.email)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-surface-400 hover:text-danger-600 hover:bg-danger-500/10 transition-all"
                        title="Remove collaborator"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {collaborators.length === 0 && (
                  <div className="text-center py-6">
                    <Users size={24} className="text-surface-300 mx-auto mb-2" />
                    <p className="text-sm text-surface-400">No collaborators yet</p>
                    <p className="text-xs text-surface-300 mt-0.5">Add someone by email to start collaborating</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
