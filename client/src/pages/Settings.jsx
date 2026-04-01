import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Loader2, CheckCircle, Eye, EyeOff, TriangleAlert } from "lucide-react";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import { removeUser } from "../store/userSlice";

const Settings = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      await api.patch("/api/auth/password", { currentPassword, newPassword });
      setSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const expectedConfirmation = user?.email || "";

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteError("");
    setSuccess("");
    setError("");

    if (deleteConfirmation !== expectedConfirmation) {
      setDeleteError("Confirmation text does not match your email address");
      return;
    }

    setDeleteLoading(true);

    try {
      await api.delete("/api/auth/profile");
      dispatch(removeUser());
      navigate("/signup", { replace: true });
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete account");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-white transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Settings</h1>
            <p className="text-sm text-surface-500">Manage your account security</p>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <Lock size={20} className="text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-surface-800">Change Password</h3>
              <p className="text-xs text-surface-400">Update your password to keep your account secure</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-danger-500/10 border border-danger-500/20 rounded-xl text-danger-600 text-sm animate-slide-down">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 px-4 py-3 bg-success-500/10 border border-success-500/20 rounded-xl text-success-500 text-sm animate-slide-down flex items-center gap-2">
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-surface-700 mb-1.5">
                Current password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="current-password"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="********"
                  className="w-full px-4 py-3 pr-12 bg-surface-50 border border-surface-200 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400
                    transition-all duration-200 text-surface-800 placeholder:text-surface-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-surface-700 mb-1.5">
                New password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="********"
                  className="w-full px-4 py-3 pr-12 bg-surface-50 border border-surface-200 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400
                    transition-all duration-200 text-surface-800 placeholder:text-surface-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-surface-400 mt-1">Must include uppercase, lowercase, number & special character</p>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-surface-700 mb-1.5">
                Confirm new password <span className="text-red-400">*</span>
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="********"
                className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400
                  transition-all duration-200 text-surface-800 placeholder:text-surface-400"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl
                  hover:bg-primary-700 active:scale-[0.98] transition-all duration-200
                  shadow-lg shadow-primary-600/25 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update password"
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-white rounded-2xl border border-danger-500/20 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-danger-500/10 rounded-xl flex items-center justify-center">
              <TriangleAlert size={20} className="text-danger-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-surface-800">Delete Account</h3>
              <p className="text-xs text-surface-400">Permanently remove your account and all documents you own</p>
            </div>
          </div>

          <div className="mb-5 rounded-xl border border-danger-500/20 bg-danger-500/5 px-4 py-4">
            <p className="text-sm font-medium text-danger-700">This action is permanent.</p>
            <p className="mt-1 text-sm text-surface-600">
              Your owned documents will be deleted, and you will be removed from shared collaborators lists.
            </p>
          </div>

          {deleteError && (
            <div className="mb-4 px-4 py-3 bg-danger-500/10 border border-danger-500/20 rounded-xl text-danger-600 text-sm animate-slide-down">
              {deleteError}
            </div>
          )}

          <form onSubmit={handleDeleteAccount} className="space-y-4">
            <div>
              <label htmlFor="delete-account-confirmation" className="block text-sm font-medium text-surface-700 mb-1.5">
                Type <span className="font-semibold text-danger-700">{expectedConfirmation}</span> to confirm
              </label>
              <input
                id="delete-account-confirmation"
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder={expectedConfirmation}
                className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-danger-500/25 focus:border-danger-400
                  transition-all duration-200 text-surface-800 placeholder:text-surface-400"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={deleteLoading || deleteConfirmation !== expectedConfirmation}
                className="inline-flex items-center gap-2 px-6 py-3 bg-danger-600 text-white font-semibold rounded-xl
                  hover:bg-danger-700 active:scale-[0.98] transition-all duration-200
                  shadow-lg shadow-danger-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Deleting account...
                  </>
                ) : (
                  "Delete account"
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

export default Settings;
