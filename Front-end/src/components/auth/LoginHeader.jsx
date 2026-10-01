import React from 'react';
import { Flame, Zap, Globe } from 'lucide-react';

export const LoginHeader = () => (
  <div className="flex items-center justify-between p-5 rounded-2xl glass-panel border border-white/10 shadow-xl">
    <div className="flex items-center gap-3.5">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#FF0055] via-[#FF2E7E] to-[#7928CA] flex items-center justify-center text-white shadow-lg shadow-[#FF0055]/30 shrink-0">
        <Flame className="w-7 h-7 animate-pulse text-white fill-white" />
      </div>
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-black text-white tracking-tight">Sign In to Sktube Studio</h1>
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-[#FF0055]/20 text-[#FF2E7E] border border-[#FF0055]/30 uppercase tracking-wider">
            NEO 4K
          </span>
        </div>
        <p className="text-xs text-neutral-400 mt-0.5">
          Manage your 4K stream uploads, live channel statistics, and video library.
        </p>
      </div>
    </div>

    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-neutral-300 inline-flex items-center gap-1.5 whitespace-nowrap">
        <Zap className="w-4 h-4 text-[#FF2E7E]" />
        <span>Instant Auth Ingest</span>
      </span>
      <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 inline-flex items-center gap-1.5 whitespace-nowrap">
        <Globe className="w-4 h-4" />
        <span>4K Global Sync</span>
      </span>
    </div>
  </div>
);

export default LoginHeader;
