import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bookmark, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  PlaylistsHeader, 
  PlaylistsCreateModal, 
  PlaylistsDetailModal, 
  PlaylistsCard 
} from '../components/playlists';
import playlistService from '../services/playlistService';
import { useModal } from '../context/ModalContext';

// ==========================================
// MAIN COMPOUND ROOT COMPONENT: Playlists
// ==========================================
const Playlists = () => {
  const { user } = useAuth();
  const { showConfirm, showToast } = useModal();
  const [playlists, setPlaylists] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDetailPlaylist, setSelectedDetailPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleOpenModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleCreatePlaylist = useCallback(async (data) => {
    try {
      const res = await playlistService.createPlaylist({
        name: data.name,
        description: data.description,
        isPrivate: data.isPrivate
      });

      if (res?.data?._id) {
        const createdPlaylist = res.data;
        const selectedIds = data.selectedVideoIds || [];

        if (selectedIds.length > 0) {
          // Add each selected video to playlist
          await Promise.allSettled(
            selectedIds.map((vid) => playlistService.addVideoToPlaylist(createdPlaylist._id, vid))
          );
          
          // Re-fetch populated playlist
          try {
            const detailRes = await playlistService.getPlaylistById(createdPlaylist._id);
            if (detailRes?.data) {
              setPlaylists((prev) => [detailRes.data, ...prev]);
              return;
            }
          } catch {}
        }

        createdPlaylist.videos = selectedIds;
        createdPlaylist.videosCount = selectedIds.length;
        setPlaylists((prev) => [createdPlaylist, ...prev]);
      } else {
        const newPlaylist = {
          _id: `pl-${Date.now()}`,
          name: data.name,
          description: data.description,
          isPrivate: data.isPrivate,
          coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=350&fit=crop",
          videos: data.selectedVideoIds || [],
          videosCount: data.selectedVideoIds?.length || 0,
          updatedAt: new Date().toISOString()
        };
        setPlaylists((prev) => [newPlaylist, ...prev]);
      }
    } catch (e) {
      console.error("Error creating playlist:", e);
    }
  }, []);

  const handleDeletePlaylist = useCallback((id) => {
    showConfirm({
      title: 'Delete Playlist?',
      message: 'Are you sure you want to permanently delete this playlist? This action cannot be undone.',
      type: 'danger',
      confirmText: 'Delete Playlist',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setPlaylists((prev) => prev.filter((p) => p._id !== id));
        if (selectedDetailPlaylist?._id === id) {
          setSelectedDetailPlaylist(null);
        }
        try {
          await playlistService.deletePlaylist(id);
          showToast({ message: 'Playlist deleted successfully', type: 'success' });
        } catch (e) {
          console.error("Error deleting playlist:", e);
          showToast({ message: 'Failed to delete playlist', type: 'error' });
        }
      }
    });
  }, [selectedDetailPlaylist, showConfirm, showToast]);

  const handleRemoveVideoFromPlaylist = useCallback(async (playlistId, videoId) => {
    try {
      await playlistService.removeVideoFromPlaylist(playlistId, videoId);
      
      setPlaylists((prev) =>
        prev.map((p) =>
          p._id === playlistId
            ? {
                ...p,
                videos: p.videos?.filter((v) => (typeof v === 'object' ? v._id : v) !== videoId)
              }
            : p
        )
      );

      setSelectedDetailPlaylist((prev) =>
        prev && prev._id === playlistId
          ? {
              ...prev,
              videos: prev.videos?.filter((v) => (typeof v === 'object' ? v._id : v) !== videoId)
            }
          : prev
      );
    } catch (err) {
      console.error("Error removing video from playlist:", err);
    }
  }, []);

  const navigate = useNavigate();

  const handlePlayVideo = useCallback((videoId) => {
    if (videoId) {
      navigate(`/watch?v=${videoId}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [navigate]);

  const handleViewDetails = useCallback(async (playlist) => {
    setSelectedDetailPlaylist(playlist);
    try {
      const res = await playlistService.getPlaylistById(playlist._id);
      if (res?.data) {
        setSelectedDetailPlaylist(res.data);
      }
    } catch (err) {
      console.error("Error fetching detailed playlist:", err);
    }
  }, []);

  const handlePlayAll = useCallback((playlist) => {
    const firstVideo = playlist.videos?.[0];
    const firstVideoId = typeof firstVideo === 'object' ? firstVideo?._id : firstVideo;
    if (firstVideoId) {
      navigate(`/watch?v=${firstVideoId}`);
    } else {
      handleViewDetails(playlist);
    }
  }, [navigate, handleViewDetails]);

  useEffect(() => {
    let isMounted = true;
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        if (user?._id) {
          const res = await playlistService.getUserPlaylists(user._id);
          if (isMounted) {
            if (Array.isArray(res?.data)) {
              setPlaylists(res.data);
            } else {
              setPlaylists([]);
            }
          }
        } else {
          if (isMounted) setPlaylists([]);
        }
      } catch (err) {
        if (isMounted) setPlaylists([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPlaylists();
    return () => {
      isMounted = false;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF2E7E]">
          <Bookmark className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Save and Organize Streams</h2>
        <p className="text-xs text-neutral-400">
          Sign in to create, edit, and play customized 4K playlists on Sktube.
        </p>
        <Link
          to="/login"
          className="btn-primary px-6 py-2.5 text-sm gap-2 mt-2 shadow-lg shadow-[#FF0055]/30"
        >
          <span>Sign In</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 container-4k pb-24 sm:pb-12">
      {/* 1. Header */}
      <PlaylistsHeader 
        count={playlists.length} 
        onOpenCreateModal={handleOpenModal} 
      />

      {/* 2. Create Modal */}
      <PlaylistsCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onCreate={handleCreatePlaylist}
      />

      {/* 3. Detail & Video List Modal */}
      <PlaylistsDetailModal
        isOpen={Boolean(selectedDetailPlaylist)}
        onClose={() => setSelectedDetailPlaylist(null)}
        playlist={selectedDetailPlaylist}
        onRemoveVideo={handleRemoveVideoFromPlaylist}
        onPlayVideo={handlePlayVideo}
      />

      {/* 4. 4K Multi-Column Playlists Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[2560px]:grid-cols-6 min-[3200px]:grid-cols-7 min-[3840px]:grid-cols-8 gap-5 sm:gap-6 2xl:gap-7">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse border border-white/5">
              <div className="aspect-video w-full bg-white/10"></div>
              <div className="p-4 space-y-2.5">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-3 bg-white/5 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <div className="glass-panel rounded-3xl border border-white/10 p-12 sm:p-16 flex flex-col items-center justify-center text-center gap-4 shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-[#FF0055]/10 border border-[#FF0055]/20 flex items-center justify-center text-[#FF2E7E] shadow-inner">
            <Bookmark className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white">No Custom Playlists Yet</h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-md mt-1.5">
              Create your first playlist to group your favorite streams, masterclasses, and music tracks together.
            </p>
          </div>
          <button
            onClick={handleOpenModal}
            className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-linear-to-r from-[#FF0055] to-[#FF2E7E] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#FF0055]/30 hover:shadow-[#FF0055]/50 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create First Playlist</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[2560px]:grid-cols-6 min-[3200px]:grid-cols-7 min-[3840px]:grid-cols-8 gap-5 sm:gap-6 2xl:gap-7">
          {playlists.map((playlist) => (
            <PlaylistsCard
              key={playlist._id}
              playlist={playlist}
              onDelete={handleDeletePlaylist}
              onPlayAll={handlePlayAll}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Attach compound subcomponents for dot notation compatibility
Playlists.Header = PlaylistsHeader;
Playlists.CreateModal = PlaylistsCreateModal;
Playlists.DetailModal = PlaylistsDetailModal;
Playlists.Card = PlaylistsCard;

export default Playlists;
