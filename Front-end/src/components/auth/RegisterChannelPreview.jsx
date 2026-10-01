import React from 'react';
import { Tv, User, CheckCircle2, Radio } from 'lucide-react';

export const RegisterChannelPreview = ({ formData = {}, coverPreview, avatarPreview }) => (
  <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col gap-3 shadow-xl">
    <div className="flex items-center justify-between pb-2 border-b border-white/5">
      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
        <Tv className="w-4 h-4 text-[#FF2E7E]" />
        Live Channel Card Preview
      </span>
      <span className="text-[10px] text-neutral-400 font-mono">Real-time preview</span>
    </div>

    <div className="rounded-xl overflow-hidden border border-white/10 bg-[#12121c] relative">
      <div className="h-24 w-full bg-gradient-to-r from-neutral-900 via-[#1f1629] to-neutral-900 relative">
        {coverPreview ? (
          <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs font-medium">
            <span>Cover Banner Preview</span>
          </div>
        )}
      </div>

      <div className="p-4 pt-0 relative flex items-end gap-3.5 -mt-6">
        <div className="w-16 h-16 rounded-2xl bg-neutral-800 ring-4 ring-[#0b0c10] overflow-hidden flex items-center justify-center shadow-2xl relative shrink-0">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-neutral-500" />
          )}
        </div>

        <div className="flex flex-col min-w-0 pb-1">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-extrabold text-white truncate">
              {formData.fullName || 'Your Channel Name'}
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#FF2E7E] shrink-0 fill-[#FF0055]/20" />
          </div>
          <span className="text-xs text-neutral-400 font-mono truncate">
            @{formData.username || 'yourhandle'}
          </span>
        </div>
      </div>

      <div className="px-4 pb-3 flex items-center justify-between text-[11px] text-neutral-400 border-t border-white/5 pt-2.5">
        <span className="inline-flex items-center gap-1 text-emerald-400">
          <Radio className="w-3 h-3 animate-pulse" /> 0 Subscribers • Ready to Stream
        </span>
        <span className="font-semibold text-neutral-300">Creator Tier 1</span>
      </div>
    </div>
  </div>
);

export default RegisterChannelPreview;
