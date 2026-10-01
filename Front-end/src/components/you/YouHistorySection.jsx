import React from 'react';
import { Link } from 'react-router-dom';
import { History, ChevronRight } from 'lucide-react';

const YouHistorySection = ({ historyVideos }) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
          <History className="w-4 h-4 text-[#FF0055]" />
          <span>History</span>
        </h2>
        <Link to="/history" className="text-xs font-bold text-[#FF2E7E] hover:underline flex items-center gap-0.5">
          <span>View all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {historyVideos.length === 0 ? (
        <div className="glass-card p-5 rounded-2xl border border-white/5 text-center">
          <p className="text-xs text-neutral-400">No recently watched streams.</p>
        </div>
      ) : (
        <div className="flex items-center gap-3.5 overflow-x-auto pb-2 scrollbar-none">
          {historyVideos.map((video) => (
            <Link 
              key={video._id} 
              to={video.isLive ? `/live?v=${video._id}` : `/watch?v=${video._id}`}
              className="flex flex-col w-40 sm:w-48 shrink-0 glass-card rounded-2xl overflow-hidden group cursor-pointer border border-white/5 hover:border-[#FF0055]/30 transition-all"
            >
              <div className="relative aspect-video w-full bg-neutral-900 overflow-hidden">
                <img 
                  src={video.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=250&fit=crop"} 
                  alt={video.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                />
                <span className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10">
                  {Math.floor((video.duration || 0) / 60)}:00
                </span>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div className="h-full bg-[#FF0055] w-2/3" />
                </div>
              </div>
              <div className="p-2.5 flex flex-col">
                <h3 className="text-xs font-bold text-white line-clamp-1 leading-snug group-hover:text-[#FF2E7E] transition-colors">
                  {video.title}
                </h3>
                <span className="text-[10px] text-neutral-400 truncate mt-0.5">
                  {video.owner?.fullName || "Creator"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default YouHistorySection;
