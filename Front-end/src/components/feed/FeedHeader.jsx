import React from 'react';
import { MessageSquare, Flame, Radio } from 'lucide-react';

export const FeedHeader = () => (
  <div className="flex items-center justify-between p-5 2xl:p-7 rounded-2xl glass-panel border border-white/10 shadow-xl">
    <div className="flex items-center gap-3.5">
      <div className="w-12 h-12 rounded-xl bg-linear-to-tr from-[#FF0055] via-[#FF2E7E] to-[#7928CA] flex items-center justify-center text-white shadow-lg shadow-[#FF0055]/30 shrink-0">
        <MessageSquare className="w-6 h-6" />
      </div>
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl 2xl:text-2xl font-black text-white tracking-tight">Community Feed & Posts</h1>
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-[#FF0055]/20 text-[#FF2E7E] border border-[#FF0055]/30 uppercase tracking-wider">
            COMMUNITY
          </span>
        </div>
        <p className="text-xs 2xl:text-sm text-neutral-400 mt-0.5">
          Join conversations, share announcements, live stream updates, and engage with creators.
        </p>
      </div>
    </div>

    <div className="hidden sm:flex items-center gap-2.5">
      <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-neutral-300 inline-flex items-center gap-1.5 whitespace-nowrap">
        <Flame className="w-4 h-4 text-[#FF2E7E]" />
        <span>Trending Pulse</span>
      </span>
      <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 inline-flex items-center gap-1.5 whitespace-nowrap">
        <Radio className="w-4 h-4" />
        <span>Live Sktube</span>
      </span>
    </div>
  </div>
);

export default FeedHeader;
