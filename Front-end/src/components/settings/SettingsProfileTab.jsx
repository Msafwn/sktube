import React from 'react';
import { User, Mail, Loader2, CheckCircle2 } from 'lucide-react';

export const SettingsProfileTab = ({
  fullName,
  setFullName,
  email,
  setEmail,
  username,
  loading,
  onSubmit
}) => (
  <form onSubmit={onSubmit} className="glass-panel p-4 sm:p-7 2xl:p-10 min-[2560px]:p-12 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl flex flex-col gap-4 sm:gap-6 2xl:gap-8">
    <div className="flex items-center justify-between pb-3 2xl:pb-4 border-b border-white/5">
      <span className="text-xs sm:text-sm 2xl:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2.5">
        <User className="w-4 h-4 2xl:w-5 2xl:h-5 text-[#FF2E7E]" />
        Channel Profile Information
      </span>
      <span className="text-[10px] sm:text-xs 2xl:text-sm text-neutral-400 font-mono bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
        @{username}
      </span>
    </div>

    {/* Full Name */}
    <div className="flex flex-col gap-1.5 2xl:gap-2">
      <label className="text-xs sm:text-sm 2xl:text-base font-bold text-neutral-300">
        Channel Display Name *
      </label>
      <div className="flex items-center bg-[#12121c] border border-white/10 focus-within:border-[#FF0055]/60 focus-within:ring-2 focus-within:ring-[#FF0055]/30 rounded-xl 2xl:rounded-2xl px-3.5 2xl:px-5 h-10 sm:h-12 2xl:h-14 transition-all">
        <User className="w-4 h-4 2xl:w-5 2xl:h-5 text-neutral-500 mr-2.5 shrink-0" />
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Next-Gen Creator"
          className="w-full bg-transparent text-xs sm:text-sm 2xl:text-base text-white placeholder-neutral-500 outline-none font-medium"
        />
      </div>
    </div>

    {/* Email Address */}
    <div className="flex flex-col gap-1.5 2xl:gap-2">
      <label className="text-xs sm:text-sm 2xl:text-base font-bold text-neutral-300">
        Email Address *
      </label>
      <div className="flex items-center bg-[#12121c] border border-white/10 focus-within:border-[#FF0055]/60 focus-within:ring-2 focus-within:ring-[#FF0055]/30 rounded-xl 2xl:rounded-2xl px-3.5 2xl:px-5 h-10 sm:h-12 2xl:h-14 transition-all">
        <Mail className="w-4 h-4 2xl:w-5 2xl:h-5 text-neutral-500 mr-2.5 shrink-0" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="yourname@domain.com"
          className="w-full bg-transparent text-xs sm:text-sm 2xl:text-base text-white placeholder-neutral-500 outline-none font-medium"
        />
      </div>
    </div>

    {/* Save Button */}
    <button
      type="submit"
      disabled={loading}
      className="btn-primary mt-2 py-3 2xl:py-4 text-xs sm:text-sm 2xl:text-base font-bold gap-2.5 disabled:opacity-50 cursor-pointer shadow-xl shadow-[#FF0055]/30 flex items-center justify-center w-full"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 2xl:w-5 2xl:h-5 animate-spin" />
          <span>Saving Profile to Cloud...</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-4 h-4 2xl:w-5 2xl:h-5" />
          <span>Save Profile Changes</span>
        </>
      )}
    </button>
  </form>
);

export default SettingsProfileTab;
