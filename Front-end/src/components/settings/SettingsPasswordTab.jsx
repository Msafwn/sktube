import React from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';

export const SettingsPasswordTab = ({
  oldPassword,
  setOldPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showOldPass,
  setShowOldPass,
  showNewPass,
  setShowNewPass,
  loading,
  onSubmit
}) => (
  <form onSubmit={onSubmit} className="glass-panel p-4 sm:p-7 2xl:p-10 min-[2560px]:p-12 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl flex flex-col gap-4 sm:gap-6 2xl:gap-8">
    <div className="flex items-center justify-between pb-3 2xl:pb-4 border-b border-white/5">
      <span className="text-xs sm:text-sm 2xl:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2.5">
        <ShieldCheck className="w-4 h-4 2xl:w-5 2xl:h-5 text-emerald-400" />
        Change Account Password & Security
      </span>
      <span className="text-[10px] sm:text-xs 2xl:text-sm text-neutral-400 font-mono">
        End-to-End Encrypted
      </span>
    </div>

    {/* Old Password */}
    <div className="flex flex-col gap-1.5 2xl:gap-2">
      <label className="text-xs sm:text-sm 2xl:text-base font-bold text-neutral-300">
        Current Password *
      </label>
      <div className="flex items-center bg-[#12121c] border border-white/10 focus-within:border-[#FF0055]/60 focus-within:ring-2 focus-within:ring-[#FF0055]/30 rounded-xl 2xl:rounded-2xl px-3.5 2xl:px-5 h-10 sm:h-12 2xl:h-14 transition-all">
        <Lock className="w-4 h-4 2xl:w-5 2xl:h-5 text-neutral-500 mr-2.5 shrink-0" />
        <input
          type={showOldPass ? 'text' : 'password'}
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="Enter current password"
          className="w-full bg-transparent text-xs sm:text-sm 2xl:text-base text-white placeholder-neutral-500 outline-none font-medium"
        />
        <button
          type="button"
          onClick={() => setShowOldPass(!showOldPass)}
          className="text-neutral-500 hover:text-neutral-300 p-1 2xl:p-1.5 cursor-pointer shrink-0"
        >
          {showOldPass ? (
            <Eye className="w-4 h-4 2xl:w-5 2xl:h-5 text-[#FF2E7E]" />
          ) : (
            <EyeOff className="w-4 h-4 2xl:w-5 2xl:h-5" />
          )}
        </button>
      </div>
    </div>

    {/* New Password */}
    <div className="flex flex-col gap-1.5 2xl:gap-2">
      <label className="text-xs sm:text-sm 2xl:text-base font-bold text-neutral-300">
        New Password (Min 8 characters) *
      </label>
      <div className="flex items-center bg-[#12121c] border border-white/10 focus-within:border-[#FF0055]/60 focus-within:ring-2 focus-within:ring-[#FF0055]/30 rounded-xl 2xl:rounded-2xl px-3.5 2xl:px-5 h-10 sm:h-12 2xl:h-14 transition-all">
        <Lock className="w-4 h-4 2xl:w-5 2xl:h-5 text-neutral-500 mr-2.5 shrink-0" />
        <input
          type={showNewPass ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new strong password"
          className="w-full bg-transparent text-xs sm:text-sm 2xl:text-base text-white placeholder-neutral-500 outline-none font-medium"
        />
        <button
          type="button"
          onClick={() => setShowNewPass(!showNewPass)}
          className="text-neutral-500 hover:text-neutral-300 p-1 2xl:p-1.5 cursor-pointer shrink-0"
        >
          {showNewPass ? (
            <Eye className="w-4 h-4 2xl:w-5 2xl:h-5 text-[#FF2E7E]" />
          ) : (
            <EyeOff className="w-4 h-4 2xl:w-5 2xl:h-5" />
          )}
        </button>
      </div>
    </div>

    {/* Confirm New Password */}
    <div className="flex flex-col gap-1.5 2xl:gap-2">
      <label className="text-xs sm:text-sm 2xl:text-base font-bold text-neutral-300">
        Confirm New Password *
      </label>
      <div className="flex items-center bg-[#12121c] border border-white/10 focus-within:border-[#FF0055]/60 focus-within:ring-2 focus-within:ring-[#FF0055]/30 rounded-xl 2xl:rounded-2xl px-3.5 2xl:px-5 h-10 sm:h-12 2xl:h-14 transition-all">
        <Lock className="w-4 h-4 2xl:w-5 2xl:h-5 text-neutral-500 mr-2.5 shrink-0" />
        <input
          type={showNewPass ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat new password"
          className="w-full bg-transparent text-xs sm:text-sm 2xl:text-base text-white placeholder-neutral-500 outline-none font-medium"
        />
      </div>
    </div>

    <button
      type="submit"
      disabled={loading}
      className="btn-primary mt-2 py-3 2xl:py-4 text-xs sm:text-sm 2xl:text-base font-bold gap-2.5 disabled:opacity-50 cursor-pointer shadow-xl shadow-[#FF0055]/30 flex items-center justify-center w-full"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 2xl:w-5 2xl:h-5 animate-spin" />
          <span>Updating Password...</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-4 h-4 2xl:w-5 2xl:h-5" />
          <span>Update Password</span>
        </>
      )}
    </button>
  </form>
);

export default SettingsPasswordTab;
