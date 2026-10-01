import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, X } from 'lucide-react';

const HistoryItem = ({ item, formatDuration, onRemove }) => (
  <div className="glass-card p-3 sm:p-4 2xl:p-5 rounded-2xl flex flex-col sm:flex-row gap-4 group relative border border-white/5 hover:border-[#FF0055]/30 transition-all duration-300">
    {/* Thumbnail with Link */}
    <Link to={item.isLive ? `/live?v=${item._id}` : `/watch?v=${item._id}`} className="relative aspect-video w-full sm:w-60 2xl:w-72 sm:min-w-60 2xl:min-w-72 rounded-xl overflow-hidden bg-neutral-900 shrink-0 block cursor-pointer">
      <img
        src={item.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=350&fit=crop"}
        alt={item.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white text-[10px] 2xl:text-xs font-bold px-1.5 py-0.5 rounded border border-white/10">
        {formatDuration(item.duration)}
      </span>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div
          className="h-full bg-[#FF0055]"
          style={{ width: `${item.progress || 60}%` }}
        ></div>
      </div>
    </Link>

    {/* Video Details */}
    <div className="flex flex-col justify-between flex-1 min-w-0 pr-8">
      <div>
        <Link to={item.isLive ? `/live?v=${item._id}` : `/watch?v=${item._id}`}>
          <h3 className="text-sm 2xl:text-base font-bold text-white line-clamp-2 group-hover:text-[#FF2E7E] transition-colors">
            {item.title}
          </h3>
        </Link>

        <div className="flex items-center gap-2 text-xs 2xl:text-sm text-neutral-400 mt-2">
          <span className="font-semibold text-neutral-300 truncate">
            {item.owner?.fullName || "Creator"}
          </span>
          <CheckCircle2 className="w-3.5 h-3.5 text-[#FF0055] shrink-0" />
        </div>

        <div className="flex items-center gap-2 text-[11px] 2xl:text-xs text-neutral-500 mt-1">
          <span>{item.views || "10K"} views</span>
          <span>•</span>
          <span>{item.watchedAt || "Recently watched"}</span>
        </div>
      </div>

      <p className="hidden sm:block text-xs 2xl:text-sm text-neutral-400 line-clamp-2 mt-2 leading-relaxed">
        {item.description || "Stream high-definition production video."}
      </p>
    </div>

    {/* Remove Action */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        onRemove(item._id);
      }}
      className="absolute top-3 right-3 p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
      title="Remove from history"
    >
      <X className="w-4 h-4 2xl:w-5 2xl:h-5" />
    </button>
  </div>
);

export default HistoryItem;
