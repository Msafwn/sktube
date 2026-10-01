import React from 'react';
import { Link } from 'react-router-dom';
import { Play, CheckCircle2, X } from 'lucide-react';

const WatchLaterCard = ({ video, index, formatDuration, onRemove, onPlay }) => (
  <div className="glass-card p-3.5 sm:p-4 2xl:p-5 rounded-2xl flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center group border border-white/5 hover:border-[#FF0055]/30 transition-all duration-300 shadow-xl relative">
    {/* Index Indicator */}
    <div className="hidden sm:flex items-center justify-center w-6 text-xs font-bold text-neutral-500 group-hover:text-neutral-300 shrink-0">
      {index + 1}
    </div>

    {/* Thumbnail */}
    <div 
      onClick={() => onPlay(video)}
      className="relative aspect-video w-full sm:w-60 2xl:w-72 sm:min-w-60 2xl:min-w-72 rounded-xl overflow-hidden bg-neutral-900 shrink-0 cursor-pointer shadow-md"
    >
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
        <span className="absolute top-2 left-2 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase shadow-md">
          LIVE
        </span>
      )}

      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
        <div className="w-11 h-11 rounded-full bg-[#FF0055] text-white flex items-center justify-center shadow-lg shadow-[#FF0055]/50 transform group-hover:scale-110 transition-transform">
          <Play className="w-5 h-5 fill-white ml-0.5" />
        </div>
      </div>
    </div>

    {/* Video Details */}
    <div className="flex flex-col justify-between flex-1 min-w-0 pr-8">
      <div>
        <h3 
          onClick={() => onPlay(video)}
          className="text-sm sm:text-base 2xl:text-lg font-bold text-white line-clamp-2 leading-snug group-hover:text-[#FF2E7E] transition-colors cursor-pointer"
        >
          {video.title}
        </h3>

        <Link 
          to={`/channel/${video.owner?.username || video.owner?._id || ''}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-2 text-xs 2xl:text-sm text-neutral-400 hover:text-white mt-2.5 transition-colors"
        >
          {video.owner?.avatar && (
            <img 
              src={video.owner.avatar} 
              alt={video.owner.fullName || "Creator"} 
              className="w-4 h-4 rounded-full object-cover" 
            />
          )}
          <span className="font-semibold text-neutral-300 truncate hover:underline">
            {video.owner?.fullName || video.owner?.username || "Creator"}
          </span>
          <CheckCircle2 className="w-3.5 h-3.5 text-[#FF0055] shrink-0" />
        </Link>

        <div className="flex items-center gap-2 text-[11px] 2xl:text-xs text-neutral-500 mt-1.5">
          <span>{typeof video.views === 'number' ? video.views.toLocaleString() : video.views || 0} views</span>
          <span>•</span>
          <span>Added to Queue</span>
        </div>
      </div>
    </div>

    {/* Remove Action */}
    <button
      onClick={() => onRemove(video._id)}
      className="absolute top-3.5 right-3.5 p-2 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
      title="Remove from Watch Later"
    >
      <X className="w-4 h-4 2xl:w-5 2xl:h-5" />
    </button>
  </div>
);

export default WatchLaterCard;
