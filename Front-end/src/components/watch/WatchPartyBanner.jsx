import React from 'react';

const WatchPartyBanner = ({ 
  activePartyId, 
  partySyncNotice, 
  partyMemberCount, 
  onOpenDetails, 
  onLeave 
}) => {
  if (!activePartyId) return null;

  return (
    <div className="p-3 sm:p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 animate-fadeIn shadow-lg">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 truncate">
            <span>Watch Party Active:</span>
            <span className="font-mono text-emerald-400">{activePartyId}</span>
          </span>
          <span className="text-[11px] text-neutral-400 truncate">
            {partySyncNotice || `${partyMemberCount} ${partyMemberCount === 1 ? 'member' : 'members'} synced in real-time`}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenDetails}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors cursor-pointer"
        >
          Party Details
        </button>
        <button
          onClick={onLeave}
          className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-xs font-bold text-rose-300 transition-colors cursor-pointer"
        >
          Leave
        </button>
      </div>
    </div>
  );
};

export default WatchPartyBanner;
