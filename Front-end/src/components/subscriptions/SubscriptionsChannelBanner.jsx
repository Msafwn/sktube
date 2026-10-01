import React from 'react';
import { 
  X, 
  CheckCircle2, 
  Calendar, 
  Check, 
  UserPlus 
} from 'lucide-react';

const SubscriptionsChannelBanner = ({ channel, videoCount, onDeselect, onToggleSub, isSubscribed }) => {
  if (!channel) return null;

  return (
    <div className="glass-panel rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Cover Image / Gradient */}
      <div className="h-32 sm:h-40 w-full relative overflow-hidden bg-gradient-to-r from-[#1f0010] via-[#0d091a] to-[#050508]">
        {channel.coverImage && (
          <img 
            src={channel.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-[#08080c]/50 to-transparent" />
        
        {/* Deselect / Close Button */}
        <button
          onClick={onDeselect}
          className="absolute top-3.5 right-3.5 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-neutral-300 hover:text-white border border-white/10 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold backdrop-blur-md"
          title="Back to all subscriptions"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">All Channels</span>
        </button>
      </div>

      {/* Channel Profile Info Bar */}
      <div className="px-5 sm:px-8 pb-6 pt-0 relative -mt-12 sm:-mt-14 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-end gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <img 
              src={channel.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop"} 
              alt={channel.fullName} 
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-[#08080c] shadow-2xl bg-neutral-900"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#08080c]" />
          </div>

          {/* Details */}
          <div className="flex flex-col min-w-0 pb-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-2xl font-black text-white truncate">
                {channel.fullName || channel.username}
              </h2>
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF0055] shrink-0" />
            </div>
            
            <p className="text-xs sm:text-sm text-neutral-400 font-mono">
              @{channel.username || "creator"}
            </p>

            <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1.5 flex-wrap">
              <span className="font-semibold text-neutral-200">
                {videoCount} {videoCount === 1 ? 'Stream' : 'Streams'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#FF2E7E]" />
                <span>Subscribed {channel.subscribedAt ? new Date(channel.subscribedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-2 sm:pt-0">
          <button
            onClick={() => onToggleSub(channel._id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-lg ${
              isSubscribed
                ? 'bg-white/10 hover:bg-rose-500/20 text-neutral-200 hover:text-rose-400 border border-white/10'
                : 'bg-gradient-to-r from-[#FF0055] to-[#FF2E7E] text-white shadow-[#FF0055]/30'
            }`}
          >
            {isSubscribed ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Subscribed</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Subscribe</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsChannelBanner;
