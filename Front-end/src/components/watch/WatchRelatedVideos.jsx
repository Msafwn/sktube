import React from 'react';
import { Sparkles } from 'lucide-react';

const WatchRelatedVideos = ({ 
  recommendedVideos, 
  onSelectVideo, 
  formatDuration, 
  formatDate 
}) => {
  return (
    <div className="lg:col-span-4 min-[2560px]:col-span-4 min-[3400px]:col-span-3 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2 tracking-tight">
          <Sparkles className="w-4 h-4 text-[#FF0055]" />
          Up Next
        </h2>
        <span className="text-xs text-neutral-400">Autoplay On</span>
      </div>

      {/* Up Next Video List */}
      <div className="flex flex-col gap-3">
        {recommendedVideos.map((rec) => (
          <div 
            key={rec._id}
            onClick={() => onSelectVideo(rec._id)}
            className="flex gap-3 p-2 rounded-xl glass-card border border-white/5 hover:border-[#FF0055]/30 group cursor-pointer transition-all duration-200"
          >
            {/* Compact Thumbnail */}
            <div className="relative aspect-video w-36 sm:w-40 rounded-lg overflow-hidden bg-neutral-900 shrink-0">
              <img 
                src={rec.thumbnail} 
                alt={rec.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-xs text-white text-[9px] font-bold px-1 rounded">
                {formatDuration(rec.duration)}
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center flex-1 min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-[#FF2E7E] transition-colors">
                {rec.title}
              </h3>
              <p className="text-[11px] text-neutral-400 truncate mt-1">
                {rec.owner?.fullName || "Creator Studio"}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 mt-0.5">
                <span>{typeof rec.views === 'number' ? rec.views.toLocaleString() : rec.views || 0} views</span>
                <span>•</span>
                <span>{formatDate(rec.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchRelatedVideos;
