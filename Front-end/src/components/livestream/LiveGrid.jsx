import React from 'react';
import { Radio } from 'lucide-react';

export const LiveGrid = ({ streams, onSelectStream }) => {
  if (streams.length === 0) return null;

  return (
    <div className="flex flex-col gap-3.5 sm:gap-4 mt-2 sm:mt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg 2xl:text-xl font-bold text-white flex items-center gap-2">
          <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
          <span>More 4K Streams & Videos</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5">
        {streams.map((stream) => (
          <div 
            key={stream._id}
            onClick={() => onSelectStream(stream)}
            className="glass-card rounded-2xl overflow-hidden flex flex-col group cursor-pointer border border-white/5 hover:border-[#FF0055]/30 transition-all duration-300"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
              <img 
                src={stream.thumbnail || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=350&fit=crop"} 
                alt={stream.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              />
              <span className="absolute top-2 left-2 bg-rose-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded shadow">
                {stream.isLive ? 'LIVE' : '4K'}
              </span>
              <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                {typeof stream.views === 'number' ? stream.views.toLocaleString() : stream.views || 0} views
              </span>
            </div>

            <div className="p-3 sm:p-3.5 flex gap-2.5 sm:gap-3">
              <img 
                src={stream.owner?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"} 
                alt={stream.owner?.fullName || "Creator"} 
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-1 ring-white/10 shrink-0" 
              />
              <div className="flex flex-col min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-[#FF2E7E] transition-colors">
                  {stream.title}
                </h3>
                <span className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5 sm:mt-1 truncate">
                  {stream.owner?.fullName || "Creator"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveGrid;
