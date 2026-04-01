import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import LoadingCard from "../components/LoadingCard"
import DocumentCard from "../components/DocumentCard";

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await api.get("/api/documents/get");
        setDocuments(res.data.data);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleCreate = async () => {
    if (creating) return;

    try {
      setCreating(true);
      const res = await api.post("/api/documents/create");
      const documentId = res.data?.data?._id;

      if (!documentId) {
        throw new Error("Document id missing from create response");
      }

      navigate(`/document/${documentId}`);

      window.setTimeout(() => {
        if (window.location.pathname !== `/document/${documentId}`) {
          window.location.assign(`/document/${documentId}`);
        }
      }, 150);
    } catch (error) {
      console.error(error.message);
      toast.error("Couldn't open the new document. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const deleteDocument = async (id) => {
    try {
      await api.delete(`/api/documents/${id}`);
      setDocuments((prev) => prev.filter((d) => d._id !== id));
      toast.success("Document deleted successfully.");
    } catch (err) {
      toast.error("Delete failed. Please try again.");
    }
  };

  const handleDelete = (id) => {
    toast("Delete this document?", {
      description: "This action can't be undone.",
      actionButtonStyle: {
        backgroundColor: "#dc2626",
        color: "#ffffff",
      },
      action: {
        label: "Delete",
        onClick: () => deleteDocument(id),
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  return (
    <div className="min-h-screen bg-surface-50">

      <Navbar
        showSearch
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">

        {/* Create Section */}
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-4">
            Start a new document
          </h2>

          <div className="flex gap-4">
          
            {/* Blank Document */}
            <button
              id="create-document-button"
              onClick={handleCreate}
              disabled={creating}
              className="group w-36 h-48 bg-white border-2 border-dashed border-surface-200 rounded-2xl
                flex flex-col items-center justify-center cursor-pointer
                hover:border-primary-400 hover:bg-primary-50/50 hover:shadow-lg hover:shadow-primary-500/10
                hover:-translate-y-1 transition-all duration-300 disabled:cursor-not-allowed
                disabled:opacity-70 disabled:hover:translate-y-0"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center mb-3
                group-hover:bg-primary-200 group-hover:scale-110 transition-all duration-300">
                <Plus size={24} className="text-primary-600" />
              </div>
              <span className="text-sm font-medium text-surface-600 group-hover:text-primary-700 transition-colors">
                {creating ? "Opening..." : "Blank"}
              </span>
            </button>

            {/* Template Placeholder */}
            <div className="w-36 h-48 bg-linear-to-br from-primary-50 to-primary-100/50 border border-primary-100 rounded-2xl flex flex-col items-center justify-center opacity-60">
              <FileText size={24} className="text-primary-400 mb-2" />
              <span className="text-xs font-medium text-primary-400">Templates</span>
              <span className="text-[10px] text-primary-300 mt-0.5">Coming soon</span>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div>
          <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-4">
            Recent documents
          </h2>

          <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">

            {loading ? (
              <>
                <LoadingCard />
                <LoadingCard />
                <LoadingCard />
              </>
            ) : documents.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mb-4">
                  <FolderOpen size={28} className="text-surface-400" />
                </div>
                <p className="text-surface-600 font-medium mb-1">No documents yet</p>
                <p className="text-sm text-surface-400">Create your first document to get started</p>
              </div>
            ) : (
              documents.map((doc) => (
                <DocumentCard
                  key={doc._id}
                  doc={doc}
                  onOpen={() => navigate(`/document/${doc._id}`)}
                  onDelete={handleDelete}
                />
              ))
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
