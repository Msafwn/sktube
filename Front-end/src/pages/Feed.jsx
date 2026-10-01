import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare } from 'lucide-react';
import { FeedHeader, FeedCreatePost, FeedPostCard, FeedSidebar } from '../components/feed';
import tweetService from '../services/tweetService';
import { useThrottleCallback } from '../hooks/useThrottle';
import { useModal } from '../context/ModalContext';

// ==========================================
// MAIN COMPOUND ROOT COMPONENT: Feed
// ==========================================
const Feed = () => {
  const { user } = useAuth();
  const { showConfirm, showToast } = useModal();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch Real Tweets from MongoDB Database
  const fetchTweets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await tweetService.getAllTweets();
      if (Array.isArray(res?.data)) {
        setPosts(res.data);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error("Error fetching community posts:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTweets();
  }, [fetchTweets]);

  // Post Submission Handler (MongoDB) with 1000ms Throttling
  const handlePostSubmit = useThrottleCallback(async ({ content }) => {
    try {
      setIsSubmitting(true);
      const res = await tweetService.createTweet(content);
      if (res?.data) {
        setPosts((prev) => [res.data, ...prev]);
      } else {
        fetchTweets();
      }
    } catch (err) {
      console.error("Error creating community post:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, 1000, [fetchTweets]);

  // Like Toggle Handler with 400ms Throttling
  const handleLikeToggle = useThrottleCallback(async (postId) => {
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((post) => {
        if (post._id === postId) {
          const isLiked = !post.isLiked;
          const likesCount = isLiked ? (post.likesCount || 0) + 1 : Math.max(0, (post.likesCount || 0) - 1);
          return { ...post, isLiked, likesCount };
        }
        return post;
      })
    );

    try {
      const res = await tweetService.toggleTweetLike(postId);
      if (res?.data) {
        setPosts((prev) =>
          prev.map((post) => {
            if (post._id === postId) {
              return { 
                ...post, 
                isLiked: res.data.isLiked !== undefined ? res.data.isLiked : post.isLiked,
                likesCount: res.data.likesCount !== undefined ? res.data.likesCount : post.likesCount
              };
            }
            return post;
          })
        );
      }
    } catch (e) {
      console.error("Error toggling tweet like:", e);
    }
  }, 400, []);

  // Delete Post Handler (MongoDB)
  const handleDeletePost = useCallback((postId) => {
    showConfirm({
      title: 'Delete Community Post?',
      message: 'Are you sure you want to delete this community post? This action cannot be undone.',
      type: 'danger',
      confirmText: 'Delete Post',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          setPosts((prev) => prev.filter((p) => p._id !== postId));
          await tweetService.deleteTweet(postId);
          showToast({ message: 'Community post deleted', type: 'success' });
        } catch (err) {
          console.error("Error deleting tweet:", err);
          showToast({ message: 'Failed to delete post', type: 'error' });
          fetchTweets();
        }
      }
    });
  }, [fetchTweets, showConfirm, showToast]);

  const handleShare = useCallback((post) => {
    if (navigator.share) {
      navigator.share({
        title: `Community Post by ${post.owner?.fullName || 'Creator'}`,
        text: post.content,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast({ message: 'Post link copied to clipboard!', type: 'success' });
    }
  }, [showToast]);

  // Filter Posts by Tab
  const filteredPosts = useMemo(() => {
    if (activeTab === 'all') return posts;
    if (activeTab === 'trending') {
      return posts.filter(p => (p.likesCount || 0) > 0);
    }
    if (activeTab === 'announcements') {
      return posts.filter(p => p.content?.toLowerCase().includes('announcement') || p.content?.toLowerCase().includes('launch') || p.content?.toLowerCase().includes('update'));
    }
    return posts;
  }, [posts, activeTab]);

  return (
    <div className="flex flex-col gap-6 container-4k pb-24 sm:pb-12">
      <FeedHeader />

      {/* Main 2-Column Feed Layout for Laptops & 4K Displays (8 cols Feed, 4 cols Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT / CENTER: Feed Streams (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Post Creator Box */}
          <FeedCreatePost 
            currentUser={user} 
            onPostSubmit={handlePostSubmit} 
            isSubmitting={isSubmitting} 
          />

          {/* Feed Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['all', 'trending', 'announcements'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-linear-to-r from-[#FF0055] to-[#7928CA] text-white shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Posts Stream */}
          {loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col gap-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10"></div>
                    <div className="flex flex-col gap-2">
                      <div className="w-32 h-3.5 bg-white/10 rounded"></div>
                      <div className="w-20 h-2.5 bg-white/5 rounded"></div>
                    </div>
                  </div>
                  <div className="w-full h-12 bg-white/5 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center flex flex-col items-center justify-center gap-3">
              <MessageSquare className="w-12 h-12 text-[#FF0055]/50" />
              <h3 className="text-base font-bold text-white">No Community Posts Yet</h3>
              <p className="text-xs text-neutral-400 max-w-sm">
                Be the first to share an update, stream schedule, or tech insight with the Sktube community!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredPosts.map((post) => (
                <FeedPostCard
                  key={post._id}
                  post={post}
                  currentUser={user}
                  onLikeToggle={handleLikeToggle}
                  onDeletePost={handleDeletePost}
                  onShare={handleShare}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Trends & Discover Sidebar (4 cols) */}
        <div className="hidden lg:flex lg:col-span-4 flex-col gap-5">
          <FeedSidebar />
        </div>
      </div>
    </div>
  );
};

// Attach compound subcomponents for backwards-compatible dot-notation
Feed.Header = FeedHeader;
Feed.CreatePost = FeedCreatePost;
Feed.PostCard = FeedPostCard;
Feed.Sidebar = FeedSidebar;

export default Feed;
