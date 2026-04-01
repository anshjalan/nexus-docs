import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addUser } from "../store/userSlice";
import { Eye, EyeOff } from "lucide-react"
import api from "../utils/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/api/auth/login", { email, password });
      dispatch(addUser(res.data.data));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4 relative overflow-hidden">

      <div className="absolute -top-30 -left-20 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute -bottom-25 -right-15 w-96 h-96 bg-accent-400/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />

      <div className="w-full max-w-md animate-scale-in">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl shadow-lg shadow-primary-500/30 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-surface-900">Welcome back</h1>
          <p className="text-surface-500 mt-1">Sign in to Nexus Docs</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl shadow-xl shadow-surface-900/5 p-8">

          {error && (
            <div className="mb-5 px-4 py-3 bg-danger-500/10 border border-danger-500/20 rounded-xl text-danger-600 text-sm animate-slide-down">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-surface-700 mb-1.5">Email <span className="text-red-400">*</span></label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-white/60 border border-surface-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400
                  transition-all duration-200 text-surface-800 placeholder:text-surface-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-surface-700 mb-1.5">Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className="w-full px-4 py-3 bg-white/60 border border-surface-200 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400
                    transition-all duration-200 text-surface-800 placeholder:text-surface-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl
                hover:bg-primary-700 active:scale-[0.98] transition-all duration-200
                shadow-lg shadow-primary-600/25 disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-surface-500">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
                Create one
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;