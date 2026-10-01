import React from 'react';
import { Users } from 'lucide-react';

const SubscriptionsStoryBar = ({ channels, selectedChannelId, onSelectChannel }) => {
  if (channels.length === 0) return null;

  return (
    <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
      {/* "All Channels" pill */}
      <button
        type="button"
        onClick={() => onSelectChannel(null)}
        className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
      >
        <div className={`w-14 h-14 2xl:w-16 2xl:h-16 rounded-full flex items-center justify-center transition-all ${
          selectedChannelId === null 
            ? 'bg-gradient-to-tr from-[#FF0055] to-[#FF2E7E] text-white ring-4 ring-[#FF0055]/30 shadow-lg shadow-[#FF0055]/40 scale-105' 
            : 'bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
        }`}>
          <Users className="w-6 h-6" />
        </div>
        <span className={`text-[11px] 2xl:text-xs font-semibold max-w-[80px] truncate text-center transition-colors ${
          selectedChannelId === null ? 'text-[#FF2E7E] font-bold' : 'text-neutral-400 group-hover:text-neutral-200'
        }`}>
          All Channels
        </span>
      </button>

      {channels.map((ch) => {
        const isSelected = selectedChannelId === ch._id;
        return (
          <button
            key={ch._id || ch.username} 
            type="button"
            onClick={() => onSelectChannel(ch._id)}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
          >
            <div className={`p-0.5 rounded-full transition-all ${
              isSelected 
                ? 'bg-gradient-to-tr from-[#FF0055] to-[#7928CA] ring-4 ring-[#FF0055]/40 shadow-lg shadow-[#FF0055]/30 scale-110' 
                : 'ring-2 ring-white/10 hover:ring-[#FF0055]/50 group-hover:scale-105'
            }`}>
              <img 
                src={ch.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"} 
                alt={ch.fullName || ch.username} 
                className="w-13 h-13 2xl:w-15 2xl:h-15 rounded-full object-cover bg-neutral-800" 
              />
            </div>
            <span className={`text-[11px] 2xl:text-xs max-w-[80px] truncate text-center transition-colors ${
              isSelected ? 'text-white font-bold' : 'text-neutral-400 group-hover:text-white'
            }`}>
              {ch.fullName || ch.username}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SubscriptionsStoryBar;
