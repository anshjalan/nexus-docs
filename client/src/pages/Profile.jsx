import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addUser } from "../store/userSlice";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, CheckCircle, User as UserIcon, Mail, Calendar } from "lucide-react";
import api from "../utils/api";
import Navbar from "../components/Navbar";

const Profile = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await api.patch("/api/auth/profile", { firstName, lastName });
      dispatch(addUser(res.data.data));
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric"
      })
    : "Unknown";

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-8 animate-fade-in">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-white transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Profile</h1>
            <p className="text-sm text-surface-500">Manage your personal information</p>
          </div>
        </div>

        {/* Avatar Section */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-linear-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary-500/20">
              {(user?.firstName?.charAt(0) || "U").toUpperCase()}
              {(user?.lastName?.charAt(0) || "").toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-surface-900">
                {user?.firstName} {user?.lastName}
              </h2>
              <div className="flex items-center gap-1.5 text-surface-500 text-sm mt-1">
                <Mail size={14} />
                {user?.email}
              </div>
              <div className="flex items-center gap-1.5 text-surface-400 text-xs mt-1">
                <Calendar size={12} />
                Joined {joinedDate}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-surface-800 mb-5">Edit Profile</h3>

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

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="profile-first-name" className="block text-sm font-medium text-surface-700 mb-1.5">
                  First name <span className="text-red-400">*</span>
                </label>
                <input
                  id="profile-first-name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400
                    transition-all duration-200 text-surface-800"
                  required
                />
              </div>
              <div>
                <label htmlFor="profile-last-name" className="block text-sm font-medium text-surface-700 mb-1.5">
                  Last name
                </label>
                <input
                  id="profile-last-name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400
                    transition-all duration-200 text-surface-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-3 bg-surface-100 border border-surface-200 rounded-xl
                  text-surface-400 cursor-not-allowed"
              />
              <p className="text-xs text-surface-400 mt-1">Email cannot be changed</p>
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
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

export default Profile;
