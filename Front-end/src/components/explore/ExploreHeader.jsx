import React from 'react';
import { Flame } from 'lucide-react';

const ExploreHeader = () => (
  <div className="flex items-center justify-between p-5 2xl:p-7 rounded-2xl glass-panel border border-white/10 shadow-xl">
    <div className="flex items-center gap-3.5">
      <div className="w-12 h-12 rounded-xl bg-linear-to-tr from-[#FF0055] via-[#FF2E7E] to-[#7928CA] flex items-center justify-center text-white shadow-lg shadow-[#FF0055]/30 shrink-0">
        <Flame className="w-6 h-6 animate-pulse text-white fill-white" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl 2xl:text-2xl font-black text-white tracking-tight">
            Trending & Viral Streams
          </h1>
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-[#FF0055]/20 text-[#FF2E7E] border border-[#FF0055]/30 uppercase tracking-wider">
            TOP #1 RANKED
          </span>
        </div>
        <p className="text-xs 2xl:text-sm text-neutral-400 mt-0.5">
          Discover most-watched 4K broadcasts, top gaming tournaments, tech keynotes, and cinema releases.
        </p>
      </div>
    </div>
  </div>
);

export default ExploreHeader;
