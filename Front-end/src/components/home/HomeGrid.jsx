import React from 'react';
import { Film } from 'lucide-react';
import HomeCard from './HomeCard';

const HomeGrid = ({ videos, formatDuration, onWatch, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[2560px]:grid-cols-6 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
            <div className="aspect-video w-full bg-white/5" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="py-20 text-center glass-panel rounded-2xl border border-white/10 p-8">
        <Film className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">No videos found</h3>
        <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
          No published streams found matching your criteria. Try selecting another category or clear search filters.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg 2xl:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Recommended 4K Streams</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FF0055]/20 text-[#FF2E7E] border border-[#FF0055]/30">
              UHD 60FPS
            </span>
          </h2>
        </div>
      </div>

      {/* 4K Scalable Multi-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[2560px]:grid-cols-6 min-[3200px]:grid-cols-7 min-[3840px]:grid-cols-8 gap-5 sm:gap-6 2xl:gap-7">
        {videos.map((video) => (
          <HomeCard 
            key={video._id} 
            video={video} 
            formatDuration={formatDuration} 
            onWatch={onWatch} 
          />
        ))}
      </div>
    </div>
  );
};

export default HomeGrid;
