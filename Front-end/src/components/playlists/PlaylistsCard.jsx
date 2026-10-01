import React from 'react';
import { 
  Play, 
  Layers, 
  Lock, 
  Globe, 
  Trash2 
} from 'lucide-react';

const PlaylistsCard = ({ playlist, onDelete, onPlayAll, onViewDetails }) => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col group border border-white/5 hover:border-[#FF0055]/30 transition-all duration-300 shadow-xl">
      {/* Thumbnail Stack Overlay */}
      <div 
        onClick={() => onViewDetails(playlist)}
        className="relative aspect-video w-full overflow-hidden bg-neutral-900 cursor-pointer"
      >
        <img 
          src={playlist.coverImage || playlist.videos?.[0]?.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=350&fit=crop"} 
          alt={playlist.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />

        {/* Right Gradient Side Stack Indicator */}
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-black/90 via-black/60 to-transparent flex flex-col items-center justify-center gap-1 text-white z-10 backdrop-blur-[1px]">
          <Layers className="w-5 h-5 text-[#FF2E7E]" />
          <span className="text-xs font-black">{playlist.videosCount || playlist.videos?.length || 0}</span>
          <span className="text-[9px] uppercase font-bold text-neutral-300">Videos</span>
        </div>

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 backdrop-blur-[2px]">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF0055] text-white text-xs font-bold shadow-xl shadow-[#FF0055]/50 scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-4 h-4 fill-white" />
            <span>View & Play</span>
          </div>
        </div>

        {/* Privacy Pill */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold flex items-center gap-1 uppercase backdrop-blur-md ${
            playlist.isPrivate 
              ? 'bg-purple-950/80 text-purple-300 border border-purple-500/30' 
              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
          }`}>
            {playlist.isPrivate ? <Lock className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
            {playlist.isPrivate ? 'Private' : 'Public'}
          </span>
        </div>
      </div>

      {/* Playlist Meta Details */}
      <div className="p-4 flex items-start justify-between gap-3 flex-1">
        <div 
          onClick={() => onViewDetails(playlist)}
          className="flex flex-col min-w-0 flex-1 cursor-pointer"
        >
          <h3 className="text-sm 2xl:text-base font-extrabold text-white truncate group-hover:text-[#FF2E7E] transition-colors">
            {playlist.name}
          </h3>
          <p className="text-xs text-neutral-400 line-clamp-1 mt-1">
            {playlist.description || "Collection of curated 4K streams."}
          </p>
          <span className="text-[10px] text-neutral-500 mt-2 font-mono">
            Updated {playlist.updatedAt ? new Date(playlist.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'}
          </span>
        </div>

        <button 
          onClick={() => onDelete(playlist._id)}
          className="text-neutral-500 hover:text-rose-400 p-2 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
          title="Delete Playlist"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PlaylistsCard;
