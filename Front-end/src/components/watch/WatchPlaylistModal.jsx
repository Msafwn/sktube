import React from 'react';
import { 
  FolderPlus, 
  X, 
  Check, 
  Plus 
} from 'lucide-react';

const WatchPlaylistModal = ({
  isOpen,
  onClose,
  loadingPlaylists,
  userPlaylists,
  video,
  onTogglePlaylist,
  showNewPlaylistForm,
  onOpenNewPlaylistForm,
  onCloseNewPlaylistForm,
  newPlaylistName,
  onNewPlaylistNameChange,
  newPlaylistDesc,
  onNewPlaylistDescChange,
  onCreatePlaylistInline,
  creatingPlaylist
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-[#FF0055]" />
            <h3 className="text-base font-extrabold text-white">Save video to...</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Playlists List */}
        {loadingPlaylists ? (
          <div className="py-6 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-[#FF0055] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-neutral-400 font-medium">Loading your playlists...</span>
          </div>
        ) : userPlaylists.length === 0 && !showNewPlaylistForm ? (
          <div className="py-6 text-center flex flex-col items-center gap-2">
            <FolderPlus className="w-10 h-10 text-neutral-600 mb-1" />
            <p className="text-xs text-neutral-300 font-bold">No playlists yet</p>
            <p className="text-[11px] text-neutral-500 max-w-xs">
              Create a custom collection to easily organize and watch your favorite streams.
            </p>
          </div>
        ) : (
          <div className="max-h-52 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-white/10">
            {userPlaylists.map((pl) => {
              const isChecked = pl.videos?.some((v) => (typeof v === 'object' ? v._id : v) === video?._id);
              return (
                <label 
                  key={pl._id}
                  onClick={(e) => {
                    e.preventDefault();
                    onTogglePlaylist(pl);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                      isChecked 
                        ? 'bg-[#FF0055] border-[#FF0055] text-white shadow-md shadow-[#FF0055]/30' 
                        : 'border-white/20 bg-black/40'
                    }`}>
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-bold text-neutral-200 truncate">{pl.name}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono shrink-0">
                    {pl.videos?.length || 0} videos
                  </span>
                </label>
              );
            })}
          </div>
        )}

        {/* Inline New Playlist Form */}
        {showNewPlaylistForm ? (
          <form onSubmit={onCreatePlaylistInline} className="pt-2 border-t border-white/10 flex flex-col gap-2.5">
            <input 
              type="text" 
              placeholder="Playlist Title *"
              value={newPlaylistName}
              onChange={(e) => onNewPlaylistNameChange(e.target.value)}
              className="bg-[#12121c] border border-white/10 focus:border-[#FF0055]/50 rounded-xl px-3 h-9 text-xs text-white placeholder-neutral-500 outline-none"
              autoFocus
            />
            <input 
              type="text" 
              placeholder="Description (optional)"
              value={newPlaylistDesc}
              onChange={(e) => onNewPlaylistDescChange(e.target.value)}
              className="bg-[#12121c] border border-white/10 focus:border-[#FF0055]/50 rounded-xl px-3 h-9 text-xs text-white placeholder-neutral-500 outline-none"
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onCloseNewPlaylistForm}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-neutral-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newPlaylistName.trim() || creatingPlaylist}
                className="btn-primary px-4 py-1.5 text-xs font-bold disabled:opacity-40 cursor-pointer"
              >
                {creatingPlaylist ? 'Creating...' : 'Create & Add'}
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={onOpenNewPlaylistForm}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-[#FF0055]/10 hover:text-[#FF2E7E] border border-white/10 text-xs font-bold text-neutral-300 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create new playlist</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default WatchPlaylistModal;
