import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Bell, Heart, MessageSquare, UserPlus, Sparkles, X } from 'lucide-react';
import notificationService from '../services/notificationService';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const currentStreamIdRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [liveNotifications, setLiveNotifications] = useState([]);
  const [activeToast, setActiveToast] = useState(null);

  // Fetch unread count from backend
  const refreshUnreadCount = useCallback(async () => {
    if (user?._id) {
      try {
        const res = await notificationService.getUnreadCount();
        if (res?.data?.unreadCount !== undefined) {
          setUnreadCount(res.data.unreadCount);
        }
      } catch (e) {
        // silent
      }
    } else {
      setUnreadCount(0);
    }
  }, [user?._id]);

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  // Initialize Socket Connection
  useEffect(() => {
    // Connect to server (proxied by Vite/Nginx with secure cookies)
    const socket = io({
      withCredentials: true,
      auth: {
        userId: user?._id || undefined
      },
      transports: ['polling', 'websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      if (user?._id) {
        socket.emit('join_user_room', user._id);
      }
      if (currentStreamIdRef.current) {
        socket.emit('join_stream', { videoId: currentStreamIdRef.current });
      }
    });

    if (user?._id && socket.connected) {
      socket.emit('join_user_room', user._id);
    }
    if (currentStreamIdRef.current && socket.connected) {
      socket.emit('join_stream', { videoId: currentStreamIdRef.current });
    }

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      // Suppress noisy console error when backend is starting or offline
      setIsConnected(false);
    });

    // Listen for incoming real-time notifications
    socket.on('new_notification', (notification) => {
      setLiveNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show temporary floating toast notification
      setActiveToast(notification);
    });

    return () => {
      socket.disconnect();
    };
  }, [user?._id]);

  // Auto-dismiss active toast after 5 seconds
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [activeToast]);

  // Helper methods for Live Stream Rooms
  const joinStream = useCallback((videoId) => {
    if (!videoId) return;
    currentStreamIdRef.current = videoId;
    if (socketRef.current) {
      socketRef.current.emit('join_stream', { videoId });
    }
  }, []);

  const leaveStream = useCallback((videoId) => {
    if (!videoId) return;
    if (currentStreamIdRef.current === videoId) {
      currentStreamIdRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.emit('leave_stream', { videoId });
    }
  }, []);

  const sendStreamMessage = useCallback(({ videoId, text, badge }) => {
    if (socketRef.current && videoId && text) {
      socketRef.current.emit('send_stream_message', { 
        videoId, 
        text, 
        badge,
        senderId: user?._id || undefined
      });
    }
  }, [user?._id]);

  // Live Floating Reaction helper
  const sendReaction = useCallback(({ videoId, emoji, reactionType }) => {
    if (socketRef.current && videoId) {
      socketRef.current.emit('send_stream_reaction', { videoId, emoji, reactionType });
    }
  }, []);

  // Watch Party helpers
  const joinWatchParty = useCallback(({ partyId, videoId, user }) => {
    if (socketRef.current && partyId) {
      socketRef.current.emit('join_watch_party', { partyId, videoId, user });
    }
  }, []);

  const leaveWatchParty = useCallback(({ partyId }) => {
    if (socketRef.current && partyId) {
      socketRef.current.emit('leave_watch_party', { partyId });
    }
  }, []);

  const syncPartyAction = useCallback(({ partyId, action, currentTime, senderName }) => {
    if (socketRef.current && partyId && action) {
      socketRef.current.emit('sync_party_action', { partyId, action, currentTime, senderName });
    }
  }, []);

  // Icon mapping helper for notification toast
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-sky-400" />;
      case 'subscribe':
        return <UserPlus className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#FF0055]" />;
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        unreadCount,
        setUnreadCount,
        refreshUnreadCount,
        liveNotifications,
        setLiveNotifications,
        joinStream,
        leaveStream,
        sendStreamMessage,
        sendReaction,
        joinWatchParty,
        leaveWatchParty,
        syncPartyAction
      }}
    >
      {children}

      {/* Floating Real-time Toast Notification */}
      {activeToast && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 animate-bounce-in max-w-sm w-full">
          <div className="glass-panel p-3.5 rounded-2xl border border-white/15 bg-neutral-950/95 backdrop-blur-xl shadow-2xl flex items-start gap-3 relative group">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
              {getNotificationIcon(activeToast.type)}
            </div>

            <div className="flex flex-col flex-1 min-w-0 pr-4">
              <span className="text-xs font-bold text-white tracking-wide">
                {activeToast.title || "Notification"}
              </span>
              <p className="text-[11px] text-neutral-300 mt-0.5 leading-snug line-clamp-2">
                {activeToast.message}
              </p>
            </div>

            <button
              onClick={() => setActiveToast(null)}
              className="absolute top-2.5 right-2.5 text-neutral-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
