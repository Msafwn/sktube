import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Radio, 
  Film, 
  MessageSquare, 
  Heart, 
  UserPlus, 
  Bell, 
  Play, 
  Trash2 
} from 'lucide-react';

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'live_stream':
      case 'live':
        return <Radio className="w-3.5 h-3.5 text-white" />;
      case 'video_upload':
      case 'video':
        return <Film className="w-3.5 h-3.5 text-white" />;
      case 'comment':
      case 'tweet':
        return <MessageSquare className="w-3.5 h-3.5 text-white" />;
      case 'like':
        return <Heart className="w-3.5 h-3.5 text-white fill-white" />;
      case 'subscribe':
      case 'subscriber':
        return <UserPlus className="w-3.5 h-3.5 text-white" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-white" />;
    }
  };

  const getBadgeBg = (type) => {
    switch (type) {
      case 'live_stream':
      case 'live':
        return 'bg-rose-600';
      case 'video_upload':
      case 'video':
        return 'bg-indigo-600';
      case 'comment':
      case 'tweet':
        return 'bg-blue-600';
      case 'like':
        return 'bg-[#FF0055]';
      case 'subscribe':
      case 'subscriber':
        return 'bg-emerald-600';
      default:
        return 'bg-neutral-700';
    }
  };

  const contentComponent = (
    <div 
      onClick={() => onMarkAsRead(notification.id)}
      className={`glass-card p-4 2xl:p-5 rounded-2xl flex items-start gap-3.5 sm:gap-4 transition-all duration-200 border cursor-pointer group relative ${
        notification.isUnread 
          ? 'bg-white/[0.05] border-[#FF0055]/30 hover:border-[#FF0055]/50' 
          : 'border-white/5 hover:border-white/15 opacity-90 hover:opacity-100'
      }`}
    >
      {/* Unread Glowing Pip */}
      {notification.isUnread && (
        <span className="absolute top-4 left-2 w-2 h-2 rounded-full bg-[#FF0055] shadow-[0_0_8px_#FF0055]" />
      )}

      {/* Creator Avatar with Type Badge */}
      <div className="relative shrink-0 ml-1.5 sm:ml-2">
        <img 
          src={notification.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"} 
          alt={notification.creator}
          className="w-10 h-10 sm:w-11 sm:h-11 2xl:w-12 2xl:h-12 rounded-xl object-cover border border-white/10 bg-neutral-800"
        />
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-md ${getBadgeBg(notification.type)} flex items-center justify-center shadow-md`}>
          {getIcon(notification.type)}
        </div>
      </div>

      {/* Content Info */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="font-bold text-xs sm:text-sm text-white group-hover:text-[#FF2E7E] transition-colors truncate">
            {notification.creator}
          </span>
          <span className="text-[11px] sm:text-xs text-neutral-400">
            {notification.action}
          </span>
        </div>

        {notification.content && (
          <p className="text-xs sm:text-sm text-neutral-300 mt-1 line-clamp-2 leading-relaxed bg-white/[0.02] p-2 rounded-lg border border-white/5">
            "{notification.content}"
          </p>
        )}

        <div className="flex items-center gap-2.5 mt-2 text-[10px] sm:text-xs text-neutral-500">
          <span>{notification.time}</span>
          {notification.category && (
            <>
              <span>•</span>
              <span className="text-neutral-400 font-medium">{notification.category}</span>
            </>
          )}
        </div>
      </div>

      {/* Video Thumbnail (Optional) */}
      {notification.thumbnail && (
        <div className="relative aspect-video w-20 sm:w-28 2xl:w-32 rounded-lg overflow-hidden bg-neutral-900 shrink-0 hidden sm:block">
          <img 
            src={notification.thumbnail} 
            alt="Preview" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-4 h-4 text-white fill-white" />
          </div>
        </div>
      )}

      {/* Action Remove */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onDelete(notification.id);
        }}
        className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer shrink-0"
        title="Delete notification"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  if (notification.link) {
    return (
      <Link to={notification.link} className="block">
        {contentComponent}
      </Link>
    );
  }

  return contentComponent;
};

export default NotificationItem;
