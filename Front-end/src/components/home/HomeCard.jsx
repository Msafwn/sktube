import React from 'react';
import { 
  Radio, 
  Clock, 
  Play, 
  CheckCircle2 
} from 'lucide-react';

const HomeCard = ({ video, formatDuration, onWatch }) => {
  return (
    <div 
      onClick={() => onWatch(video)}
      className="glass-card rounded-2xl overflow-hidden flex flex-col group cursor-pointer border border-white/5 hover:border-[#FF0055]/40 transition-all duration-300"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
        <img 
          src={video.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=350&fit=crop"} 
          alt={video.title} 
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out" 
        />

        {/* Duration / Live Tag */}
        <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white text-[11px] font-bold tracking-wide border border-white/10 flex items-center gap-1">
          {video.isLive ? (
            <span className="text-[#FF0055] font-extrabold flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" /> LIVE
            </span>
          ) : (
            <>
              <Clock className="w-3 h-3 text-[#FF2E7E]" />
              <span>{formatDuration(video.duration)}</span>
            </>
          )}
        </div>

        {/* Hover Play Button Glow Overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-[#FF0055] flex items-center justify-center text-white shadow-xl shadow-[#FF0055]/50 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Meta Content */}
      <div className="p-4 flex gap-3.5 items-start">
        {/* Channel Avatar */}
        <div className="relative shrink-0 mt-0.5">
          <img 
            src={video.owner?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"} 
            alt={video.owner?.fullName || "Creator"} 
            className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/10" 
          />
        </div>

        {/* Info */}
        <div className="flex flex-col flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-[#FF2E7E] transition-colors">
            {video.title}
          </h3>

          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-neutral-400">
            <span className="hover:text-white transition-colors truncate">
              {video.owner?.fullName || "Creator"}
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#FF0055] shrink-0" />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-1">
            <span>{typeof video.views === 'number' ? video.views.toLocaleString() : video.views || 0} views</span>
            <span>•</span>
            <span>{video.createdAt ? new Date(video.createdAt).toLocaleDateString() : "Recently"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeCard;
