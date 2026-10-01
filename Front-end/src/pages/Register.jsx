import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Flame, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Camera, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Globe,
  ShieldCheck,
  Radio,
  Tv,
  Loader2,
  X
} from 'lucide-react';
import authService from '../services/authService';

import { RegisterHeader, RegisterChannelPreview, RegisterBenefits } from '../components/auth';

// ==========================================
// MAIN COMPOUND ROOT COMPONENT: Register
// ==========================================
const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  // Field validation with useCallback
  const validateField = useCallback((name, value) => {
    let error = '';

    switch (name) {
      case 'fullName':
        if (!value.trim()) error = 'Full Name is required';
        else if (value.trim().length < 2) error = 'Minimum 2 characters';
        break;
      case 'username':
        if (!value.trim()) error = 'Username is required';
        else if (value.trim().length < 3) error = 'Min 3 characters';
        else if (!/^[a-zA-Z0-9_]+$/.test(value)) error = 'Only letters, numbers, and _';
        break;
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
        break;
      case 'password':
        if (!value) error = 'Password is required';
        else if (value.length < 8) error = 'Min 8 characters';
        break;
      case 'confirmPassword':
        if (!value) error = 'Confirm required';
        else if (value !== formData.password) error = 'Passwords do not match';
        break;
      default:
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [name]: error }));
    setGeneralError(null);
    return !error;
  }, [formData.password]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);

    if (name === 'password' && formData.confirmPassword) {
      if (value !== formData.confirmPassword) {
        setFieldErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else {
        setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
      }
    }
  }, [formData.confirmPassword, validateField]);

  const handleAvatarChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFieldErrors((prev) => ({ ...prev, avatar: 'Please select a valid image file' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFieldErrors((prev) => ({ ...prev, avatar: 'Image size must be under 5MB' }));
        return;
      }
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
      setFieldErrors((prev) => ({ ...prev, avatar: '' }));
      setGeneralError(null);
    }
  }, []);

  const handleCoverChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    const errors = {};
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errors.fullName = 'Full Name is required (min 2 chars)';
    }
    if (!formData.username.trim() || formData.username.length < 3) {
      errors.username = 'Username min 3 chars';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Only letters, numbers, and _';
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Valid email is required';
    }
    if (!formData.password || formData.password.length < 8) {
      errors.password = 'Min 8 characters required';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (!avatar) {
      errors.avatar = 'Avatar profile image is required';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setGeneralError('Please fix the highlighted errors before submitting.');
      return;
    }

    try {
      setLoading(true);
      setGeneralError(null);

      const payload = new FormData();
      payload.append('fullName', formData.fullName);
      payload.append('username', formData.username);
      payload.append('email', formData.email);
      payload.append('password', formData.password);
      payload.append('avatar', avatar);
      if (coverImage) {
        payload.append('coverImage', coverImage);
      }

      await authService.register(payload);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setGeneralError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [formData, avatar, coverImage, navigate]);

  return (
    <div className="w-full relative container-4k min-h-[calc(100vh-5rem)]">
      {/* Background Ambient Glows */}
      <div className="ambient-glow top-0 right-1/4 w-100 lg:w-150 h-100 bg-[#FF0055]/10 rounded-full pointer-events-none"></div>
      <div className="ambient-glow bottom-10 left-10 w-100 lg:w-150 h-100 bg-[#7928CA]/10 rounded-full pointer-events-none"></div>

      {/* ============================================================== */}
      {/* 📱 MOBILE VIEW: Fluid Mobile Layout ONLY (< lg)                */}
      {/* ============================================================== */}
      <div className="lg:hidden min-h-[calc(100vh-5rem)] flex items-center justify-center p-3 sm:p-4 pb-24 relative overflow-y-auto">
        <div className="w-full max-w-md glass-panel rounded-2xl p-3.5 sm:p-5 border border-white/10 shadow-2xl relative z-10 my-auto">
          {/* Header Branding */}
          <div className="flex flex-col items-center text-center gap-0.5 mb-1.5">
            <Link to="/" className="flex items-center gap-1.5 group">
              <div className="w-6 h-6 rounded-lg bg-linear-to-tr from-[#FF0055] via-[#FF2E7E] to-[#7928CA] flex items-center justify-center shadow-lg shadow-[#FF0055]/30">
                <Flame className="w-3.5 h-3.5 text-white fill-white animate-pulse" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-black text-white">SKTUBE</span>
                <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-[#FF0055]/20 text-[#FF2E7E] border border-[#FF0055]/30">
                  NEO
                </span>
              </div>
            </Link>
            <h1 className="text-xs sm:text-sm font-extrabold text-white tracking-tight">
              Create Creator Account
            </h1>
          </div>

          {/* Global Alert */}
          {generalError && (
            <div className="mb-2 p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-1.5 animate-fadeIn">
              <div className="flex items-center gap-1.5 min-w-0">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                <span className="leading-snug">{generalError}</span>
              </div>
              <button
                type="button"
                onClick={() => setGeneralError(null)}
                className="text-rose-400 hover:text-white p-0.5 rounded cursor-pointer shrink-0 transition-colors"
                title="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-2 p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span className="leading-snug">Account created! Redirecting to login...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
            <div className={`relative rounded-xl overflow-hidden bg-neutral-900 border ${
              fieldErrors.avatar ? 'border-rose-500 ring-1 ring-rose-500/50' : 'border-white/10'
            } h-13 sm:h-14 flex flex-col justify-end p-1.5 transition-colors`}>
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-linear-to-r from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
                  <span className="text-[8px] text-neutral-500 font-medium">Cover Banner (Optional)</span>
                </div>
              )}

              <label className="absolute top-1 right-1 p-1 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md text-neutral-300 hover:text-white cursor-pointer border border-white/10" title="Upload Cover">
                <Camera className="w-2.5 h-2.5" />
                <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
              </label>

              <div className="relative z-10 flex items-center gap-2">
                <label className="relative group cursor-pointer" title="Upload Avatar">
                  <div className={`w-7.5 h-7.5 rounded-xl overflow-hidden bg-neutral-800 ring-2 ${
                    fieldErrors.avatar ? 'ring-rose-500' : 'ring-[#FF0055]/80'
                  } shadow-lg flex items-center justify-center`}>
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-neutral-400" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <Camera className="w-2.5 h-2.5" />
                  </div>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>

                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-bold text-white leading-tight">Avatar Profile *</span>
                  <span className={`text-[7.5px] truncate leading-tight ${fieldErrors.avatar ? 'text-rose-400 font-bold' : 'text-neutral-400'}`}>
                    {fieldErrors.avatar || 'Tap to upload'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2 columns fields */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between items-center">
                  <label className="text-[8px] font-bold text-neutral-300 uppercase tracking-wider">Full Name *</label>
                  {fieldErrors.fullName && <span className="text-[7.5px] text-rose-400 truncate max-w-17.5">{fieldErrors.fullName}</span>}
                </div>
                <div className={`flex items-center bg-[#12121c] border ${
                  fieldErrors.fullName ? 'border-rose-500/80 bg-rose-500/5 ring-1 ring-rose-500/30' : 'border-white/10 focus-within:border-[#FF0055]/50'
                } rounded-xl px-2 h-7.5 transition-colors`}>
                  <User className={`w-3 h-3 mr-1 shrink-0 ${fieldErrors.fullName ? 'text-rose-400' : 'text-neutral-500'}`} />
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-[11px] text-white placeholder-neutral-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between items-center">
                  <label className="text-[8px] font-bold text-neutral-300 uppercase tracking-wider">Username *</label>
                  {fieldErrors.username && <span className="text-[7.5px] text-rose-400 truncate max-w-17.5">{fieldErrors.username}</span>}
                </div>
                <div className={`flex items-center bg-[#12121c] border ${
                  fieldErrors.username ? 'border-rose-500/80 bg-rose-500/5 ring-1 ring-rose-500/30' : 'border-white/10 focus-within:border-[#FF0055]/50'
                } rounded-xl px-2 h-7.5 transition-colors`}>
                  <span className={`text-xs mr-1 font-mono ${fieldErrors.username ? 'text-rose-400' : 'text-neutral-500'}`}>@</span>
                  <input
                    type="text"
                    name="username"
                    placeholder="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-[11px] text-white placeholder-neutral-500 outline-none lowercase"
                  />
                </div>
              </div>
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between items-center">
                <label className="text-[8px] font-bold text-neutral-300 uppercase tracking-wider">Email Address *</label>
                {fieldErrors.email && <span className="text-[7.5px] text-rose-400 truncate max-w-35">{fieldErrors.email}</span>}
              </div>
              <div className={`flex items-center bg-[#12121c] border ${
                fieldErrors.email ? 'border-rose-500/80 bg-rose-500/5 ring-1 ring-rose-500/30' : 'border-white/10 focus-within:border-[#FF0055]/50'
              } rounded-xl px-2 h-7.5 transition-colors`}>
                <Mail className={`w-3 h-3 mr-1 shrink-0 ${fieldErrors.email ? 'text-rose-400' : 'text-neutral-500'}`} />
                <input
                  type="email"
                  name="email"
                  placeholder="name@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-transparent text-[11px] text-white placeholder-neutral-500 outline-none"
                />
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between items-center">
                  <label className="text-[8px] font-bold text-neutral-300 uppercase tracking-wider">Password *</label>
                  {fieldErrors.password && <span className="text-[7.5px] text-rose-400 truncate max-w-17.5">{fieldErrors.password}</span>}
                </div>
                <div className={`flex items-center bg-[#12121c] border ${
                  fieldErrors.password ? 'border-rose-500/80 bg-rose-500/5 ring-1 ring-rose-500/30' : 'border-white/10 focus-within:border-[#FF0055]/50'
                } rounded-xl px-2 h-7.5 transition-colors`}>
                  <Lock className={`w-3 h-3 mr-1 shrink-0 ${fieldErrors.password ? 'text-rose-400' : 'text-neutral-500'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Min 8"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-[11px] text-white placeholder-neutral-500 outline-none min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-neutral-500 hover:text-neutral-300 p-0.5 cursor-pointer shrink-0"
                  >
                    {showPassword ? <Eye className="w-3 h-3 text-[#FF2E7E]" /> : <EyeOff className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between items-center">
                  <label className="text-[8px] font-bold text-neutral-300 uppercase tracking-wider">Confirm *</label>
                  {fieldErrors.confirmPassword && <span className="text-[7.5px] text-rose-400 truncate max-w-17.5">{fieldErrors.confirmPassword}</span>}
                </div>
                <div className={`flex items-center bg-[#12121c] border ${
                  fieldErrors.confirmPassword ? 'border-rose-500/80 bg-rose-500/5 ring-1 ring-rose-500/30' : 'border-white/10 focus-within:border-[#FF0055]/50'
                } rounded-xl px-2 h-7.5 transition-colors`}>
                  <Lock className={`w-3 h-3 mr-1 shrink-0 ${fieldErrors.confirmPassword ? 'text-rose-400' : 'text-neutral-500'}`} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-[11px] text-white placeholder-neutral-500 outline-none min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-neutral-500 hover:text-neutral-300 p-0.5 cursor-pointer shrink-0"
                  >
                    {showConfirmPassword ? <Eye className="w-3 h-3 text-[#FF2E7E]" /> : <EyeOff className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="btn-primary mt-1 w-full py-2 text-xs gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Validating & Creating...</span>
              ) : (
                <>
                  <span>Sign Up & Join Sktube</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          <div className="mt-1.5 pt-1.5 border-t border-white/10 text-center">
            <p className="text-[10px] text-neutral-400">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#FF2E7E] hover:underline ml-1">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 🖥️ LAPTOP, DESKTOP & 4K VIEW: Full-Page Cinematic Studio Layout (>= lg) */}
      {/* ============================================================== */}
      <div className="hidden lg:flex flex-col gap-6 w-full py-4 relative z-10">
        <Register.Header />

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
            <span>Account created successfully! Redirecting you to login...</span>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6 items-start">
          {/* LEFT: Channel Preview & Benefits (5 cols) */}
          <div className="col-span-5 flex flex-col gap-5">
            <Register.ChannelPreview 
              formData={formData} 
              coverPreview={coverPreview} 
              avatarPreview={avatarPreview} 
            />
            <Register.Benefits />
          </div>

          {/* RIGHT: Form (7 cols) */}
          <div className="col-span-7 flex flex-col gap-5">
            <div className="glass-panel p-7 2xl:p-9 rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div>
                  <h2 className="text-lg 2xl:text-xl font-extrabold text-white">Account Information</h2>
                  <p className="text-xs 2xl:text-sm text-neutral-400">Fill in your profile details to configure your studio.</p>
                </div>
                <span className="text-xs text-neutral-500 font-medium">Fields with * are mandatory</span>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Media Assets */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs 2xl:text-sm font-bold text-neutral-200">
                    Channel Media (Banner & Profile Avatar) *
                  </label>
                  
                  <div className={`relative rounded-2xl overflow-hidden bg-neutral-900 border ${
                    fieldErrors.avatar ? 'border-rose-500 ring-2 ring-rose-500/40' : 'border-white/10'
                  } h-32 2xl:h-36 flex flex-col justify-end p-4 transition-colors`}>
                    
                    {coverPreview ? (
                      <img src={coverPreview} alt="Cover Banner" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 bg-linear-to-r from-neutral-900 via-neutral-800 to-neutral-900 flex flex-col items-center justify-center text-center p-4">
                        <span className="text-xs text-neutral-400 font-semibold">Recommended Cover: 1920x400 (Optional)</span>
                        <span className="text-[10px] text-neutral-500">Supports JPG, PNG up to 5MB</span>
                      </div>
                    )}

                    <label className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-xs text-neutral-200 hover:text-white cursor-pointer border border-white/10 flex items-center gap-1.5 transition-all shadow-lg">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{coverPreview ? 'Change Banner' : 'Upload Banner'}</span>
                      <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                    </label>

                    <div className="relative z-10 flex items-center gap-3">
                      <label className="relative group cursor-pointer" title="Upload Profile Picture">
                        <div className={`w-14 h-14 2xl:w-16 2xl:h-16 rounded-2xl overflow-hidden bg-neutral-800 ring-4 ${
                          fieldErrors.avatar ? 'ring-rose-500' : 'ring-[#FF0055]'
                        } shadow-2xl flex items-center justify-center`}>
                          {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-7 h-7 text-neutral-400" />
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                          <Camera className="w-5 h-5" />
                        </div>
                        <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                      </label>

                      <div className="flex flex-col">
                        <span className="text-xs 2xl:text-sm font-extrabold text-white">Profile Avatar *</span>
                        <span className={`text-[11px] 2xl:text-xs ${fieldErrors.avatar ? 'text-rose-400 font-bold' : 'text-neutral-300'}`}>
                          {fieldErrors.avatar || 'Click avatar icon to upload portrait'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2-Column Name & Handle Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs 2xl:text-sm font-bold text-neutral-300">Full Name *</label>
                      {fieldErrors.fullName && (
                        <span className="text-[10px] text-rose-400 font-semibold truncate">{fieldErrors.fullName}</span>
                      )}
                    </div>
                    <div className={`flex items-center bg-[#12121c] border ${
                      fieldErrors.fullName ? 'border-rose-500/80 bg-rose-500/5 ring-1 ring-rose-500/30' : 'border-white/10 focus-within:border-[#FF0055]/60'
                    } rounded-xl px-3 h-11 2xl:h-12 transition-colors`}>
                      <User className={`w-4 h-4 mr-2 shrink-0 ${fieldErrors.fullName ? 'text-rose-400' : 'text-neutral-500'}`} />
                      <input
                        type="text"
                        name="fullName"
                        placeholder="e.g. John Doe"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full bg-transparent text-xs 2xl:text-sm text-white placeholder-neutral-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs 2xl:text-sm font-bold text-neutral-300">Channel Handle *</label>
                      {fieldErrors.username && (
                        <span className="text-[10px] text-rose-400 font-semibold truncate">{fieldErrors.username}</span>
                      )}
                    </div>
                    <div className={`flex items-center bg-[#12121c] border ${
                      fieldErrors.username ? 'border-rose-500/80 bg-rose-500/5 ring-1 ring-rose-500/30' : 'border-white/10 focus-within:border-[#FF0055]/60'
                    } rounded-xl px-3 h-11 2xl:h-12 transition-colors`}>
                      <span className={`text-sm mr-1.5 font-mono ${fieldErrors.username ? 'text-rose-400' : 'text-neutral-500'}`}>@</span>
                      <input
                        type="text"
                        name="username"
                        placeholder="johndoe"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full bg-transparent text-xs 2xl:text-sm text-white placeholder-neutral-500 outline-none lowercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Address */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs 2xl:text-sm font-bold text-neutral-300">Email Address *</label>
                    {fieldErrors.email && (
                      <span className="text-[10px] text-rose-400 font-semibold truncate">{fieldErrors.email}</span>
                    )}
                  </div>
                  <div className={`flex items-center bg-[#12121c] border ${
                    fieldErrors.email ? 'border-rose-500/80 bg-rose-500/5 ring-1 ring-rose-500/30' : 'border-white/10 focus-within:border-[#FF0055]/60'
                  } rounded-xl px-3 h-11 2xl:h-12 transition-colors`}>
                    <Mail className={`w-4 h-4 mr-2 shrink-0 ${fieldErrors.email ? 'text-rose-400' : 'text-neutral-500'}`} />
                    <input
                      type="email"
                      name="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-transparent text-xs 2xl:text-sm text-white placeholder-neutral-500 outline-none"
                    />
                  </div>
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs 2xl:text-sm font-bold text-neutral-300">Password *</label>
                      {fieldErrors.password && (
                        <span className="text-[10px] text-rose-400 font-semibold truncate">{fieldErrors.password}</span>
                      )}
                    </div>
                    <div className={`flex items-center bg-[#12121c] border ${
                      fieldErrors.password ? 'border-rose-500/80 bg-rose-500/5 ring-1 ring-rose-500/30' : 'border-white/10 focus-within:border-[#FF0055]/60'
                    } rounded-xl px-3 h-11 2xl:h-12 transition-colors`}>
                      <Lock className={`w-4 h-4 mr-2 shrink-0 ${fieldErrors.password ? 'text-rose-400' : 'text-neutral-500'}`} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Min 8 characters"
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

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs 2xl:text-sm font-bold text-neutral-300">Confirm Password *</label>
                      {fieldErrors.confirmPassword && (
                        <span className="text-[10px] text-rose-400 font-semibold truncate">{fieldErrors.confirmPassword}</span>
                      )}
                    </div>
                    <div className={`flex items-center bg-[#12121c] border ${
                      fieldErrors.confirmPassword ? 'border-rose-500/80 bg-rose-500/5 ring-1 ring-rose-500/30' : 'border-white/10 focus-within:border-[#FF0055]/60'
                    } rounded-xl px-3 h-11 2xl:h-12 transition-colors`}>
                      <Lock className={`w-4 h-4 mr-2 shrink-0 ${fieldErrors.confirmPassword ? 'text-rose-400' : 'text-neutral-500'}`} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full bg-transparent text-xs 2xl:text-sm text-white placeholder-neutral-500 outline-none min-w-0"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-neutral-500 hover:text-neutral-300 p-1 cursor-pointer shrink-0"
                      >
                        {showConfirmPassword ? <Eye className="w-4 h-4 text-[#FF2E7E]" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
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
                      <span>Creating Your Creator Channel...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign Up & Launch Creator Studio</span>
                      <ArrowRight className="w-4.5 h-4.5 stroke-[2.5]" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-neutral-400">
                  <span>
                    Already registered?{' '}
                    <Link to="/login" className="font-bold text-[#FF2E7E] hover:underline ml-1">
                      Sign In here
                    </Link>
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    By signing up you agree to Sktube Creator Guidelines
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
Register.Header = RegisterHeader;
Register.ChannelPreview = RegisterChannelPreview;
Register.Benefits = RegisterBenefits;

export default Register;
