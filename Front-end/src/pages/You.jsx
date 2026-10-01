import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  YouProfileCard, 
  YouHistorySection, 
  YouPlaylistsSection, 
  YouMenuGrid 
} from '../components/you';
import userService from '../services/userService';
import playlistService from '../services/playlistService';

// ==========================================
// MAIN COMPOUND ROOT COMPONENT: You
// ==========================================
const You = () => {
  const { user, logout } = useAuth();
  const [historyVideos, setHistoryVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      try {
        if (user?._id) {
          const [histRes, playRes] = await Promise.allSettled([
            userService.getWatchHistory(),
            playlistService.getUserPlaylists(user._id)
          ]);

          if (isMounted) {
            if (histRes.status === 'fulfilled' && Array.isArray(histRes.value?.data)) {
              setHistoryVideos(histRes.value.data.slice(0, 8));
            }
            if (playRes.status === 'fulfilled' && Array.isArray(playRes.value?.data)) {
              setPlaylists(playRes.value.data.slice(0, 8));
            }
          }
        }
      } catch (e) {
        console.error("Error loading You page data:", e);
      }
    };

    fetchUserData();
    return () => { isMounted = false; };
  }, [user]);

  const handleLogout = useCallback(() => {
    if (logout) logout();
    navigate('/');
  }, [logout, navigate]);

  return (
    <div className="flex flex-col gap-5 sm:gap-6 container-4k pb-24 sm:pb-12 max-w-4xl mx-auto">
      {/* 1. Profile Header / Sign In Banner */}
      <YouProfileCard user={user} logout={handleLogout} />

      {/* 2. History Section */}
      <YouHistorySection historyVideos={historyVideos} />

      {/* 3. Playlists Section */}
      <YouPlaylistsSection playlists={playlists} />

      {/* 4. Menu Actions Grid */}
      <YouMenuGrid user={user} onLogout={handleLogout} />
    </div>
  );
};

// Compound attachments for dot notation compatibility
You.ProfileCard = YouProfileCard;
You.HistorySection = YouHistorySection;
You.PlaylistsSection = YouPlaylistsSection;
You.MenuGrid = YouMenuGrid;

export default You;
