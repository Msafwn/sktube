import React from 'react';
import { Clock, Play, CheckCircle2, Eye } from 'lucide-react';

const ExploreTrendingItem = ({ video, rank, formatDuration, onWatch }) => {
  return (
    <div 
      onClick={() => onWatch(video)}
      className="glass-card p-3.5 2xl:p-5 rounded-2xl flex flex-col sm:flex-row gap-4 2xl:gap-6 items-start sm:items-center group cursor-pointer border border-white/5 hover:border-[#FF0055]/40 transition-all duration-300 shadow-xl relative overflow-hidden"
    >
      {/* Rank Indicator Badge */}
      <div className="hidden md:flex items-center justify-center w-8 2xl:w-10 text-xl 2xl:text-2xl font-black text-neutral-500 group-hover:text-[#FF2E7E] transition-colors font-mono shrink-0">
        #{rank}
      </div>

      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full sm:w-64 2xl:w-80 sm:min-w-64 2xl:min-w-80 rounded-xl overflow-hidden bg-neutral-900 shrink-0">
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white text-[10px] 2xl:text-xs font-bold px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#FF2E7E]" />
          <span>{formatDuration(video.duration)}</span>
        </div>
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-linear-to-r from-[#FF0055] to-[#7928CA] text-white text-[9px] font-extrabold uppercase shadow-md">
          {video.tag || 'TRENDING'}
        </div>
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#FF0055] text-white flex items-center justify-center shadow-xl shadow-[#FF0055]/50 scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Video Info Details */}
      <div className="flex flex-col justify-between flex-1 min-w-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="md:hidden text-xs font-black text-[#FF2E7E] font-mono">#{rank} TRENDING</span>
            <span className="text-[10px] 2xl:text-xs font-bold text-neutral-400 uppercase tracking-wider">{video.category || "Cinema"}</span>
          </div>

          <h3 className="text-sm sm:text-base 2xl:text-lg font-bold text-white line-clamp-2 leading-snug group-hover:text-[#FF2E7E] transition-colors">
            {video.title}
          </h3>

          <div className="flex items-center gap-2 text-xs 2xl:text-sm text-neutral-300 mt-2">
            <img 
              src={video.owner?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"} 
              alt={video.owner?.fullName || "Creator"} 
              className="w-6 h-6 rounded-full object-cover ring-1 ring-white/10 shrink-0" 
            />
            <span className="font-semibold truncate">{video.owner?.fullName || "Creator Studio"}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#FF0055] shrink-0" />
          </div>

          <p className="text-xs 2xl:text-sm text-neutral-400 line-clamp-2 mt-2 leading-relaxed">
            {video.description || "High-definition 4K streaming experience with Dolby Audio."}
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] 2xl:text-xs text-neutral-500 mt-3 font-medium">
          <span className="flex items-center gap-1 text-neutral-300 font-semibold">
            <Eye className="w-3.5 h-3.5 text-[#FF2E7E]" />
            {typeof video.views === 'number' ? video.views.toLocaleString() : video.views} views
          </span>
          <span>•</span>
          <span>{video.uploadedAt || "Trending today"}</span>
        </div>
      </div>
    </div>
  );
};

export default ExploreTrendingItem;
