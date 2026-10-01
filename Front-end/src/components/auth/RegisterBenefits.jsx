import React from 'react';
import { Sparkles, Zap, ShieldCheck, Globe } from 'lucide-react';

export const RegisterBenefits = () => (
  <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col gap-4 shadow-xl">
    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
      <Sparkles className="w-4 h-4 text-purple-400" />
      Why Creators Choose Sktube
    </span>

    <div className="flex flex-col gap-3.5">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#FF0055]/15 border border-[#FF0055]/30 flex items-center justify-center text-[#FF2E7E] shrink-0 mt-0.5">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white">4K Adaptive HLS Ingestion</h4>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Upload high-bitrate video with auto-transcoding for crystal-clear playback on all devices.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white">Direct Channel Monetization</h4>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Keep up to 85% of subscription revenue and tips with real-time payout analytics.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
          <Globe className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white">Global Edge Network</h4>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Low-latency video delivery across 180+ worldwide edge locations with instant CDN caching.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default RegisterBenefits;
