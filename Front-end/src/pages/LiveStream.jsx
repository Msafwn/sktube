import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { LiveHero, LiveGrid } from '../components/livestream';
import videoService from '../services/videoService';
import commentService from '../services/commentService';
import likeService from '../services/likeService';
import subscriptionService from '../services/subscriptionService';

// ==========================================
// MAIN COMPOUND ROOT COMPONENT: LiveStream
// ==========================================
const LiveStream = () => {
  const { user } = useAuth();
  const { socket, joinStream, leaveStream, sendStreamMessage, isConnected } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedVideoId = searchParams.get('v');

  const [streams, setStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [liveViewersCount, setLiveViewersCount] = useState(1);

  // Fetch real videos for streaming
  useEffect(() => {
    let isMounted = true;
    const fetchLiveStreams = async () => {
      try {
        setLoading(true);
        const res = await videoService.getAllVideos({ limit: 12, sortBy: 'createdAt', sortType: 'desc' });
        if (isMounted) {
          const videoList = res?.data?.videos || (Array.isArray(res?.data) ? res.data : []);
          setStreams(videoList);

          let current = null;
          if (requestedVideoId) {
            const matched = videoList.find((v) => v._id === requestedVideoId);
            if (matched) {
              current = matched;
            } else {
              try {
                const singleRes = await videoService.getVideoById(requestedVideoId);
                if (singleRes?.data && isMounted) {
                  current = singleRes.data;
                }
              } catch (e) {
                if (videoList.length > 0) current = videoList[0];
              }
            }
          } else if (videoList.length > 0) {
            current = videoList[0];
          }

          if (current && isMounted) {
            setSelectedStream(current);
            setLikesCount(typeof current.likesCount === 'number' ? current.likesCount : (current.views ? Math.floor(current.views / 10) : 0));
            setIsLiked(Boolean(current.isLiked));
            setIsSubscribed(Boolean(current.owner?.isSubscribed));
            
            // Also call getVideoById to log watch history in backend MongoDB
            videoService.getVideoById(current._id).then((resp) => {
              if (resp?.data && isMounted) {
                if (typeof resp.data.isLiked === 'boolean') setIsLiked(resp.data.isLiked);
                if (typeof resp.data.isSubscribed === 'boolean') setIsSubscribed(resp.data.isSubscribed);
                if (typeof resp.data.likesCount === 'number') setLikesCount(resp.data.likesCount);
              }
            }).catch(() => {});
          }
        }
      } catch (err) {
        if (isMounted) {
          setStreams([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLiveStreams();
    return () => { isMounted = false; };
  }, [requestedVideoId]);

  // Fetch initial comments from MongoDB database for selected video
  useEffect(() => {
    let isMounted = true;
    const fetchComments = async () => {
      if (!selectedStream?._id) return;
      try {
        const res = await commentService.getVideoComments(selectedStream._id);
        const commentsList = res?.data?.comments || (Array.isArray(res?.data) ? res.data : []);
        if (isMounted) {
          const formatted = commentsList.map((c) => ({
            id: c._id,
            user: c.owner?.fullName || c.owner?.username || "Viewer",
            avatar: c.owner?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
            text: c.content,
            badge: "MEMBER",
            time: c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"
          }));
          setMessages(formatted);
        }
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };

    fetchComments();
    return () => { isMounted = false; };
  }, [selectedStream?._id]);

  // Real-time WebSocket Room & Message listeners
  useEffect(() => {
    if (!selectedStream?._id || !socket) return;

    const streamId = selectedStream._id;

    // Join room
    joinStream(streamId);

    // Listen for incoming live chat messages
    const handleNewMessage = (msg) => {
      setMessages((prev) => {
        // Prevent duplicate messages if already present
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    // Listen for live concurrent viewers updates
    const handleViewersUpdate = ({ videoId, viewersCount }) => {
      if (videoId === streamId) {
        setLiveViewersCount(viewersCount);
      }
    };

    socket.on('new_stream_message', handleNewMessage);
    socket.on('stream_viewers_update', handleViewersUpdate);

    return () => {
      leaveStream(streamId);
      socket.off('new_stream_message', handleNewMessage);
      socket.off('stream_viewers_update', handleViewersUpdate);
    };
  }, [selectedStream?._id, socket, joinStream, leaveStream]);

  // Handle send comment via WebSocket + REST fallback
  const handleSendMessage = useCallback(async (text) => {
    if (!text?.trim() || !selectedStream?._id) return;

    if (isConnected) {
      // Send real-time over WebSocket (backend broadcasts and persists)
      sendStreamMessage({
        videoId: selectedStream._id,
        text,
        badge: user ? "MEMBER" : null
      });
    } else {
      // Fallback to REST API if socket is temporarily offline
      const tempId = `temp-${Date.now()}`;
      const newMsg = {
        id: tempId,
        user: user?.fullName || "You",
        avatar: user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        text,
        badge: user ? "MEMBER" : null,
        time: "Just now"
      };

      setMessages((prev) => [...prev, newMsg]);

      try {
        const res = await commentService.addComment(selectedStream._id, text);
        if (res?.data?._id) {
          setMessages((prev) => prev.map((m) => m.id === tempId ? { ...m, id: res.data._id } : m));
        }
      } catch (err) {
        console.error("Failed to save comment to database:", err);
      }
    }
  }, [user, selectedStream?._id, isConnected, sendStreamMessage]);

  const [likeInProgress, setLikeInProgress] = useState(false);

  const handleLikeToggle = useCallback(async () => {
    if (!selectedStream?._id || likeInProgress) return;
    setLikeInProgress(true);

    try {
      const res = await likeService.toggleVideoLike(selectedStream._id);
      if (res?.data) {
        setIsLiked(Boolean(res.data.isLiked));
        if (typeof res.data.likesCount === 'number') {
          setLikesCount(res.data.likesCount);
        }
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    } finally {
      setLikeInProgress(false);
    }
  }, [selectedStream?._id, likeInProgress]);

  const [subInProgress, setSubInProgress] = useState(false);

  const handleToggleSub = useCallback(async () => {
    const ownerId = selectedStream?.owner?._id;
    if (!ownerId || subInProgress) return;
    setSubInProgress(true);

    try {
      const res = await subscriptionService.toggleSubscription(ownerId);
      if (res?.data) {
        setIsSubscribed(Boolean(res.data.isSubscribed));
      }
    } catch (err) {
      console.error("Error toggling subscription:", err);
    } finally {
      setSubInProgress(false);
    }
  }, [selectedStream?.owner?._id, subInProgress]);

  const handleSelectStream = useCallback((stream) => {
    setSelectedStream(stream);
    setSearchParams({ v: stream._id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setSearchParams]);

  const otherStreams = useMemo(() => {
    if (!selectedStream) return streams;
    return streams.filter((s) => s._id !== selectedStream._id);
  }, [streams, selectedStream]);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 container-4k pb-24 sm:pb-12">
      {/* 1. Main Live Stream Video Player & Live Chat */}
      <LiveHero 
        activeStream={selectedStream} 
        messages={messages} 
        onSendMessage={handleSendMessage}
        onLike={handleLikeToggle}
        isLiked={isLiked}
        likesCount={likesCount}
        isSubscribed={isSubscribed}
        onToggleSub={handleToggleSub}
        liveViewersCount={liveViewersCount}
      />

      {/* 2. Other Active Live 4K Broadcasts */}
      <LiveGrid 
        streams={otherStreams} 
        onSelectStream={handleSelectStream} 
      />
    </div>
  );
};

// Attach compound subcomponents for compound syntax support e.g. <LiveStream.Hero />
LiveStream.Hero = LiveHero;
LiveStream.Grid = LiveGrid;

export default LiveStream;
