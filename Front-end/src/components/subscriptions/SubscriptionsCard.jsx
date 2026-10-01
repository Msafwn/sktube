import React from 'react';
import { 
  Radio, 
  Clock, 
  Play, 
  CheckCircle2 
} from 'lucide-react';

const SubscriptionsCard = ({ video, formatDuration, onWatch, onSelectCreator }) => (
  <div 
    onClick={() => onWatch(video)}
    className="glass-card rounded-2xl overflow-hidden flex flex-col group cursor-pointer border border-white/5 hover:border-[#FF0055]/30 transition-all duration-300"
  >
    <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
      <img 
        src={video.thumbnail || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=350&fit=crop"} 
        alt={video.title} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
      />
      <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white text-[10px] 2xl:text-xs font-bold px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-1">
        {video.isLive ? (
          <span className="text-[#FF0055] flex items-center gap-1 font-bold">
            <Radio className="w-3 h-3 animate-pulse" /> LIVE
          </span>
        ) : (
          <>
            <Clock className="w-3 h-3 text-[#FF2E7E]" />
            <span>{formatDuration(video.duration)}</span>
          </>
        )}
      </div>
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-[#FF0055] flex items-center justify-center text-white shadow-xl shadow-[#FF0055]/50 scale-75 group-hover:scale-100 transition-transform">
          <Play className="w-6 h-6 fill-white ml-0.5" />
        </div>
      </div>
    </div>

    <div className="p-3.5 2xl:p-4 flex gap-3">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (video.owner?._id) onSelectCreator(video.owner._id);
        }}
        className="shrink-0 hover:opacity-80 transition-opacity"
        title="Filter by this creator"
      >
        <img 
          src={video.owner?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"} 
          alt={video.owner?.fullName || "Creator"} 
          className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10" 
        />
      </button>

      <div className="flex flex-col min-w-0 flex-1">
        <h3 className="text-xs sm:text-sm 2xl:text-base font-bold text-white line-clamp-2 leading-snug group-hover:text-[#FF2E7E] transition-colors">
          {video.title}
        </h3>
        
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (video.owner?._id) onSelectCreator(video.owner._id);
          }}
          className="flex items-center gap-1 mt-1 text-left group/author w-fit"
        >
          <span className="text-[11px] 2xl:text-xs text-neutral-400 group-hover/author:text-white font-medium truncate">
            {video.owner?.fullName || video.owner?.username || "Creator"}
          </span>
          <CheckCircle2 className="w-3 h-3 text-[#FF0055] shrink-0" />
        </button>

        <span className="text-[10px] 2xl:text-xs text-neutral-500 mt-0.5">
          {typeof video.views === 'number' ? video.views.toLocaleString() : video.views || 0} views • {video.createdAt ? new Date(video.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Recently"}
        </span>
      </div>
    </div>
  </div>
);

export default SubscriptionsCard;
