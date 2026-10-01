import React from 'react';
import { Tv } from 'lucide-react';

const SubscriptionsHeader = ({ totalCount, selectedChannel }) => (
  <div className="flex items-center justify-between">
    <h2 className="text-lg sm:text-xl 2xl:text-2xl font-black text-white flex items-center gap-2.5 tracking-tight">
      <Tv className="w-5 h-5 2xl:w-6 2xl:h-6 text-[#FF0055]" />
      <span>{selectedChannel ? `Streams by ${selectedChannel.fullName || selectedChannel.username}` : "Latest from Subscriptions"}</span>
    </h2>
    <span className="text-xs text-neutral-400 font-mono">{totalCount} {totalCount === 1 ? 'stream' : 'streams'}</span>
  </div>
);

export default SubscriptionsHeader;
