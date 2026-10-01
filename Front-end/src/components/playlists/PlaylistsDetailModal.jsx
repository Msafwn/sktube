import React from 'react';
import { 
  X, 
  Film, 
  Play, 
  Trash2 
} from 'lucide-react';

const PlaylistsDetailModal = ({ isOpen, onClose, playlist, onRemoveVideo, onPlayVideo }) => {
  if (!isOpen || !playlist) return null;

  const videos = playlist.videos || [];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-white/10">
          <div className="flex flex-col min-w-0 pr-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white truncate">{playlist.name}</h2>
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                playlist.isPrivate ? 'bg-purple-950/80 text-purple-300 border border-purple-500/30' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
              }`}>
                {playlist.isPrivate ? 'Private' : 'Public'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
              {playlist.description || "Custom video collection on Sktube."}
            </p>
            <span className="text-[11px] text-[#FF2E7E] font-bold mt-1">
              {videos.length} {videos.length === 1 ? 'Video' : 'Videos'} in collection
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-white/10">
          {videos.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-2 text-neutral-400">
              <Film className="w-10 h-10 text-neutral-600 mb-1" />
              <p className="text-sm font-bold text-white">No videos in this playlist yet</p>
              <p className="text-xs max-w-xs">
                Browse any video on Home or Explore and click the <strong className="text-white">"+ Playlist"</strong> button on the watch page to add it here.
              </p>
            </div>
          ) : (
            videos.map((vid, idx) => {
              const videoObj = typeof vid === 'object' ? vid : { _id: vid, title: `Video #${idx + 1}` };
              return (
                <div 
                  key={videoObj._id || idx}
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 transition-all group"
                >
                  <span className="text-xs font-bold text-neutral-500 w-5 text-center shrink-0">
                    {idx + 1}
                  </span>

                  <div 
                    onClick={() => onPlayVideo(videoObj._id)}
                    className="relative aspect-video w-28 sm:w-32 rounded-xl overflow-hidden bg-neutral-900 shrink-0 cursor-pointer shadow"
                  >
                    <img 
                      src={videoObj.thumbnail || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&h=180&fit=crop"} 
                      alt={videoObj.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>

                  <div 
                    onClick={() => onPlayVideo(videoObj._id)}
                    className="flex flex-col min-w-0 flex-1 cursor-pointer"
                  >
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#FF2E7E] transition-colors">
                      {videoObj.title}
                    </h4>
                    <span className="text-[11px] text-neutral-400 mt-0.5 truncate">
                      {videoObj.owner?.fullName || videoObj.owner?.username || "Creator"}
                    </span>
                  </div>

                  <button
                    onClick={() => onRemoveVideo(playlist._id, videoObj._id)}
                    className="p-2 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer shrink-0"
                    title="Remove from playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300 transition-colors cursor-pointer"
          >
            Close
          </button>
          {videos.length > 0 && (
            <button
              onClick={() => onPlayVideo(typeof videos[0] === 'object' ? videos[0]._id : videos[0])}
              className="btn-primary px-5 py-2 text-xs font-bold gap-2 shadow-lg shadow-[#FF0055]/30 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Play All</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistsDetailModal;
