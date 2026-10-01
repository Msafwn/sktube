import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  Loader2, 
  Compass 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import notificationService from '../services/notificationService';
import subscriptionService from '../services/subscriptionService';
import videoService from '../services/videoService';
import { 
  NotificationsHeader, 
  NotificationsFilterTabs, 
  NotificationItem 
} from '../components/notifications';

// Helper for relative time formatting
const formatTimeAgo = (dateInput) => {
  if (!dateInput) return 'Recently';
  const now = new Date();
  const past = new Date(dateInput);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  return past.toLocaleDateString();
};

// ==========================================
// MAIN COMPOUND ROOT COMPONENT: Notifications
// ==========================================
const Notifications = () => {
  const { user } = useAuth();
  const { socket, setUnreadCount, refreshUnreadCount } = useSocket();
  const [activeFilter, setActiveFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from Backend Database
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      if (user?._id) {
        // 1. Fetch real stored notifications from MongoDB database
        const dbRes = await notificationService.getUserNotifications('all').catch(() => null);
        const storedNotifs = Array.isArray(dbRes?.data?.notifications) ? dbRes.data.notifications : [];

        if (storedNotifs.length > 0) {
          const formatted = storedNotifs.map((n) => ({
            id: n._id,
            type: n.type,
            creator: n.sender?.fullName || n.sender?.username || 'User',
            avatar: n.sender?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
            action: n.title || (n.type === 'comment' ? 'Comment & Reply' : n.type === 'like' ? 'Liked your content' : 'Notification'),
            content: n.message || '',
            time: formatTimeAgo(n.createdAt),
            rawDate: new Date(n.createdAt),
            category: n.type === 'subscribe' ? 'Audience Growth' : n.type === 'comment' ? 'Comments & Replies' : n.type === 'like' ? 'Likes & Reactions' : 'Updates',
            thumbnail: n.thumbnail || n.video?.thumbnail,
            isUnread: !n.isRead,
            link: n.link || (n.video ? `/watch?v=${n.video._id || n.video}` : n.tweet ? '/community' : '')
          }));
          setNotifications(formatted);
          if (dbRes?.data?.unreadCount !== undefined) {
            setUnreadCount(dbRes.data.unreadCount);
          }
          setLoading(false);
          return;
        }

        // 2. If dedicated notification docs haven't accumulated yet, aggregate from real live database collections
        const [videosRes, subscribersRes] = await Promise.allSettled([
          videoService.getAllVideos().catch(() => ({ data: [] })),
          subscriptionService.getUserChannelSubscribers(user._id).catch(() => ({ data: [] }))
        ]);

        const rawVideos = videosRes.status === 'fulfilled' && Array.isArray(videosRes.value?.data) ? videosRes.value.data : [];
        const rawSubscribers = subscribersRes.status === 'fulfilled' && Array.isArray(subscribersRes.value?.data) ? subscribersRes.value.data : [];

        const dynamicNotifs = [];

        rawSubscribers.forEach((sub) => {
          dynamicNotifs.push({
            id: `sub_${sub._id}`,
            type: 'subscribe',
            creator: sub.fullName || sub.username || 'A viewer',
            avatar: sub.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
            action: 'subscribed to your channel',
            content: '',
            time: formatTimeAgo(sub.subscribedAt),
            rawDate: new Date(sub.subscribedAt || Date.now()),
            category: 'Audience Growth',
            isUnread: false,
            link: `/user/${sub.username || ''}`
          });
        });

        rawVideos.forEach((vid) => {
          if (vid.owner?._id === user._id) return;
          const isLive = Boolean(vid.isLive);
          dynamicNotifs.push({
            id: `vid_${vid._id}`,
            type: isLive ? 'live_stream' : 'video_upload',
            creator: vid.owner?.fullName || vid.owner?.username || 'Creator',
            avatar: vid.owner?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
            action: isLive ? 'Live Stream' : 'New Video Upload',
            content: isLive ? `is now LIVE: "${vid.title}"` : `uploaded a new video: "${vid.title}"`,
            time: formatTimeAgo(vid.createdAt),
            rawDate: new Date(vid.createdAt || Date.now()),
            category: isLive ? 'Live Broadcast' : 'Video Upload',
            thumbnail: vid.thumbnail,
            isUnread: false,
            link: `/watch?v=${vid._id}`
          });
        });

        dynamicNotifs.sort((a, b) => b.rawDate - a.rawDate);
        setNotifications(dynamicNotifs);
        setUnreadCount(0);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user?._id, setUnreadCount]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Real-time incoming notification socket listener
  useEffect(() => {
    if (!socket) return;

    const handleRealtimeNotif = (notif) => {
      if (!notif) return;
      const formatted = {
        id: notif._id || `notif_${Date.now()}`,
        type: notif.type || 'info',
        creator: notif.sender?.fullName || notif.sender?.username || 'User',
        avatar: notif.sender?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
        action: notif.title || (notif.type === 'comment' ? 'Comment & Reply' : notif.type === 'like' ? 'Liked your content' : 'Notification'),
        content: notif.message || '',
        time: 'Just now',
        rawDate: new Date(),
        category: notif.type === 'subscribe' ? 'Audience Growth' : notif.type === 'comment' ? 'Comments & Replies' : notif.type === 'like' ? 'Likes & Reactions' : 'Updates',
        thumbnail: notif.thumbnail,
        isUnread: true,
        link: notif.link || ''
      };

      setNotifications((prev) => [formatted, ...prev]);
    };

    socket.on('new_notification', handleRealtimeNotif);
    return () => {
      socket.off('new_notification', handleRealtimeNotif);
    };
  }, [socket]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => n.isUnread).length;
  }, [notifications]);

  const tabs = useMemo(() => [
    { id: 'all', label: 'All Notifications', count: notifications.length },
    { id: 'comment', label: 'Comments & Replies' },
    { id: 'like', label: 'Likes' },
    { id: 'subscribe', label: 'Subscribers' },
    { id: 'live_stream', label: 'Live Streams' },
    { id: 'video_upload', label: 'Uploads' }
  ], [notifications.length]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') return notifications;
    if (activeFilter === 'comment') return notifications.filter(n => n.type === 'comment');
    if (activeFilter === 'like') return notifications.filter(n => n.type === 'like');
    if (activeFilter === 'subscribe') return notifications.filter(n => n.type === 'subscribe' || n.type === 'subscriber');
    if (activeFilter === 'live_stream') return notifications.filter(n => n.type === 'live_stream' || n.type === 'live');
    if (activeFilter === 'video_upload') return notifications.filter(n => n.type === 'video_upload' || n.type === 'video');
    return notifications;
  }, [activeFilter, notifications]);

  const handleMarkAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
    setUnreadCount(0);
    try {
      await notificationService.markAllAsRead();
    } catch (e) {
      console.error('Mark all read error:', e);
    }
  }, [setUnreadCount]);

  const handleMarkAsRead = useCallback(async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isUnread: false } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      if (typeof id === 'string' && id.length === 24) {
        await notificationService.markAsRead(id);
      }
    } catch (e) {
      console.error('Mark as read error:', e);
    }
  }, [setUnreadCount]);

  const handleDelete = useCallback(async (id) => {
    setNotifications(prev => {
      const target = prev.find(n => n.id === id);
      if (target?.isUnread) {
        setUnreadCount(c => Math.max(0, c - 1));
      }
      return prev.filter(n => n.id !== id);
    });
    try {
      if (typeof id === 'string' && id.length === 24) {
        await notificationService.deleteNotification(id);
      }
    } catch (e) {
      console.error('Delete notification error:', e);
    }
  }, [setUnreadCount]);

  const handleClearAll = useCallback(async () => {
    setNotifications([]);
    setUnreadCount(0);
    try {
      await notificationService.clearAllNotifications();
    } catch (e) {
      console.error('Clear all error:', e);
    }
  }, [setUnreadCount]);

  return (
    <div className="flex flex-col gap-6 container-4k pb-24 sm:pb-12 max-w-5xl mx-auto">
      {/* 1. Header */}
      <NotificationsHeader 
        unreadCount={unreadCount}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearAll={handleClearAll}
        totalCount={notifications.length}
      />

      {/* 2. Filter Tabs */}
      <NotificationsFilterTabs 
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        tabs={tabs}
      />

      {/* 3. Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-24 text-center glass-panel rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#FF0055] animate-spin" />
            <p className="text-xs text-neutral-400 font-mono">Syncing database notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-20 text-center glass-panel rounded-2xl border border-white/10 p-8 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-neutral-500">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No notifications in this view</h3>
            <p className="text-xs 2xl:text-sm text-neutral-400 mt-1 max-w-sm mx-auto">
              {activeFilter === 'all' 
                ? "You're all caught up! When creators upload new 4K videos or new subscribers join, they will appear here in real-time."
                : `No recent activity in the ${activeFilter} category.`}
            </p>

            <Link
              to="/"
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all"
            >
              <Compass className="w-4 h-4 text-[#FF2E7E]" />
              <span>Explore 4K Streams</span>
            </Link>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <NotificationItem 
              key={item.id}
              notification={item}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Attach compound subcomponents for dot notation
Notifications.Header = NotificationsHeader;
Notifications.FilterTabs = NotificationsFilterTabs;
Notifications.Item = NotificationItem;

export default Notifications;
