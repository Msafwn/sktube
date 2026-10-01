import React from 'react';
import { Sparkles, Zap, ShieldCheck } from 'lucide-react';

export const LoginStudioPreview = () => (
  <div className="glass-panel p-5 2xl:p-6 rounded-2xl border border-white/10 flex flex-col gap-4 shadow-xl">
    <div className="flex items-center justify-between pb-2 border-b border-white/5">
      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#FF2E7E]" />
        Your Sktube Hub Experience
      </span>
      <span className="text-[10px] text-emerald-400 font-mono inline-flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live & Synced
      </span>
    </div>

    {/* Quick Hub Stats Card */}
    <div className="grid grid-cols-3 gap-2.5">
      <div className="rounded-xl bg-[#12121c] border border-white/10 p-3 flex flex-col items-center text-center">
        <span className="text-[10px] text-neutral-400 uppercase font-semibold">Streams</span>
        <span className="text-base font-black text-white mt-0.5">4K Ultra</span>
      </div>
      <div className="rounded-xl bg-[#12121c] border border-white/10 p-3 flex flex-col items-center text-center">
        <span className="text-[10px] text-neutral-400 uppercase font-semibold">Feed</span>
        <span className="text-base font-black text-[#FF2E7E] mt-0.5">Curated</span>
      </div>
      <div className="rounded-xl bg-[#12121c] border border-white/10 p-3 flex flex-col items-center text-center">
        <span className="text-[10px] text-neutral-400 uppercase font-semibold">Studio</span>
        <span className="text-base font-black text-purple-400 mt-0.5">Ready</span>
      </div>
    </div>

    {/* Interactive Value Points */}
    <div className="flex flex-col gap-3.5 pt-1">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#FF0055]/15 border border-[#FF0055]/30 flex items-center justify-center text-[#FF2E7E] shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs 2xl:text-sm font-bold text-white">Personalized 4K Stream Feed</h4>
          <p className="text-[11px] 2xl:text-xs text-neutral-400 leading-relaxed">
            Discover tailored video recommendations and trending cinema curated to your taste.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs 2xl:text-sm font-bold text-white">Resume Watching Anywhere</h4>
          <p className="text-[11px] 2xl:text-xs text-neutral-400 leading-relaxed">
            Pick up right where you left off across your laptop, mobile, tablet, and 4K displays.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs 2xl:text-sm font-bold text-white">Direct Channel & Community Access</h4>
          <p className="text-[11px] 2xl:text-xs text-neutral-400 leading-relaxed">
            Subscribe, like, comment, save custom playlists, and manage your creator uploads with ease.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default LoginStudioPreview;
