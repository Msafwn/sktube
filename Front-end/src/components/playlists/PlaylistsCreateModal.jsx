import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, 
  X, 
  Lock, 
  Globe, 
  Film, 
  Search, 
  Check 
} from 'lucide-react';
import videoService from '../../services/videoService';

const PlaylistsCreateModal = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [availableVideos, setAvailableVideos] = useState([]);
  const [selectedVideoIds, setSelectedVideoIds] = useState([]);
  const [videoSearch, setVideoSearch] = useState('');
  const [loadingVideos, setLoadingVideos] = useState(false);

  // Fetch available videos to choose from when creating playlist
  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      setLoadingVideos(true);
      videoService.getAllVideos({ limit: 40 })
        .then((res) => {
          if (isMounted) {
            const list = res?.data?.videos || (Array.isArray(res?.data) ? res.data : []);
            setAvailableVideos(list);
          }
        })
        .catch(() => {
          if (isMounted) setAvailableVideos([]);
        })
        .finally(() => {
          if (isMounted) setLoadingVideos(false);
        });
    } else {
      setSelectedVideoIds([]);
      setVideoSearch('');
      setName('');
      setDescription('');
    }
    return () => { isMounted = false; };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleVideoSelection = (id) => {
    setSelectedVideoIds((prev) => 
      prev.includes(id) ? prev.filter((vId) => vId !== id) : [...prev, id]
    );
  };

  const filteredVideos = availableVideos.filter((v) => 
    v.title?.toLowerCase().includes(videoSearch.toLowerCase()) ||
    v.owner?.fullName?.toLowerCase().includes(videoSearch.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ 
      name, 
      description, 
      isPrivate,
      selectedVideoIds 
    });
    setName('');
    setDescription('');
    setIsPrivate(false);
    setSelectedVideoIds([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF0055]/20 flex items-center justify-center text-[#FF2E7E]">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">Create New Playlist</h3>
              <p className="text-[11px] text-neutral-400">Add details and select initial videos</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
          {/* Playlist Title */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-neutral-300">Playlist Name *</label>
            <input
              type="text"
              placeholder="e.g. 4K Cinema Masterpieces, Tutorials..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#12121c] border border-white/10 focus:border-[#FF0055]/50 rounded-xl px-3.5 h-10 text-xs sm:text-sm text-white placeholder-neutral-500 outline-none transition-colors"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-neutral-300">Description (Optional)</label>
            <input
              type="text"
              placeholder="Describe what this playlist is about..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-[#12121c] border border-white/10 focus:border-[#FF0055]/50 rounded-xl px-3.5 h-10 text-xs text-white placeholder-neutral-500 outline-none transition-colors"
            />
          </div>

          {/* Visibility */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">Visibility</span>
              <span className="text-[10px] text-neutral-400">
                {isPrivate ? 'Only you can view this playlist' : 'Visible to all viewers on Sktube'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsPrivate(!isPrivate)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isPrivate 
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
              <span>{isPrivate ? 'Private' : 'Public'}</span>
            </button>
          </div>

          {/* Video Selection Section */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-[#FF2E7E]" />
                <span>Select Initial Videos (Optional)</span>
              </label>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#FF0055]/20 text-[#FF2E7E] border border-[#FF0055]/30">
                {selectedVideoIds.length} SELECTED
              </span>
            </div>

            {/* Video Search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Search videos by title..."
                value={videoSearch}
                onChange={(e) => setVideoSearch(e.target.value)}
                className="w-full bg-[#12121c] border border-white/10 rounded-xl pl-8 pr-3 h-8 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#FF0055]/40 transition-colors"
              />
            </div>

            {/* Video Selection List */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-white/10 rounded-xl bg-black/20 p-1.5 border border-white/5">
              {loadingVideos ? (
                <div className="py-6 text-center text-xs text-neutral-400">Loading available videos...</div>
              ) : filteredVideos.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-500">No videos found. You can still create an empty playlist and add videos later.</div>
              ) : (
                filteredVideos.map((vid) => {
                  const isSelected = selectedVideoIds.includes(vid._id);
                  return (
                    <div
                      key={vid._id}
                      onClick={() => toggleVideoSelection(vid._id)}
                      className={`flex items-center gap-3 p-2 rounded-xl border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#FF0055]/15 border-[#FF0055]/40 text-white' 
                          : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5 text-neutral-300'
                      }`}
                    >
                      {/* Checkbox */}
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                        isSelected 
                          ? 'bg-[#FF0055] border-[#FF0055] text-white shadow-md shadow-[#FF0055]/40' 
                          : 'border-white/20 bg-black/40'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      {/* Video Thumbnail */}
                      <img
                        src={vid.thumbnail || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&h=120&fit=crop"}
                        alt={vid.title}
                        className="w-16 h-10 rounded-lg object-cover bg-neutral-900 shrink-0"
                      />

                      {/* Video Info */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-bold truncate leading-tight">{vid.title}</span>
                        <span className="text-[10px] text-neutral-400 mt-0.5 truncate">
                          {vid.owner?.fullName || vid.owner?.username || "Creator"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="btn-primary px-5 py-2 text-xs font-bold disabled:opacity-40 cursor-pointer shadow-lg shadow-[#FF0055]/30"
            >
              <span>Create Playlist {selectedVideoIds.length > 0 ? `(${selectedVideoIds.length} Videos)` : ''}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlaylistsCreateModal;
