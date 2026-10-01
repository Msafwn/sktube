import React from 'react';
import { Bookmark, Plus } from 'lucide-react';

const PlaylistsHeader = ({ count, onOpenCreateModal }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-6 2xl:p-8 rounded-3xl glass-panel border border-white/10 shadow-2xl relative overflow-hidden">
    <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#FF0055]/10 rounded-full blur-3xl pointer-events-none" />
    
    <div className="flex items-center gap-4 relative z-10">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF0055] via-[#FF2E7E] to-[#7928CA] flex items-center justify-center text-white shadow-lg shadow-[#FF0055]/30 shrink-0">
        <Bookmark className="w-7 h-7 fill-white" />
      </div>
      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl sm:text-2xl 2xl:text-3xl font-black text-white tracking-tight">Your Playlists</h1>
          <span className="text-[11px] font-extrabold px-3 py-0.5 rounded-full bg-[#FF0055]/20 text-[#FF2E7E] border border-[#FF0055]/30 uppercase tracking-wider">
            {count} {count === 1 ? 'COLLECTION' : 'COLLECTIONS'}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Organize your favorite 4K cinema, coding courses, sound tracks, and tutorial series.
        </p>
      </div>
    </div>

    <button
      onClick={onOpenCreateModal}
      className="btn-primary px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold gap-2 cursor-pointer shadow-lg shadow-[#FF0055]/30 shrink-0 relative z-10"
    >
      <Plus className="w-4 h-4 stroke-[2.5]" />
      <span>Create Playlist</span>
    </button>
  </div>
);

export default PlaylistsHeader;
