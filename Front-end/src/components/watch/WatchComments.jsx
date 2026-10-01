import React from 'react';
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Trash2 
} from 'lucide-react';
import { useThrottleCallback } from '../../hooks/useThrottle';

const WatchComments = ({
  comments,
  commentInput,
  onCommentInputChange,
  onCommentSubmit,
  onCancelComment,
  submittingComment,
  user,
  video,
  formatDate,
  onCommentLikeToggle,
  replyingToId,
  onSetReplyingToId,
  replyInput,
  onReplyInputChange,
  onReplySubmit,
  onCancelReply,
  submittingReply,
  onDeleteComment
}) => {
  // Throttled Handlers to prevent spamming
  const throttledCommentSubmit = useThrottleCallback(onCommentSubmit, 1000);
  const throttledReplySubmit = useThrottleCallback(onReplySubmit, 1000);
  const throttledCommentLikeToggle = useThrottleCallback(onCommentLikeToggle, 600);

  return (
    <div className="flex flex-col gap-5 pt-4">
      {/* Comments Header */}
      <div className="flex items-center gap-3">
        <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
          {comments.length} Comments
        </h3>
      </div>

      {/* Add Comment Input Form */}
      <form onSubmit={throttledCommentSubmit} className="flex items-start gap-3">
        <img 
          src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"} 
          alt={user?.fullName || "You"} 
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-1 ring-white/10 shrink-0 mt-0.5"
        />
        <div className="flex-1 flex flex-col gap-2">
          <input 
            type="text" 
            value={commentInput}
            onChange={(e) => onCommentInputChange(e.target.value)}
            placeholder="Add a public comment..."
            className="w-full bg-transparent border-b border-white/20 pb-1 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF0055] transition-colors"
          />
          {commentInput.trim() && (
            <div className="flex items-center justify-end gap-2 pt-1 animate-fadeIn">
              <button 
                type="button" 
                onClick={onCancelComment}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submittingComment}
                className="btn-primary px-4 py-1.5 rounded-lg text-xs font-bold text-white cursor-pointer disabled:opacity-50"
              >
                Comment
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Comments List */}
      <div className="flex flex-col gap-5 mt-2">
        {comments.filter((c) => !c.parentComment).length === 0 ? (
          <div className="text-center py-8 glass-panel rounded-2xl border border-white/5">
            <MessageSquare className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-xs sm:text-sm text-neutral-400">No comments yet. Be the first to comment on this video!</p>
          </div>
        ) : (
          comments
            .filter((c) => !c.parentComment)
            .map((c) => {
              const isVideoOwner = user?._id && video?.owner?._id && (user._id.toString() === video.owner._id.toString() || user._id.toString() === video.owner.toString());
              const isCommentOwner = user?._id && (c.owner?._id === user._id || c.owner === user._id || c.owner?._id?.toString() === user._id.toString());
              const canDelete = isCommentOwner || isVideoOwner;
              const replies = comments.filter((r) => {
                const pId = r.parentComment?._id || r.parentComment;
                return pId && c._id && pId.toString() === c._id.toString();
              });

              return (
                <div key={c._id} className="flex flex-col gap-3 group">
                  
                  {/* Parent Comment Row */}
                  <div className="flex items-start gap-3">
                    <img 
                      src={c.owner?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"} 
                      alt={c.owner?.fullName || "User"} 
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-1 ring-white/10 shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-white truncate">
                          {c.owner?.fullName || c.owner?.username || "Viewer"}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          {formatDate(c.createdAt)}
                        </span>
                      </div>
                      
                      <p className="text-xs sm:text-sm text-neutral-300 mt-1 leading-relaxed break-words">
                        {c.content}
                      </p>

                      {/* Comment Actions: Like, Dislike, Reply, Delete */}
                      <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
                        {/* Like Button */}
                        <button 
                          onClick={() => throttledCommentLikeToggle(c._id)}
                          className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                            c.isLiked ? 'text-[#FF0055] font-bold' : 'hover:text-white'
                          }`}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${c.isLiked ? 'fill-[#FF0055]' : ''}`} />
                          <span>{(c.likesCount || 0) > 0 ? c.likesCount : ''}</span>
                        </button>

                        {/* Dislike Button */}
                        <button className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Reply Button */}
                        <button 
                          onClick={() => onSetReplyingToId(replyingToId === c._id ? null : c._id)}
                          className="font-bold hover:text-white transition-colors cursor-pointer text-[11px]"
                        >
                          Reply
                        </button>

                        {/* Delete Button */}
                        {canDelete && (
                          <button 
                            onClick={() => onDeleteComment(c._id)}
                            className="text-neutral-500 hover:text-rose-400 text-[11px] flex items-center gap-1 ml-auto transition-colors cursor-pointer"
                            title={isVideoOwner && !isCommentOwner ? "Delete comment (as Video Creator)" : "Delete your comment"}
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>

                      {/* Inline Reply Composer Form */}
                      {replyingToId === c._id && (
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            throttledReplySubmit(c._id);
                          }}
                          className="mt-3 flex items-start gap-2.5 animate-fadeIn"
                        >
                          <img 
                            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"} 
                            alt="You" 
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10 shrink-0 mt-0.5"
                          />
                          <div className="flex-1 flex flex-col gap-2">
                            <input 
                              type="text" 
                              value={replyInput}
                              onChange={(e) => onReplyInputChange(e.target.value)}
                              placeholder={`Reply to @${c.owner?.fullName || 'user'}...`}
                              className="w-full bg-transparent border-b border-white/20 pb-1 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF0055] transition-colors"
                              autoFocus
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                type="button" 
                                onClick={onCancelReply}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button 
                                type="submit" 
                                disabled={submittingReply || !replyInput.trim()}
                                className="btn-primary px-3 py-1 rounded-lg text-xs font-bold text-white cursor-pointer disabled:opacity-50"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        </form>
                      )}

                      {/* Nested Replies List */}
                      {replies.length > 0 && (
                        <div className="mt-3 pl-3 sm:pl-4 border-l-2 border-white/10 space-y-3">
                          {replies.map((reply) => {
                            const isReplyAuthor = user?._id && (reply.owner?._id === user._id || reply.owner === user._id || reply.owner?._id?.toString() === user._id.toString());
                            const canDeleteReply = isReplyAuthor || isVideoOwner;

                            return (
                              <div key={reply._id} className="flex items-start gap-2.5 group/reply">
                                <img 
                                  src={reply.owner?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"} 
                                  alt={reply.owner?.fullName || "User"} 
                                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover ring-1 ring-white/10 shrink-0 mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-white truncate">
                                      {reply.owner?.fullName || reply.owner?.username || "Viewer"}
                                    </span>
                                    <span className="text-[9px] text-neutral-500">
                                      {formatDate(reply.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed break-words">
                                    {reply.content}
                                  </p>

                                  {/* Reply Actions */}
                                  <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-400">
                                    <button 
                                      onClick={() => throttledCommentLikeToggle(reply._id)}
                                      className={`flex items-center gap-1 transition-colors cursor-pointer ${
                                        reply.isLiked ? 'text-[#FF0055] font-bold' : 'hover:text-white'
                                      }`}
                                    >
                                      <ThumbsUp className={`w-3 h-3 ${reply.isLiked ? 'fill-[#FF0055]' : ''}`} />
                                      <span>{(reply.likesCount || 0) > 0 ? reply.likesCount : ''}</span>
                                    </button>
                                    <button className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                                      <ThumbsDown className="w-3 h-3" />
                                    </button>
                                    {canDeleteReply && (
                                      <button 
                                        onClick={() => onDeleteComment(reply._id)}
                                        className="text-neutral-500 hover:text-rose-400 text-[10px] flex items-center gap-1 ml-auto transition-colors cursor-pointer"
                                        title={isVideoOwner && !isReplyAuthor ? "Delete reply (as Video Creator)" : "Delete your reply"}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                        <span>Delete</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              );
            })
        )}
      </div>
    </div>
  );
};

export default WatchComments;
