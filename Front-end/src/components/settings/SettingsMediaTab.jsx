import React from 'react';
import { Image as ImageIcon, Camera, Loader2, CheckCircle2, UploadCloud } from 'lucide-react';

export const SettingsMediaTab = ({
  avatarFile,
  avatarPreview,
  onAvatarSelect,
  onSaveAvatar,
  coverFile,
  coverPreview,
  onCoverSelect,
  onSaveCover,
  loading
}) => (
  <div className="glass-panel p-4 sm:p-7 2xl:p-10 min-[2560px]:p-12 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl flex flex-col gap-5 sm:gap-7 2xl:gap-9">
    <div className="flex items-center justify-between pb-3 2xl:pb-4 border-b border-white/5">
      <span className="text-xs sm:text-sm 2xl:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2.5">
        <ImageIcon className="w-4 h-4 2xl:w-5 2xl:h-5 text-[#FF2E7E]" />
        Channel Branding & Cloudinary Assets
      </span>
      <span className="text-[10px] sm:text-xs 2xl:text-sm text-neutral-400 font-mono">Ultra-HD JPG, PNG, WEBP</span>
    </div>

    {/* Section A: Profile Picture / Avatar */}
    <div className="flex flex-col gap-3.5 2xl:gap-5 p-4 sm:p-5 2xl:p-7 rounded-2xl 2xl:rounded-3xl bg-white/[0.02] border border-white/5">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm 2xl:text-base font-bold text-white">1. Channel Profile Avatar</span>
        {avatarFile && (
          <span className="text-[9px] sm:text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 truncate max-w-[160px] sm:max-w-none">
            Selected: {avatarFile.name}
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 2xl:gap-8">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 2xl:w-32 2xl:h-32 min-[2560px]:w-36 min-[2560px]:h-36 rounded-2xl 2xl:rounded-3xl overflow-hidden bg-neutral-800 ring-2 2xl:ring-4 ring-[#FF0055]/60 shadow-2xl shrink-0">
          <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
        </div>

        <div className="flex flex-col gap-2.5 flex-1 w-full text-center sm:text-left">
          <div className="grid grid-cols-1 sm:flex items-center gap-2.5 2xl:gap-3.5">
            <label className="btn-secondary py-2 sm:py-2.5 2xl:py-3.5 px-4 2xl:px-6 text-xs sm:text-sm 2xl:text-base font-bold rounded-xl 2xl:rounded-2xl cursor-pointer flex items-center justify-center gap-2 shrink-0 active:scale-95 transition-transform">
              <Camera className="w-4 h-4 2xl:w-5 2xl:h-5 text-[#FF2E7E]" />
              <span>Choose Photo</span>
              <input type="file" accept="image/*" onChange={onAvatarSelect} className="hidden" />
            </label>

            <button
              type="button"
              onClick={onSaveAvatar}
              disabled={!avatarFile || loading}
              className="btn-primary py-2 sm:py-2.5 2xl:py-3.5 px-5 2xl:px-7 text-xs sm:text-sm 2xl:text-base font-bold rounded-xl 2xl:rounded-2xl cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#FF0055]/20 shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 2xl:w-5 2xl:h-5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 2xl:w-5 2xl:h-5" />
              )}
              <span>Save Avatar Picture</span>
            </button>
          </div>
          <span className="text-[10px] sm:text-xs 2xl:text-sm text-neutral-400">
            Square resolution recommended (under 5MB). Tap "Save Avatar" to sync with Cloudinary.
          </span>
        </div>
      </div>
    </div>

    {/* Section B: Cover Banner */}
    <div className="flex flex-col gap-3.5 2xl:gap-5 p-4 sm:p-5 2xl:p-7 rounded-2xl 2xl:rounded-3xl bg-white/[0.02] border border-white/5">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm 2xl:text-base font-bold text-white">2. Channel Cover Banner</span>
        {coverFile && (
          <span className="text-[9px] sm:text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 truncate max-w-[160px] sm:max-w-none">
            Selected: {coverFile.name}
          </span>
        )}
      </div>

      <div className="relative rounded-xl sm:rounded-2xl 2xl:rounded-3xl overflow-hidden bg-neutral-900 border border-white/10 h-28 sm:h-44 2xl:h-60 min-[2560px]:h-72 min-[3840px]:h-80 w-full flex items-center justify-center shadow-inner">
        {coverPreview ? (
          <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-neutral-500">
            <UploadCloud className="w-7 h-7 2xl:w-10 2xl:h-10" />
            <span className="text-xs 2xl:text-sm">No cover banner set yet</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:flex items-center gap-2.5 2xl:gap-3.5 pt-1">
        <label className="btn-secondary py-2 sm:py-2.5 2xl:py-3.5 px-4 2xl:px-6 text-xs sm:text-sm 2xl:text-base font-bold rounded-xl 2xl:rounded-2xl cursor-pointer flex items-center justify-center gap-2 shrink-0 active:scale-95 transition-transform">
          <ImageIcon className="w-4 h-4 2xl:w-5 2xl:h-5 text-pink-400" />
          <span>Choose Banner</span>
          <input type="file" accept="image/*" onChange={onCoverSelect} className="hidden" />
        </label>

        <button
          type="button"
          onClick={onSaveCover}
          disabled={!coverFile || loading}
          className="btn-primary py-2 sm:py-2.5 2xl:py-3.5 px-5 2xl:px-7 text-xs sm:text-sm 2xl:text-base font-bold rounded-xl 2xl:rounded-2xl cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#FF0055]/20 shrink-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 2xl:w-5 2xl:h-5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4 2xl:w-5 2xl:h-5" />
          )}
          <span>Save Channel Banner</span>
        </button>
      </div>
      <span className="text-[10px] sm:text-xs 2xl:text-sm text-neutral-400">
        Recommended 4K resolution: 2560x1440 or 1920x400 (under 5MB).
      </span>
    </div>
  </div>
);

export default SettingsMediaTab;
