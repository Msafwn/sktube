import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const WatchDescription = ({ 
  video, 
  isDescExpanded, 
  onToggleExpand, 
  formatDate 
}) => {
  return (
    <div 
      onClick={onToggleExpand}
      className="glass-panel p-4 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition-all cursor-pointer select-none"
    >
      <div className="flex items-center gap-3 text-xs sm:text-sm font-extrabold text-white mb-2">
        <span>{typeof video.views === 'number' ? video.views.toLocaleString() : video.views || 0} views</span>
        <span>•</span>
        <span>{formatDate(video.createdAt)}</span>
        {video.isPublished && (
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] uppercase tracking-wider font-bold">
            4K Ultra HD
          </span>
        )}
      </div>

      <p className={`text-xs sm:text-sm text-neutral-300 whitespace-pre-line leading-relaxed ${isDescExpanded ? '' : 'line-clamp-3'}`}>
        {video.description || "No description provided for this video."}
      </p>

      <button 
        type="button" 
        className="text-xs font-bold text-neutral-400 hover:text-white mt-2 flex items-center gap-1 cursor-pointer"
      >
        {isDescExpanded ? (
          <>Show less <ChevronUp className="w-3.5 h-3.5" /></>
        ) : (
          <>...more <ChevronDown className="w-3.5 h-3.5" /></>
        )}
      </button>
    </div>
  );
};

export default WatchDescription;
