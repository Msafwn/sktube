import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Tv, 
  Compass, 
  ArrowLeft 
} from 'lucide-react';
import userService from '../services/userService';
import videoService from '../services/videoService';
import subscriptionService from '../services/subscriptionService';
import { useAuth } from '../context/AuthContext';
import { 
  SubscriptionsStoryBar, 
  SubscriptionsChannelBanner, 
  SubscriptionsHeader, 
  SubscriptionsCard 
} from '../components/subscriptions';

// ==========================================
// MAIN COMPOUND ROOT COMPONENT: Subscriptions
// ==========================================
const Subscriptions = () => {
  const { user } = useAuth();
  const [channels, setChannels] = useState([]);
  const [allVideos, setAllVideos] = useState([]);
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribedStatusMap, setSubscribedStatusMap] = useState({});

  const navigate = useNavigate();

  const formatDuration = useCallback((seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = String(Math.floor(seconds % 60)).padStart(2, '0');
    return `${mins}:${secs}`;
  }, []);

  const handleSelectChannel = useCallback((channelId) => {
    setSelectedChannelId(channelId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleWatchVideo = useCallback((video) => {
    if (video?._id) {
      if (video.isLive) {
        navigate(`/live?v=${video._id}`);
      } else {
        navigate(`/watch?v=${video._id}`);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [navigate]);

  // Toggle channel subscription from banner
  const handleToggleSubscription = useCallback(async (channelId) => {
    if (!channelId) return;
    try {
      const res = await subscriptionService.toggleSubscription(channelId);
      const isSub = res?.data?.isSubscribed ?? false;
      setSubscribedStatusMap((prev) => ({ ...prev, [channelId]: isSub }));
      
      if (!isSub) {
        // Remove from channels list
        setChannels((prev) => prev.filter((c) => c._id !== channelId));
        setSelectedChannelId(null);
      }
    } catch (err) {
      console.error('Error toggling subscription:', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchSubscriptionsData = async () => {
      try {
        setLoading(true);
        if (user?._id) {
          const [channelsRes, videosRes] = await Promise.allSettled([
            userService.getSubscribedChannels(user._id),
            videoService.getAllVideos({ limit: 50, sortBy: 'createdAt', sortType: 'desc' })
          ]);

          if (isMounted) {
            const fetchedChannels = channelsRes.status === 'fulfilled' && Array.isArray(channelsRes.value?.data) ? channelsRes.value.data : [];
            setChannels(fetchedChannels);

            const initialMap = {};
            fetchedChannels.forEach((c) => {
              if (c._id) initialMap[c._id] = true;
            });
            setSubscribedStatusMap(initialMap);

            const fetchedVideos = videosRes.status === 'fulfilled' && videosRes.value?.data?.videos
              ? videosRes.value.data.videos
              : (videosRes.status === 'fulfilled' && Array.isArray(videosRes.value?.data) ? videosRes.value.data : []);

            setAllVideos(fetchedVideos);
          }
        } else {
          if (isMounted) {
            setChannels([]);
            setAllVideos([]);
          }
        }
      } catch (err) {
        if (isMounted) {
          setChannels([]);
          setAllVideos([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSubscriptionsData();
    return () => { isMounted = false; };
  }, [user]);

  // Get currently selected channel object
  const selectedChannel = useMemo(() => {
    if (!selectedChannelId) return null;
    return channels.find((c) => c._id === selectedChannelId) || null;
  }, [channels, selectedChannelId]);

  // Filter videos by selected channel or all subscribed channels
  const displayedVideos = useMemo(() => {
    if (selectedChannelId) {
      return allVideos.filter(v => (v.owner?._id?.toString() || v.owner?.toString()) === selectedChannelId.toString());
    }
    
    if (channels.length > 0) {
      const channelIdSet = new Set(channels.map(c => c._id?.toString()));
      const filtered = allVideos.filter(v => channelIdSet.has(v.owner?._id?.toString() || v.owner?.toString()));
      return filtered.length > 0 ? filtered : allVideos;
    }

    return [];
  }, [allVideos, channels, selectedChannelId]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF2E7E]">
          <Tv className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Don't miss new videos</h2>
        <p className="text-xs text-neutral-400">
          Sign in to see updates from your favorite YouTube and Sktube channels.
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
    <div className="flex flex-col gap-7 container-4k pb-24 sm:pb-12">
      {/* 1. Channel Story Avatars Reel */}
      <SubscriptionsStoryBar 
        channels={channels} 
        selectedChannelId={selectedChannelId}
        onSelectChannel={handleSelectChannel} 
      />

      {/* 2. Selected Channel Profile Banner */}
      {selectedChannel && (
        <SubscriptionsChannelBanner
          channel={selectedChannel}
          videoCount={displayedVideos.length}
          onDeselect={() => setSelectedChannelId(null)}
          onToggleSub={handleToggleSubscription}
          isSubscribed={subscribedStatusMap[selectedChannel._id] ?? true}
        />
      )}

      {/* 3. Header */}
      <SubscriptionsHeader 
        totalCount={displayedVideos.length} 
        selectedChannel={selectedChannel} 
      />

      {/* 4. Subscribed Videos Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[2560px]:grid-cols-6 min-[3200px]:grid-cols-7 min-[3840px]:grid-cols-8 gap-5 sm:gap-6 2xl:gap-7">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse border border-white/5">
              <div className="aspect-video w-full bg-white/10"></div>
              <div className="p-4 space-y-2.5">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-3 bg-white/5 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : displayedVideos.length === 0 ? (
        <div className="py-16 text-center glass-panel rounded-3xl border border-white/10 p-8 flex flex-col items-center justify-center gap-3.5 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500">
            <Tv className="w-8 h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            {selectedChannel 
              ? `No streams uploaded by ${selectedChannel.fullName || selectedChannel.username} yet` 
              : (channels.length === 0 ? "No Subscribed Channels Yet" : "No Streams Available")}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md">
            {selectedChannel 
              ? "This creator hasn't published any public streams or videos yet. Check back soon!" 
              : "Subscribe to your favorite creators from Home or Explore to get their streams right here."}
          </p>
          {selectedChannel ? (
            <button
              onClick={() => setSelectedChannelId(null)}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#FF2E7E]" />
              <span>Back to All Subscribed Channels</span>
            </button>
          ) : (
            <Link
              to="/explore"
              className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF0055] to-[#FF2E7E] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#FF0055]/30 hover:shadow-[#FF0055]/50 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Trending Streams</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[2560px]:grid-cols-6 min-[3200px]:grid-cols-7 min-[3840px]:grid-cols-8 gap-5 sm:gap-6 2xl:gap-7">
          {displayedVideos.map((video) => (
            <SubscriptionsCard 
              key={video._id} 
              video={video} 
              formatDuration={formatDuration}
              onWatch={handleWatchVideo} 
              onSelectCreator={handleSelectChannel}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Attach compound subcomponents for dot notation
Subscriptions.StoryBar = SubscriptionsStoryBar;
Subscriptions.ChannelBanner = SubscriptionsChannelBanner;
Subscriptions.Header = SubscriptionsHeader;
Subscriptions.Card = SubscriptionsCard;

export default Subscriptions;
