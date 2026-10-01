import React from 'react';
import { 
  Heart, 
  Share2, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Bookmark 
} from 'lucide-react';

const formatTimeAgo = (dateInput) => {
  if (!dateInput) return 'Just now';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Recently';
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const FeedPostCard = ({ post, currentUser, onLikeToggle, onDeletePost, onShare }) => {
  const isOwner = Boolean(
    currentUser?._id && 
    post.owner && 
    (currentUser._id === post.owner._id || currentUser._id === post.owner)
  );

  return (
    <div className="glass-card p-5 2xl:p-6 rounded-2xl border border-white/5 hover:border-[#FF0055]/30 transition-all duration-300 flex flex-col gap-3.5 shadow-xl group">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={post.owner?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"} 
            alt={post.owner?.fullName || "Creator"} 
            className="w-10 h-10 2xl:w-11 2xl:h-11 rounded-xl object-cover ring-1 ring-white/10 shrink-0" 
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm 2xl:text-base font-extrabold text-white truncate">
                {post.owner?.fullName || "Creator"}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#FF0055] shrink-0" />
            </div>
            <div className="flex items-center gap-2 text-[11px] 2xl:text-xs text-neutral-400 font-mono">
              <span>@{post.owner?.username || "creator"}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-500" />
                {formatTimeAgo(post.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {isOwner && (
          <button 
            onClick={() => onDeletePost(post._id)}
            title="Delete post"
            className="text-neutral-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Post Text Content */}
      <p className="text-xs sm:text-sm 2xl:text-base text-neutral-200 leading-relaxed whitespace-pre-line">
        {post.content}
      </p>

      {/* Attached Media */}
      {post.image && (
        <div className="rounded-xl overflow-hidden aspect-video w-full bg-neutral-900 border border-white/10 group cursor-pointer">
          <img 
            src={post.image} 
            alt="Post Attachment" 
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
          />
        </div>
      )}

      {/* Action Buttons Toolbar */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-neutral-400">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onLikeToggle(post._id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              post.isLiked 
                ? 'bg-[#FF0055]/20 text-[#FF2E7E] border border-[#FF0055]/30' 
                : 'hover:bg-white/5 text-neutral-400 hover:text-rose-300'
            }`}
          >
            <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-[#FF0055] text-[#FF0055]' : ''}`} />
            <span className="font-bold">{post.likesCount || 0}</span>
          </button>

          <button 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer hover:text-white"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Comments</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onShare(post)}
            className="p-2 rounded-xl hover:bg-white/5 hover:text-white transition-all cursor-pointer"
            title="Share post"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedPostCard;
