import React from 'react';
import { Play, Radio, CheckCircle2, Heart } from 'lucide-react';

const LikedCard = ({ video, formatDuration, onUnlike, onWatch }) => (
  <div 
    onClick={() => onWatch(video)}
    className="glass-card p-3.5 sm:p-4 2xl:p-5 rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center group cursor-pointer border border-white/5 hover:border-[#FF0055]/30 transition-all duration-300 shadow-xl relative"
  >
    {/* Thumbnail */}
    <div className="relative aspect-video w-full sm:w-56 2xl:w-64 sm:min-w-56 2xl:min-w-64 rounded-xl overflow-hidden bg-neutral-900 shrink-0 shadow-md">
      <img 
        src={video.thumbnail || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=350&fit=crop"} 
        alt={video.title} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
      />
      
      {video.duration ? (
        <span className="absolute bottom-2 right-2 bg-black/85 backdrop-blur-md text-white text-[10px] 2xl:text-xs font-bold px-1.5 py-0.5 rounded border border-white/10">
          {formatDuration(video.duration)}
        </span>
      ) : null}

      {video.isLive && (
        <span className="absolute top-2 left-2 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase shadow-md flex items-center gap-1">
          <Radio className="w-2.5 h-2.5 animate-pulse" /> LIVE
        </span>
      )}

      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
        <div className="w-11 h-11 rounded-full bg-[#FF0055] text-white flex items-center justify-center shadow-lg shadow-[#FF0055]/50 transform group-hover:scale-110 transition-transform">
          <Play className="w-5 h-5 fill-white ml-0.5" />
        </div>
      </div>
    </div>

    {/* Video Meta */}
    <div className="flex flex-col justify-between flex-1 min-w-0 pr-8">
      <div>
        <h3 className="text-sm sm:text-base 2xl:text-lg font-bold text-white line-clamp-2 leading-snug group-hover:text-[#FF2E7E] transition-colors">
          {video.title}
        </h3>

        <div className="flex items-center gap-2 text-xs 2xl:text-sm text-neutral-400 mt-2">
          {video.owner?.avatar && (
            <img 
              src={video.owner.avatar} 
              alt={video.owner.fullName || "Creator"} 
              className="w-4 h-4 rounded-full object-cover" 
            />
          )}
          <span className="font-semibold text-neutral-300 truncate">
            {video.owner?.fullName || video.owner?.username || "Creator"}
          </span>
          <CheckCircle2 className="w-3.5 h-3.5 text-[#FF0055] shrink-0" />
        </div>

        <div className="flex items-center gap-2 text-[11px] 2xl:text-xs text-neutral-500 mt-1.5">
          <span>{typeof video.views === 'number' ? video.views.toLocaleString() : video.views || 0} views</span>
          <span>•</span>
          <span>Liked {video.likedAt ? new Date(video.likedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'}</span>
        </div>
      </div>
    </div>

    {/* Unlike Action */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        onUnlike(video._id);
      }}
      className="absolute top-3.5 right-3.5 p-2 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
      title="Remove from Liked Streams"
    >
      <Heart className="w-4 h-4 2xl:w-5 2xl:h-5 fill-[#FF0055] text-[#FF0055] hover:fill-none transition-colors" />
    </button>
  </div>
);

export default LikedCard;
