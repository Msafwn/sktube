import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Clock, Compass, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import playlistService from '../services/playlistService';
import { WatchLaterHeader, WatchLaterCard } from '../components/watchlater';

// ==========================================
// MAIN COMPOUND ROOT COMPONENT: WatchLater
// ==========================================
const WatchLater = () => {
  const { user } = useAuth();
  const { showConfirm, showToast } = useModal();
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [playlistId, setPlaylistId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Watch Later Playlist from MongoDB
  const fetchWatchLater = useCallback(async () => {
    if (!user?._id) {
      setQueue([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await playlistService.getUserPlaylists(user._id);
      const playlists = Array.isArray(res?.data) ? res.data : [];
      const watchLaterPl = playlists.find((p) => p.name?.toLowerCase() === 'watch later');
      
      if (watchLaterPl) {
        setPlaylistId(watchLaterPl._id);
        setQueue(Array.isArray(watchLaterPl.videos) ? watchLaterPl.videos : []);
      } else {
        setQueue([]);
      }
    } catch (err) {
      console.error("Error fetching watch later playlist:", err);
      setQueue([]);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchWatchLater();
  }, [fetchWatchLater]);

  const formatDuration = useCallback((seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = String(Math.floor(seconds % 60)).padStart(2, '0');
    return `${mins}:${secs}`;
  }, []);

  const totalDuration = useMemo(() => {
    const totalSecs = queue.reduce((acc, curr) => acc + (curr.duration || 0), 0);
    if (totalSecs < 60) return `${totalSecs}s`;
    if (totalSecs < 3600) return `${Math.round(totalSecs / 60)} mins`;
    const hours = (totalSecs / 3600).toFixed(1);
    return `${hours} hrs`;
  }, [queue]);

  const handleRemove = useCallback(async (id) => {
    setQueue((prev) => prev.filter((item) => item._id !== id));
    if (playlistId) {
      try {
        await playlistService.removeVideoFromPlaylist(playlistId, id);
      } catch (e) {
        console.error("Error removing from watch later:", e);
      }
    }
  }, [playlistId]);

  const handleClearAll = useCallback(() => {
    showConfirm({
      title: 'Clear Watch Later?',
      message: 'Are you sure you want to clear your entire Watch Later queue?',
      type: 'danger',
      confirmText: 'Clear Queue',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setQueue([]);
        if (playlistId) {
          try {
            await playlistService.deletePlaylist(playlistId);
            setPlaylistId(null);
            showToast({ message: 'Watch Later queue cleared', type: 'success' });
          } catch (e) {
            console.error("Error clearing watch later:", e);
            showToast({ message: 'Failed to clear queue', type: 'error' });
          }
        }
      }
    });
  }, [playlistId, showConfirm, showToast]);

  const handlePlay = useCallback((video) => {
    if (video?._id) {
      if (video.isLive) {
        navigate(`/live?v=${video._id}`);
      } else {
        navigate(`/watch?v=${video._id}`);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [navigate]);

  const handlePlayAll = useCallback(() => {
    if (queue.length > 0) {
      handlePlay(queue[0]);
    }
  }, [queue, handlePlay]);

  const handleShuffle = useCallback(() => {
    if (queue.length > 1) {
      setQueue((prev) => [...prev].sort(() => Math.random() - 0.5));
    }
  }, [queue.length]);

  return (
    <div className="flex flex-col gap-6 container-4k pb-24 sm:pb-12">
      {/* 1. Header */}
      <WatchLaterHeader 
        count={queue.length} 
        totalDuration={totalDuration} 
        onClearAll={handleClearAll}
        onPlayAll={handlePlayAll}
        onShuffle={handleShuffle}
      />

      {/* 2. List */}
      <div className="flex flex-col gap-3.5">
        {queue.length > 0 ? (
          queue.map((video, index) => (
            <WatchLaterCard
              key={video._id || index}
              video={video}
              index={index}
              formatDuration={formatDuration}
              onRemove={handleRemove}
              onPlay={handlePlay}
            />
          ))
        ) : (
          <div className="glass-panel rounded-3xl border border-white/10 p-12 sm:p-16 flex flex-col items-center justify-center text-center gap-4 shadow-2xl">
            <div className="w-20 h-20 rounded-3xl bg-[#FF0055]/10 border border-[#FF0055]/20 flex items-center justify-center text-[#FF2E7E] shadow-inner">
              <Clock className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white">Your Watch Later Queue is Empty</h3>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-md mt-1.5">
                Save any stream or video by clicking the Save button while watching to keep it handy for later.
              </p>
            </div>
            <Link
              to="/explore"
              className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF0055] to-[#FF2E7E] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#FF0055]/30 hover:shadow-[#FF0055]/50 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Trending Streams</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// Attach compound subcomponents for dot notation
WatchLater.Header = WatchLaterHeader;
WatchLater.Card = WatchLaterCard;

export default WatchLater;
