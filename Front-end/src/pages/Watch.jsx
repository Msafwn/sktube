import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import WatchPartyModal from '../components/WatchPartyModal';
import {
  WatchPartyBanner,
  WatchPlayer,
  WatchVideoInfo,
  WatchDescription,
  WatchComments,
  WatchRelatedVideos,
  WatchPlaylistModal
} from '../components/watch';
import videoService from '../services/videoService';
import commentService from '../services/commentService';
import likeService from '../services/likeService';
import subscriptionService from '../services/subscriptionService';
import playlistService from '../services/playlistService';
import { useThrottleCallback } from '../hooks/useThrottle';

const Watch = () => {
  const { user } = useAuth();
  const { socket, joinStream, leaveStream, joinWatchParty, leaveWatchParty, syncPartyAction } = useSocket();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get('v');
  const videoRef = useRef(null);

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Recommendations / Up Next
  const [recommendedVideos, setRecommendedVideos] = useState([]);

  // Likes & Interactions
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);

  // Comments
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Watch Later Save state
  const [isSavedWatchLater, setIsSavedWatchLater] = useState(false);

  // Playlist Modal state
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [showNewPlaylistForm, setShowNewPlaylistForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);

  // UI state
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Watch Party state
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [activePartyId, setActivePartyId] = useState(null);
  const [partyMemberCount, setPartyMemberCount] = useState(1);
  const [partySyncNotice, setPartySyncNotice] = useState(null);
  const isSyncingRef = useRef(false);

  // Format seconds to mm:ss
  const formatDuration = useCallback((seconds) => {
    const mins = Math.floor((seconds || 0) / 60);
    const secs = String(Math.floor((seconds || 0) % 60)).padStart(2, '0');
    return `${mins}:${secs}`;
  }, []);

  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return 'Recently';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  // Host new watch party
  const handleCreateParty = useCallback(() => {
    const newCode = `SKT-${Math.floor(100 + Math.random() * 900)}`;
    setActivePartyId(newCode);
    joinWatchParty({ partyId: newCode, videoId, user });
  }, [videoId, user, joinWatchParty]);

  // Join existing watch party
  const handleJoinParty = useCallback((code) => {
    if (!code) return;
    setActivePartyId(code);
    joinWatchParty({ partyId: code, videoId, user });
  }, [videoId, user, joinWatchParty]);

  // Leave watch party
  const handleLeaveParty = useCallback(() => {
    if (activePartyId) {
      leaveWatchParty({ partyId: activePartyId });
      setActivePartyId(null);
      setPartyMemberCount(1);
    }
  }, [activePartyId, leaveWatchParty]);

  // Listen for Watch Party Socket Events
  useEffect(() => {
    if (!socket || !activePartyId) return;

    const handleStatus = ({ memberCount, message }) => {
      if (typeof memberCount === 'number') setPartyMemberCount(memberCount);
      if (message) {
        setPartySyncNotice(message);
        setTimeout(() => setPartySyncNotice(null), 4000);
      }
    };

    const handleAction = ({ action, currentTime, senderName }) => {
      const vidEl = videoRef.current;
      if (!vidEl) return;

      isSyncingRef.current = true;

      if (action === 'PLAY') {
        if (Math.abs(vidEl.currentTime - currentTime) > 0.8) {
          vidEl.currentTime = currentTime;
        }
        vidEl.play().catch(() => {});
        setPartySyncNotice(`${senderName} started playback ▶`);
      } else if (action === 'PAUSE') {
        vidEl.pause();
        setPartySyncNotice(`${senderName} paused the video ⏸`);
      } else if (action === 'SEEK') {
        vidEl.currentTime = currentTime;
        setPartySyncNotice(`${senderName} jumped to ${formatDuration(currentTime)} ⏩`);
      }

      setTimeout(() => {
        isSyncingRef.current = false;
      }, 300);
    };

    socket.on('party_status_update', handleStatus);
    socket.on('party_status', handleStatus);
    socket.on('party_action_received', handleAction);
    socket.on('party_action_sync', handleAction);

    return () => {
      socket.off('party_status_update', handleStatus);
      socket.off('party_status', handleStatus);
      socket.off('party_action_received', handleAction);
      socket.off('party_action_sync', handleAction);
    };
  }, [socket, activePartyId, formatDuration]);

  // Sync actions across party
  const handleVideoPlay = () => {
    if (activePartyId && !isSyncingRef.current && videoRef.current) {
      syncPartyAction({
        partyId: activePartyId,
        action: 'PLAY',
        currentTime: videoRef.current.currentTime,
        senderName: user?.fullName || 'Viewer'
      });
    }
  };

  const handleVideoPause = () => {
    if (activePartyId && !isSyncingRef.current && videoRef.current) {
      syncPartyAction({
        partyId: activePartyId,
        action: 'PAUSE',
        currentTime: videoRef.current.currentTime,
        senderName: user?.fullName || 'Viewer'
      });
    }
  };

  const handleVideoSeeked = () => {
    if (activePartyId && !isSyncingRef.current && videoRef.current) {
      syncPartyAction({
        partyId: activePartyId,
        action: 'SEEK',
        currentTime: videoRef.current.currentTime,
        senderName: user?.fullName || 'Viewer'
      });
    }
  };

  // Fetch Main Video & Related Content
  useEffect(() => {
    if (!videoId) {
      setError('No video specified.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchVideoDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await videoService.getVideoById(videoId, { signal: controller.signal });
        if (res?.data) {
          const vidData = res.data;
          setVideo(vidData);
          setIsLiked(Boolean(vidData.isLiked));
          setLikesCount(typeof vidData.likesCount === 'number' ? vidData.likesCount : (vidData.views ? Math.floor(vidData.views / 10) : 0));
          setIsSubscribed(Boolean(vidData.owner?.isSubscribed));
          setSubscribersCount(vidData.owner?.subscribersCount || 0);

          // Fetch Comments
          try {
            const commentRes = await commentService.getVideoComments(videoId, 1, 20, { signal: controller.signal });
            setComments(commentRes?.data?.comments || (Array.isArray(commentRes?.data) ? commentRes.data : []));
          } catch (e) {
            if (e.name !== 'CanceledError' && e.code !== 'ERR_CANCELED') {
              console.error('Comments fetch error:', e);
            }
          }

          // Fetch Recommendations
          try {
            const allRes = await videoService.getAllVideos({ limit: 10 }, { signal: controller.signal });
            const allList = allRes?.data?.videos || (Array.isArray(allRes?.data) ? allRes.data : []);
            setRecommendedVideos(allList.filter((v) => v._id !== videoId));
          } catch (e) {
            if (e.name !== 'CanceledError' && e.code !== 'ERR_CANCELED') {
              console.error('Recommendations fetch error:', e);
            }
          }
        }
      } catch (err) {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          setError(err.response?.data?.message || err.message || 'Failed to load video.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchVideoDetails();
    return () => {
      controller.abort();
    };
  }, [videoId]);

  // Join Video Stream Room and Listen for Real-Time Comments & Likes
  useEffect(() => {
    if (!videoId) return;

    joinStream(videoId);

    if (socket) {
      const handleNewComment = (newComment) => {
        if (!newComment?._id) return;
        setComments((prev) => {
          // 1. If already exists with matching _id, update it
          if (prev.some((c) => c._id?.toString() === newComment._id?.toString())) {
            return prev.map((c) => (c._id?.toString() === newComment._id?.toString() ? newComment : c));
          }
          // 2. If replacing a temporary optimistic comment/reply
          const tempIdx = prev.findIndex(
            (c) => c._id?.toString().startsWith('temp-') && c.content === newComment.content
          );
          if (tempIdx !== -1) {
            const copy = [...prev];
            copy[tempIdx] = newComment;
            return copy;
          }
          // 3. Otherwise add new comment/reply to the list
          return [newComment, ...prev];
        });
      };

      const handleDeleteComment = ({ commentId }) => {
        if (!commentId) return;
        setComments((prev) =>
          prev.filter((c) => c._id?.toString() !== commentId?.toString() && c.parentComment?.toString() !== commentId?.toString())
        );
      };

      const handleVideoLiked = ({ likesCount: updatedLikes }) => {
        if (typeof updatedLikes === 'number') {
          setLikesCount(updatedLikes);
        }
      };

      socket.on('new_comment', handleNewComment);
      socket.on('delete_comment', handleDeleteComment);
      socket.on('video_liked', handleVideoLiked);

      return () => {
        socket.off('new_comment', handleNewComment);
        socket.off('delete_comment', handleDeleteComment);
        socket.off('video_liked', handleVideoLiked);
        leaveStream(videoId);
      };
    }

    return () => {
      leaveStream(videoId);
    };
  }, [videoId, socket, joinStream, leaveStream]);

  // Toggle Video Like
  const handleLikeToggle = useCallback(async () => {
    if (!video?._id) return;
    const nextLiked = !isLiked;
    const nextCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    setIsLiked(nextLiked);
    setLikesCount(nextCount);

    try {
      const res = await likeService.toggleVideoLike(video._id);
      if (res?.data) {
        setIsLiked(Boolean(res.data.isLiked));
        if (typeof res.data.likesCount === 'number') {
          setLikesCount(res.data.likesCount);
        }
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  }, [video?._id, isLiked, likesCount]);

  // Toggle Channel Subscription
  const handleSubscribeToggle = useCallback(async () => {
    const ownerId = video?.owner?._id;
    if (!ownerId) return;

    const nextSub = !isSubscribed;
    setIsSubscribed(nextSub);
    setSubscribersCount((c) => (nextSub ? c + 1 : Math.max(0, c - 1)));

    try {
      const res = await subscriptionService.toggleSubscription(ownerId);
      if (res?.data) {
        setIsSubscribed(Boolean(res.data.isSubscribed));
      }
    } catch (err) {
      console.error('Error toggling subscription:', err);
    }
  }, [video?.owner?._id, isSubscribed]);

  // Watch Later toggle with 600ms throttling
  const handleToggleWatchLater = useThrottleCallback(async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!video?._id) return;

    const nextSaved = !isSavedWatchLater;
    setIsSavedWatchLater(nextSaved);

    try {
      if (nextSaved) {
        let watchLaterPl = userPlaylists.find((p) => p.name?.toLowerCase() === 'watch later');
        if (!watchLaterPl) {
          const res = await playlistService.createPlaylist({
            name: 'Watch Later',
            description: 'Videos saved to watch later',
            isPrivate: true
          });
          watchLaterPl = res?.data;
        }
        if (watchLaterPl?._id) {
          await playlistService.addVideoToPlaylist(watchLaterPl._id, video._id);
        }
      }
    } catch (err) {
      console.error('Error saving to watch later:', err);
    }
  }, 600, [user, video?._id, isSavedWatchLater, userPlaylists, navigate]);

  // Open Playlist Modal
  const handleOpenPlaylistModal = useCallback(async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsPlaylistModalOpen(true);
    setLoadingPlaylists(true);
    try {
      const res = await playlistService.getUserPlaylists(user._id);
      setUserPlaylists(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching playlists:', err);
    } finally {
      setLoadingPlaylists(false);
    }
  }, [user, navigate]);

  // Toggle video inclusion in a playlist with 500ms throttling
  const handleTogglePlaylist = useThrottleCallback(async (playlist) => {
    if (!video?._id || !playlist?._id) return;
    const isIncluded = playlist.videos?.some((v) => (typeof v === 'object' ? v._id : v) === video._id);

    try {
      if (isIncluded) {
        await playlistService.removeVideoFromPlaylist(playlist._id, video._id);
        setUserPlaylists((prev) =>
          prev.map((p) =>
            p._id === playlist._id
              ? {
                  ...p,
                  videos: p.videos.filter((v) => (typeof v === 'object' ? v._id : v) !== video._id)
                }
              : p
          )
        );
      } else {
        await playlistService.addVideoToPlaylist(playlist._id, video._id);
        setUserPlaylists((prev) =>
          prev.map((p) =>
            p._id === playlist._id
              ? {
                  ...p,
                  videos: [...(p.videos || []), video._id]
                }
              : p
          )
        );
      }
    } catch (err) {
      console.error('Error toggling video in playlist:', err);
    }
  }, 500, [video]);

  // Create new playlist inline with 1000ms throttling
  const handleCreatePlaylistInline = useThrottleCallback(async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!newPlaylistName.trim() || !user?._id) return;
    setCreatingPlaylist(true);

    try {
      const res = await playlistService.createPlaylist({
        name: newPlaylistName.trim(),
        description: newPlaylistDesc.trim() || 'Custom video collection'
      });

      if (res?.data?._id) {
        const createdPlaylist = res.data;
        if (video?._id) {
          await playlistService.addVideoToPlaylist(createdPlaylist._id, video._id);
          createdPlaylist.videos = [video._id];
        }
        setUserPlaylists((prev) => [createdPlaylist, ...prev]);
        setNewPlaylistName('');
        setNewPlaylistDesc('');
        setShowNewPlaylistForm(false);
      }
    } catch (err) {
      console.error('Error creating inline playlist:', err);
    } finally {
      setCreatingPlaylist(false);
    }
  }, 1000, [newPlaylistName, newPlaylistDesc, user, video]);

  // Share Link
  const handleShare = useCallback(() => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  // Submit Comment
  const handleCommentSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!commentInput.trim() || !videoId) return;

    const content = commentInput.trim();
    setSubmittingComment(true);

    const tempComment = {
      _id: `temp-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      owner: {
        _id: user?._id,
        fullName: user?.fullName || 'You',
        username: user?.username || 'user',
        avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
      }
    };

    setComments((prev) => [tempComment, ...prev]);
    setCommentInput('');

    try {
      const res = await commentService.addComment(videoId, content);
      if (res?.data?._id) {
        setComments((prev) => prev.map((c) => c._id === tempComment._id ? res.data : c));
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setComments((prev) => prev.filter((c) => c._id !== tempComment._id));
    } finally {
      setSubmittingComment(false);
    }
  }, [commentInput, videoId, user, navigate]);

  // Reply State
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyInput, setReplyInput] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Toggle Comment Like
  const handleCommentLikeToggle = useCallback(async (commentId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!commentId) return;

    setComments((prev) =>
      prev.map((c) => {
        if (c._id && commentId && c._id.toString() === commentId.toString()) {
          const nextLiked = !c.isLiked;
          const nextCount = nextLiked ? (c.likesCount || 0) + 1 : Math.max(0, (c.likesCount || 1) - 1);
          return { ...c, isLiked: nextLiked, likesCount: nextCount };
        }
        return c;
      })
    );

    try {
      const res = await likeService.toggleCommentLike(commentId);
      if (res?.data) {
        setComments((prev) =>
          prev.map((c) => {
            if (c._id && commentId && c._id.toString() === commentId.toString()) {
              return {
                ...c,
                isLiked: res.data.isLiked !== undefined ? Boolean(res.data.isLiked) : c.isLiked,
                likesCount: typeof res.data.likesCount === 'number' ? res.data.likesCount : c.likesCount
              };
            }
            return c;
          })
        );
      }
    } catch (err) {
      console.error('Error toggling comment like:', err);
    }
  }, [user, navigate]);

  // Submit Reply to a comment
  const handleReplySubmit = useCallback(async (parentCommentId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!replyInput.trim() || !videoId || !parentCommentId) return;

    const content = replyInput.trim();
    setSubmittingReply(true);

    const tempReply = {
      _id: `temp-reply-${Date.now()}`,
      content,
      parentComment: parentCommentId,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      isLiked: false,
      owner: {
        _id: user?._id,
        fullName: user?.fullName || 'You',
        username: user?.username || 'user',
        avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
      }
    };

    setComments((prev) => [...prev, tempReply]);
    setReplyInput('');
    setReplyingToId(null);

    try {
      const res = await commentService.addComment(videoId, content, parentCommentId);
      if (res?.data?._id) {
        setComments((prev) => prev.map((c) => c._id === tempReply._id ? res.data : c));
      }
    } catch (err) {
      console.error('Error adding reply:', err);
      setComments((prev) => prev.filter((c) => c._id !== tempReply._id));
    } finally {
      setSubmittingReply(false);
    }
  }, [replyInput, videoId, user, navigate]);

  // Delete Comment
  const handleDeleteComment = useCallback(async (commentId) => {
    setComments((prev) => prev.filter((c) => c._id !== commentId && c.parentComment !== commentId));
    try {
      await commentService.deleteComment(commentId);
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#FF0055] border-t-transparent animate-spin" />
        <p className="text-neutral-400 text-sm font-semibold tracking-wide">Loading 4K Video Stream...</p>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="py-20 text-center glass-panel rounded-3xl border border-white/10 p-6 sm:p-8 max-w-lg mx-auto mt-8">
        <Play className="w-14 h-14 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-black text-white">Video Unavailable</h2>
        <p className="text-sm text-neutral-400 mt-2 mb-6">
          {error || "We couldn't find the video you requested. It might have been removed by the creator."}
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn-primary text-white text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="container-4k pb-24 sm:pb-16 pt-2">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-[2560px]:grid-cols-12 gap-6 lg:gap-8 min-[2560px]:gap-10 items-start">
        
        {/* LEFT COLUMN: Player, Info, Description & Comments */}
        <div className="lg:col-span-8 min-[2560px]:col-span-8 min-[3400px]:col-span-9 flex flex-col gap-4">
          
          {/* Active Watch Party Sync Banner */}
          <WatchPartyBanner 
            activePartyId={activePartyId}
            partySyncNotice={partySyncNotice}
            partyMemberCount={partyMemberCount}
            onOpenDetails={() => setIsPartyModalOpen(true)}
            onLeave={handleLeaveParty}
          />

          {/* 1. 4K Video Player */}
          <WatchPlayer
            video={video}
            videoRef={videoRef}
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            onSeeked={handleVideoSeeked}
          />

          {/* 2. Channel Bar & Interactive Actions */}
          <WatchVideoInfo
            video={video}
            user={user}
            subscribersCount={subscribersCount}
            isSubscribed={isSubscribed}
            onSubscribeToggle={handleSubscribeToggle}
            isLiked={isLiked}
            likesCount={likesCount}
            onLikeToggle={handleLikeToggle}
            copied={copied}
            onShare={handleShare}
            activePartyId={activePartyId}
            onOpenPartyModal={() => setIsPartyModalOpen(true)}
            isSavedWatchLater={isSavedWatchLater}
            onToggleWatchLater={handleToggleWatchLater}
            onOpenPlaylistModal={handleOpenPlaylistModal}
          />

          {/* 3. Expandable Description Box */}
          <WatchDescription
            video={video}
            isDescExpanded={isDescExpanded}
            onToggleExpand={() => setIsDescExpanded((p) => !p)}
            formatDate={formatDate}
          />

          {/* 4. Comments Section */}
          <WatchComments
            comments={comments}
            commentInput={commentInput}
            onCommentInputChange={setCommentInput}
            onCommentSubmit={handleCommentSubmit}
            onCancelComment={() => setCommentInput('')}
            submittingComment={submittingComment}
            user={user}
            video={video}
            formatDate={formatDate}
            onCommentLikeToggle={handleCommentLikeToggle}
            replyingToId={replyingToId}
            onSetReplyingToId={setReplyingToId}
            replyInput={replyInput}
            onReplyInputChange={setReplyInput}
            onReplySubmit={handleReplySubmit}
            onCancelReply={() => {
              setReplyingToId(null);
              setReplyInput('');
            }}
            submittingReply={submittingReply}
            onDeleteComment={handleDeleteComment}
          />
        </div>

        {/* RIGHT COLUMN: Up Next / Recommended Videos List */}
        <WatchRelatedVideos
          recommendedVideos={recommendedVideos}
          onSelectVideo={(id) => navigate(`/watch?v=${id}`)}
          formatDuration={formatDuration}
          formatDate={formatDate}
        />
      </div>

      {/* Save To Playlist Modal */}
      <WatchPlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => {
          setIsPlaylistModalOpen(false);
          setShowNewPlaylistForm(false);
        }}
        loadingPlaylists={loadingPlaylists}
        userPlaylists={userPlaylists}
        video={video}
        onTogglePlaylist={handleTogglePlaylist}
        showNewPlaylistForm={showNewPlaylistForm}
        onOpenNewPlaylistForm={() => setShowNewPlaylistForm(true)}
        onCloseNewPlaylistForm={() => setShowNewPlaylistForm(false)}
        newPlaylistName={newPlaylistName}
        onNewPlaylistNameChange={setNewPlaylistName}
        newPlaylistDesc={newPlaylistDesc}
        onNewPlaylistDescChange={setNewPlaylistDesc}
        onCreatePlaylistInline={handleCreatePlaylistInline}
        creatingPlaylist={creatingPlaylist}
      />

      {/* Watch Party Modal */}
      <WatchPartyModal
        isOpen={isPartyModalOpen}
        onClose={() => setIsPartyModalOpen(false)}
        activePartyId={activePartyId}
        partyMemberCount={partyMemberCount}
        onJoinParty={handleJoinParty}
        onCreateParty={handleCreateParty}
        onLeaveParty={handleLeaveParty}
      />
    </div>
  );
};

export default Watch;
