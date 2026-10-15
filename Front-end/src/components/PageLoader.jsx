import React from 'react';

const PageLoader = () => {
  return (
    <div className="min-h-[55vh] w-full flex flex-col items-center justify-center p-8 gap-4">
      {/* Animated Glowing Dual Ring */}
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-[#FF0055] animate-spin" />
        <div className="absolute w-8 h-8 rounded-full border-2 border-transparent border-b-[#FF2E7E] animate-spin [animation-direction:reverse] [animation-duration:0.8s]" />
        <div className="absolute inset-0 rounded-full blur-lg bg-[#FF0055]/25 animate-pulse pointer-events-none" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-bold tracking-widest text-neutral-300 uppercase">
          Loading Stream
        </span>
        <span className="text-[10px] text-neutral-500 font-mono">
          Decentralized Cinema 4K
        </span>
      </div>
    </div>
  );
};

export default PageLoader;
