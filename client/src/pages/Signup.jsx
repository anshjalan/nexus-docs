import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addUser } from "../store/userSlice";
import { Eye, EyeOff } from "lucide-react"
import api from "../utils/api";

const Signup = () => {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must include at least one uppercase letter.");
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError("Password must include at least one lowercase letter.");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must include at least one number.");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setError("Password must include at least one special character.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/auth/send-otp", { email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/api/auth/signup", {
        firstName,
        lastName,
        email,
        password,
        otp,
      });

      dispatch(addUser(res.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: "Details" },
    { num: 2, label: "Verify" },
  ];

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4 relative overflow-hidden">

      {/* Decorative blobs */}
      <div className="absolute -top-30 -right-20 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute -bottom-25 -left-15 w-96 h-96 bg-accent-400/15 rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: "2s" }} />

      <div className="relative z-10 w-full max-w-md animate-scale-in">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl shadow-lg shadow-primary-500/30 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-surface-900">Create account</h1>
          <p className="text-surface-500 mt-1">Get started with Nexus Docs</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step >= s.num
                    ? "bg-primary-600 text-white shadow-md shadow-primary-500/30"
                    : "bg-surface-200 text-surface-500"
                }`}>
                  {step > s.num ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : s.num}
                </div>
                <span className={`text-sm font-medium ${step >= s.num ? "text-surface-800" : "text-surface-400"}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 h-0.5 rounded transition-colors duration-300 ${
                  step > s.num ? "bg-primary-500" : "bg-surface-200"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="glass rounded-2xl shadow-xl shadow-surface-900/5 p-5 sm:p-8">

          {error && (
            <div className="mb-5 px-4 py-3 bg-danger-500/10 border border-danger-500/20 rounded-xl text-danger-600 text-sm animate-slide-down">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="signup-first-name" className="block text-sm font-medium text-surface-700 mb-1.5">First name <span className="text-red-400">*</span></label>
                  <input
                    id="signup-first-name"
                    type="text"
                    placeholder="John"
                    className="w-full px-4 py-3 bg-white/60 border border-surface-200 rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400
                      transition-all duration-200 text-surface-800 placeholder:text-surface-400"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="signup-last-name" className="block text-sm font-medium text-surface-700 mb-1.5">Last name</label>
                  <input
                    id="signup-last-name"
                    type="text"
                    placeholder="Doe"
                    className="w-full px-4 py-3 bg-white/60 border border-surface-200 rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400
                      transition-all duration-200 text-surface-800 placeholder:text-surface-400"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-surface-700 mb-1.5">Email address <span className="text-red-400">*</span></label>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-white/60 border border-surface-200 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400
                    transition-all duration-200 text-surface-800 placeholder:text-surface-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="mt-1.5 text-xs text-surface-400">We'll send a 6-digit verification code</p>
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-surface-700 mb-1.5">Password <span className="text-red-400">*</span></label>
                <div className="relative">
                  <input
                    id="signup-password"
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
                <p className="mt-1.5 text-xs text-surface-400">Must include uppercase, lowercase, number & special character</p>
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
                    Sending OTP...
                  </>
                ) : (
                  "Send verification code"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4 animate-slide-up">
              <div className="rounded-xl border border-primary-100 bg-primary-50/70 px-4 py-3">
                <p className="text-sm font-medium text-surface-700">
                  Enter the code sent to <span className="text-primary-700">{email}</span>
                </p>
              </div>

              <div>
                <label htmlFor="signup-otp" className="block text-sm font-medium text-surface-700 mb-1.5">Verification Code <span className="text-red-400">*</span></label>
                <input
                  id="signup-otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-3 bg-white/60 border border-surface-200 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400
                    transition-all duration-200 text-surface-800 placeholder:text-surface-400 tracking-widest text-center font-mono text-lg"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(""); }}
                  className="px-5 py-3 bg-surface-100 text-surface-600 font-medium rounded-xl
                    hover:bg-surface-200 transition-all duration-200"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-primary-600 text-white font-semibold rounded-xl
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
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-surface-500">
              Already have an account?{" "}
              <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Signup;
