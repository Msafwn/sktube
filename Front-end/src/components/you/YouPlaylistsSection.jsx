import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ChevronRight } from 'lucide-react';

const YouPlaylistsSection = ({ playlists }) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-[#FF0055]" />
          <span>Playlists</span>
        </h2>
        <Link to="/playlists" className="text-xs font-bold text-[#FF2E7E] hover:underline flex items-center gap-0.5">
          <span>View all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {playlists.length === 0 ? (
        <div className="glass-card p-5 rounded-2xl border border-white/5 text-center">
          <p className="text-xs text-neutral-400">No playlists created yet.</p>
        </div>
      ) : (
        <div className="flex items-center gap-3.5 overflow-x-auto pb-2 scrollbar-none">
          {playlists.map((pl) => (
            <div 
              key={pl._id} 
              className="flex flex-col w-36 sm:w-44 shrink-0 glass-card rounded-2xl overflow-hidden group cursor-pointer border border-white/5 hover:border-[#FF0055]/30 transition-all"
            >
              <div className="relative aspect-video w-full bg-neutral-900 overflow-hidden">
                <img 
                  src={pl.coverImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=250&fit=crop"} 
                  alt={pl.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                />
                <span className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10">
                  {pl.videosCount || 0} videos
                </span>
              </div>
              <div className="p-2.5 flex flex-col">
                <h3 className="text-xs font-bold text-white line-clamp-1 leading-snug group-hover:text-[#FF2E7E] transition-colors">
                  {pl.name}
                </h3>
                <span className="text-[10px] text-neutral-400 truncate mt-0.5">
                  {pl.isPrivate ? 'Private' : 'Public'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default YouPlaylistsSection;
