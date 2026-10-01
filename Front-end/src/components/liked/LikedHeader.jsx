import React from 'react';
import { Heart, Play, Shuffle } from 'lucide-react';

const LikedHeader = ({ count, onPlayAll, onShuffle }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-6 2xl:p-8 rounded-3xl glass-panel border border-white/10 shadow-2xl relative overflow-hidden">
    <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#FF0055]/10 rounded-full blur-3xl pointer-events-none" />
    
    <div className="flex items-center gap-4 relative z-10">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF0055] via-[#FF2E7E] to-[#7928CA] flex items-center justify-center text-white shadow-lg shadow-[#FF0055]/30 shrink-0">
        <Heart className="w-7 h-7 fill-white" />
      </div>
      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl sm:text-2xl 2xl:text-3xl font-black text-white tracking-tight">Liked Streams</h1>
          <span className="text-[11px] font-extrabold px-3 py-0.5 rounded-full bg-[#FF0055]/20 text-[#FF2E7E] border border-[#FF0055]/30 uppercase tracking-wider">
            {count} {count === 1 ? 'STREAM' : 'STREAMS'}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Your collection of liked 4K streams and videos saved in your library.
        </p>
      </div>
    </div>

    {count > 0 && (
      <div className="flex items-center gap-2.5 flex-wrap relative z-10">
        <button
          onClick={onPlayAll}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF0055] to-[#FF2E7E] hover:from-[#ff1a6b] hover:to-[#ff4791] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#FF0055]/25 hover:shadow-[#FF0055]/40 transition-all cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Play All</span>
        </button>

        <button
          onClick={onShuffle}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          title="Shuffle Liked Streams"
        >
          <Shuffle className="w-4 h-4 text-neutral-400" />
        </button>
      </div>
    )}
  </div>
);

export default LikedHeader;
