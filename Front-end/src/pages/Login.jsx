import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Flame, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Zap,
  Globe,
  ShieldCheck,
  Radio,
  Tv,
  Sparkles,
  X
} from 'lucide-react';
import authService from '../services/authService';

import { LoginHeader, LoginStudioPreview } from '../components/auth';

// ==========================================
// MAIN COMPOUND ROOT COMPONENT: Login
// ==========================================
const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  // Field validation with useCallback
  const validateField = useCallback((name, value) => {
    let error = '';
    switch (name) {
      case 'usernameOrEmail':
        if (!value.trim()) {
          error = 'Username or email is required';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters';
        }
        break;
      default:
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [name]: error }));
    setGeneralError(null);
    return !error;
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]: val
    }));
    if (type !== 'checkbox') {
      validateField(name, val);
    }
  }, [validateField]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    const errors = {};
    if (!formData.usernameOrEmail.trim()) {
      errors.usernameOrEmail = 'Username or email is required';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setGeneralError('Please fill in all required fields correctly.');
      return;
    }

    try {
      setLoading(true);
      setGeneralError(null);

      // Attempt live backend authentication
      try {
        const payload = {
          password: formData.password,
        };
        if (formData.usernameOrEmail.includes('@')) {
          payload.email = formData.usernameOrEmail;
        } else {
          payload.username = formData.usernameOrEmail;
        }

        const res = await authService.login(payload);
        if (res?.data?.user) {
          login(res.data.user);
          setSuccess(true);
          setTimeout(() => {
            navigate('/');
          }, 1000);
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Invalid user credentials. Please check your details and try again.';
        setGeneralError(errorMsg);
      }
    } catch (err) {
      setGeneralError(err.message || 'Invalid user credentials. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  }, [formData, login, navigate]);

  return (
    <div className="w-full relative container-4k min-h-[calc(100vh-5rem)]">
      {/* Background Ambient Glows */}
      <div className="ambient-glow top-0 right-1/4 w-100 lg:w-150 h-100 bg-[#FF0055]/10 rounded-full pointer-events-none"></div>
      <div className="ambient-glow bottom-10 left-10 w-100 lg:w-150 h-100 bg-[#7928CA]/10 rounded-full pointer-events-none"></div>

      {/* ============================================================== */}
      {/* 📱 MOBILE VIEW: Fluid Mobile Layout ONLY (< lg)                */}
      {/* ============================================================== */}
      <div className="lg:hidden min-h-[calc(100vh-5rem)] flex items-center justify-center p-3 sm:p-4 pb-24 relative overflow-y-auto">
        <div className="w-full max-w-sm sm:max-w-md glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/10 shadow-2xl relative z-10 my-auto">
          <div className="flex flex-col items-center text-center gap-1 sm:gap-1.5 mb-3">
            <Link to="/" className="flex items-center gap-2 group mb-0.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-linear-to-tr from-[#FF0055] via-[#FF2E7E] to-[#7928CA] flex items-center justify-center shadow-lg shadow-[#FF0055]/30">
                <Flame className="w-4 h-4 text-white fill-white animate-pulse" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-base sm:text-lg font-black text-white">SKTUBE</span>
                <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FF0055]/20 text-[#FF2E7E] border border-[#FF0055]/30">
                  NEO
                </span>
              </div>
            </Link>
            <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
              Welcome Back
            </h1>
            <p className="text-[10px] sm:text-[11px] text-neutral-400">
              Sign in to continue streaming & managing your studio
            </p>
          </div>

          {generalError && (
            <div className="mb-2.5 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2 animate-fadeIn">
              <div className="flex items-center gap-2 min-w-0">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="leading-snug">{generalError}</span>
              </div>
              <button
                type="button"
                onClick={() => setGeneralError(null)}
                className="text-rose-400 hover:text-white p-0.5 rounded cursor-pointer shrink-0 transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-2.5 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span className="leading-snug">Logged in successfully! Redirecting...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-bold text-neutral-300 uppercase tracking-wider">
                  Username or Email *
                </label>
                {fieldErrors.usernameOrEmail && (
                  <span className="text-[8px] text-rose-400 font-medium">{fieldErrors.usernameOrEmail}</span>
                )}
              </div>
              <div className={`flex items-center bg-[#12121c] border ${
                fieldErrors.usernameOrEmail ? 'border-rose-500/80 bg-rose-500/5 ring-1 ring-rose-500/30' : 'border-white/10 focus-within:border-[#FF0055]/50'
              } rounded-xl px-2.5 h-8.5 transition-colors`}>
                <User className={`w-3.5 h-3.5 mr-2 shrink-0 ${fieldErrors.usernameOrEmail ? 'text-rose-400' : 'text-neutral-500'}`} />
                <input
                  type="text"
                  name="usernameOrEmail"
                  placeholder="Enter username or email"
                  value={formData.usernameOrEmail}
                  onChange={handleInputChange}
                  className="w-full bg-transparent text-xs text-white placeholder-neutral-500 outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <label className="text-[9px] font-bold text-neutral-300 uppercase tracking-wider">
                  Password *
                </label>
                {fieldErrors.password ? (
                  <span className="text-[8px] text-rose-400 font-medium">{fieldErrors.password}</span>
                ) : (
                  <a href="#" className="text-[8px] text-[#FF2E7E] hover:underline">Forgot?</a>
                )}
              </div>
              <div className={`flex items-center bg-[#12121c] border ${
                fieldErrors.password ? 'border-rose-500/80 bg-rose-500/5 ring-1 ring-rose-500/30' : 'border-white/10 focus-within:border-[#FF0055]/50'
              } rounded-xl px-2.5 h-8.5 transition-colors`}>
                <Lock className={`w-3.5 h-3.5 mr-2 shrink-0 ${fieldErrors.password ? 'text-rose-400' : 'text-neutral-500'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-transparent text-xs text-white placeholder-neutral-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-neutral-500 hover:text-neutral-300 p-0.5 cursor-pointer shrink-0"
                >
                  {showPassword ? <Eye className="w-3.5 h-3.5 text-[#FF2E7E]" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              <input
                type="checkbox"
                id="rememberMeMobile"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="w-3.5 h-3.5 rounded bg-[#12121c] border-white/20 text-[#FF0055] focus:ring-0 cursor-pointer accent-[#FF0055]"
              />
              <label htmlFor="rememberMeMobile" className="text-[10px] text-neutral-400 cursor-pointer select-none">
                Remember me on this device
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="btn-primary mt-1 w-full py-2.5 text-xs gap-2 disabled:opacity-50 cursor-pointer shadow-xl shadow-[#FF0055]/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          <div className="mt-2.5 pt-2 border-t border-white/10 text-center">
            <p className="text-[10px] text-neutral-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-[#FF2E7E] hover:underline ml-1">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 🖥️ LAPTOP, DESKTOP & 4K VIEW: Full-Page Cinematic Studio Layout (>= lg) */}
      {/* ============================================================== */}
      <div className="hidden lg:flex flex-col gap-6 w-full py-4 relative z-10">
        <Login.Header />

        {generalError && (
          <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm font-semibold flex items-center justify-between gap-3 shadow-xl animate-fadeIn">
            <div className="flex items-center gap-3 min-w-0">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{generalError}</span>
            </div>
            <button
              type="button"
              onClick={() => setGeneralError(null)}
              className="text-rose-400 hover:text-white p-1 rounded-lg hover:bg-rose-500/20 cursor-pointer shrink-0 transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold flex items-center gap-3 shadow-xl animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>Logged in successfully! Redirecting you to Sktube...</span>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6 items-start">
          {/* LEFT: Studio Preview & Security Highlights (5 cols) */}
          <div className="col-span-5 flex flex-col gap-5">
            <Login.StudioPreview />
          </div>

          {/* RIGHT: Full-Width Glass Sign In Form (7 cols) */}
          <div className="col-span-7 flex flex-col gap-5">
            <div className="glass-panel p-7 2xl:p-9 rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div>
                  <h2 className="text-lg 2xl:text-xl font-extrabold text-white">Sign In to Your Account</h2>
                  <p className="text-xs 2xl:text-sm text-neutral-400">Access your creator studio and personal stream feed.</p>
                </div>
                <span className="text-xs text-neutral-500 font-medium">Encrypted Login</span>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Username or Email */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs 2xl:text-sm font-bold text-neutral-300">Username or Email *</label>
                    {fieldErrors.usernameOrEmail && (
                      <span className="text-[10px] text-rose-400 font-semibold truncate">{fieldErrors.usernameOrEmail}</span>
                    )}
                  </div>
                  <div className={`flex items-center bg-[#12121c] border ${
                    fieldErrors.usernameOrEmail ? 'border-rose-500/80 bg-rose-500/5 ring-1 ring-rose-500/30' : 'border-white/10 focus-within:border-[#FF0055]/60'
                  } rounded-xl px-3 h-11 2xl:h-12 transition-colors`}>
                    <User className={`w-4 h-4 mr-2 shrink-0 ${fieldErrors.usernameOrEmail ? 'text-rose-400' : 'text-neutral-500'}`} />
                    <input
                      type="text"
                      name="usernameOrEmail"
                      placeholder="e.g. johndoe or john@example.com"
                      value={formData.usernameOrEmail}
                      onChange={handleInputChange}
                      className="w-full bg-transparent text-xs 2xl:text-sm text-white placeholder-neutral-500 outline-none"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs 2xl:text-sm font-bold text-neutral-300">Password *</label>
                    <div className="flex items-center gap-2">
                      {fieldErrors.password && (
                        <span className="text-[10px] text-rose-400 font-semibold truncate">{fieldErrors.password}</span>
                      )}
                      <a href="#" className="text-xs text-[#FF2E7E] hover:underline">Forgot password?</a>
                    </div>
                  </div>
                  <div className={`flex items-center bg-[#12121c] border ${
                    fieldErrors.password ? 'border-rose-500/80 bg-rose-500/5 ring-1 ring-rose-500/30' : 'border-white/10 focus-within:border-[#FF0055]/60'
                  } rounded-xl px-3 h-11 2xl:h-12 transition-colors`}>
                    <Lock className={`w-4 h-4 mr-2 shrink-0 ${fieldErrors.password ? 'text-rose-400' : 'text-neutral-500'}`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full bg-transparent text-xs 2xl:text-sm text-white placeholder-neutral-500 outline-none min-w-0"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-neutral-500 hover:text-neutral-300 p-1 cursor-pointer shrink-0"
                    >
                      {showPassword ? <Eye className="w-4 h-4 text-[#FF2E7E]" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="rememberMeDesktop"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded bg-[#12121c] border-white/20 text-[#FF0055] focus:ring-0 cursor-pointer accent-[#FF0055]"
                    />
                    <label htmlFor="rememberMeDesktop" className="text-xs 2xl:text-sm text-neutral-300 cursor-pointer select-none">
                      Keep me signed in on this workstation
                    </label>
                  </div>
                  <span className="text-[11px] text-neutral-500">Auto session renewal</span>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading || success}
                  className="btn-primary mt-2 w-full py-3.5 2xl:py-4 text-sm font-bold gap-2 shadow-xl shadow-[#FF0055]/30 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      <span>Authenticating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In & Enter Sktube Studio</span>
                      <ArrowRight className="w-4.5 h-4.5 stroke-[2.5]" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-neutral-400">
                  <span>
                    New to Sktube?{' '}
                    <Link to="/register" className="font-bold text-[#FF2E7E] hover:underline ml-1">
                      Create Creator Account
                    </Link>
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Protected by Sktube Security Guard
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Attach compound subcomponents
Login.Header = LoginHeader;
Login.StudioPreview = LoginStudioPreview;

export default Login;
