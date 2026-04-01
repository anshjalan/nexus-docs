import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeUser } from "../store/userSlice";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Settings, ChevronDown } from "lucide-react";
import api from "../utils/api";
import SearchBox from "./SearchBox";

const Navbar = ({ searchValue = "", onSearchChange, showSearch = false }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
      dispatch(removeUser());
      setOpen(false);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed");
    }
  };

  const initials = user
    ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() || "U"
    : "U";

  const displayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User"
    : "User";

  return (
    <nav className="sticky top-0 z-50 glass border-b border-surface-200/60">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* Brand */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-md shadow-primary-500/20">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-surface-900 tracking-tight">
            Nexus<span className="text-primary-600">Docs</span>
          </span>
        </button>

        {/* Search */}
        {showSearch ? (
          <div className="hidden md:flex items-center w-full max-w-md mx-8">
            <SearchBox value={searchValue} onChange={onSearchChange} />
          </div>
        ) : (
          <div className="hidden md:block w-full max-w-md mx-8" />
        )}

        {/* User Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="user-menu-button"
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-surface-100/80 transition-all duration-200"
          >
            <div className="w-9 h-9 bg-linear-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center rounded-full text-sm font-semibold shadow-md shadow-primary-500/20">
              {initials}
            </div>
            <ChevronDown size={16} className={`text-surface-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-surface-200 rounded-xl shadow-xl shadow-surface-900/10 overflow-hidden animate-slide-down">

              <div className="px-4 py-3 border-b border-surface-100">
                <p className="font-medium text-surface-800 text-sm">{displayName}</p>
                <p className="text-xs text-surface-400 mt-0.5 truncate">{user?.email || ""}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => { setOpen(false); navigate("/profile"); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-600 hover:bg-surface-50 transition-colors"
                >
                  <User size={16} className="text-surface-400" />
                  Profile
                </button>

                <button
                  onClick={() => { setOpen(false); navigate("/settings"); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-600 hover:bg-surface-50 transition-colors"
                >
                  <Settings size={16} className="text-surface-400" />
                  Settings
                </button>
              </div>

              <div className="border-t border-surface-100 py-1">
                <button
                  id="logout-button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-500/5 transition-colors"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
