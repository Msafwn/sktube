import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Compass } from 'lucide-react';
import userService from '../services/userService';
import likeService from '../services/likeService';
import { useAuth } from '../context/AuthContext';
import { LikedHeader, LikedCard } from '../components/liked';

// ==========================================
// MAIN COMPOUND ROOT COMPONENT: LikedVideos
// ==========================================
const LikedVideos = () => {
  const { user } = useAuth();
  const [likedList, setLikedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const formatDuration = useCallback((seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = String(Math.floor(seconds % 60)).padStart(2, '0');
    return `${mins}:${secs}`;
  }, []);

  const handleUnlike = useCallback(async (videoId) => {
    setLikedList((prev) => prev.filter((v) => v._id !== videoId));
    try {
      await likeService.toggleVideoLike(videoId);
    } catch (err) {
      console.error('Error unliking video:', err);
    }
  }, []);

  const handleWatch = useCallback((video) => {
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
    if (likedList.length > 0) {
      handleWatch(likedList[0]);
    }
  }, [likedList, handleWatch]);

  const handleShuffle = useCallback(() => {
    if (likedList.length > 1) {
      const shuffled = [...likedList].sort(() => Math.random() - 0.5);
      setLikedList(shuffled);
    }
  }, [likedList]);

  useEffect(() => {
    let isMounted = true;
    const fetchLiked = async () => {
      try {
        setLoading(true);
        if (user?._id) {
          const res = await userService.getLikedVideos();
          if (isMounted) {
            if (Array.isArray(res?.data)) {
              setLikedList(res.data);
            } else {
              setLikedList([]);
            }
          }
        } else {
          if (isMounted) setLikedList([]);
        }
      } catch (err) {
        if (isMounted) {
          setLikedList([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLiked();
    return () => {
      isMounted = false;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF2E7E]">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Your Liked Streams</h2>
        <p className="text-xs text-neutral-400">
          Sign in to see all the videos, tutorials, and streams you've liked on Sktube.
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
    <div className="flex flex-col gap-6 container-4k pb-24 sm:pb-12">
      {/* 1. Header */}
      <LikedHeader 
        count={likedList.length} 
        onPlayAll={handlePlayAll}
        onShuffle={handleShuffle}
      />

      {/* 2. List */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-4 rounded-2xl animate-pulse flex flex-col sm:flex-row gap-4 border border-white/5">
              <div className="aspect-video w-full sm:w-56 rounded-xl bg-white/10"></div>
              <div className="flex-1 space-y-2.5 py-1">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-3 bg-white/5 rounded w-1/3"></div>
                <div className="h-3 bg-white/5 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : likedList.length === 0 ? (
        <div className="glass-panel rounded-3xl border border-white/10 p-12 sm:p-16 flex flex-col items-center justify-center text-center gap-4 shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-[#FF0055]/10 border border-[#FF0055]/20 flex items-center justify-center text-[#FF2E7E] shadow-inner">
            <Heart className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white">No Liked Streams Yet</h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-md mt-1.5">
              Give a thumbs up to any video or stream you enjoy to build your personal favorites collection.
            </p>
          </div>
          <Link
            to="/explore"
            className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-linear-to-r from-[#FF0055] to-[#FF2E7E] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#FF0055]/30 hover:shadow-[#FF0055]/50 transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Popular Streams</span>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {likedList.map((video) => (
            <LikedCard 
              key={video._id} 
              video={video} 
              formatDuration={formatDuration} 
              onUnlike={handleUnlike}
              onWatch={handleWatch}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Attach compound subcomponents for dot notation
LikedVideos.Header = LikedHeader;
LikedVideos.Card = LikedCard;

export default LikedVideos;
