import React from 'react';
import { UploadCloud, Sparkles, Globe } from 'lucide-react';

export const UploadHeader = () => (
  <div className="flex items-center justify-between p-5 rounded-2xl glass-panel border border-white/10 relative z-10 shadow-xl">
    <div className="flex items-center gap-3.5">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#FF0055] via-[#FF2E7E] to-[#7928CA] flex items-center justify-center text-white shadow-lg shadow-[#FF0055]/30 shrink-0">
        <UploadCloud className="w-6 h-6" />
      </div>
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl 2xl:text-2xl font-black text-white tracking-tight">Creator Studio</h1>
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-[#FF0055]/20 text-[#FF2E7E] border border-[#FF0055]/30">
            PRO 4K
          </span>
        </div>
        <p className="text-xs 2xl:text-sm text-neutral-400 mt-0.5">
          Publish high-bitrate video streams with Cloudinary & HLS adaptive transcoding
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2.5 shrink-0">
      <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-neutral-300 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
        <Sparkles className="w-4 h-4 text-[#FF2E7E] shrink-0" />
        <span className="whitespace-nowrap">Adaptive Bitrate</span>
      </span>
      <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
        <Globe className="w-4 h-4" />
        <span className="whitespace-nowrap">CDN Ready</span>
      </span>
    </div>
  </div>
);

export default UploadHeader;
