import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  Users, 
  Bookmark, 
  ListPlus, 
  Download 
} from 'lucide-react';
import { useThrottleCallback } from '../../hooks/useThrottle';

const WatchVideoInfo = ({
  video,
  user,
  subscribersCount,
  isSubscribed,
  onSubscribeToggle,
  isLiked,
  likesCount,
  onLikeToggle,
  copied,
  onShare,
  activePartyId,
  onOpenPartyModal,
  isSavedWatchLater,
  onToggleWatchLater,
  onOpenPlaylistModal
}) => {
  // Throttle rapid like & subscribe clicks (Max 1 action per 800ms)
  const throttledLikeToggle = useThrottleCallback(onLikeToggle, 800);
  const throttledSubscribeToggle = useThrottleCallback(onSubscribeToggle, 800);
  return (
    <div className="flex flex-col gap-3">
      {/* 1. Video Title */}
      <h1 className="text-lg sm:text-xl 2xl:text-2xl font-black text-white tracking-tight leading-snug pt-1">
        {video.title}
      </h1>

      {/* 2. Channel Bar & Interactive Actions */}
      <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4 pb-2 pt-1 border-b border-white/5">
        
        {/* Channel Info & Subscribe */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="flex items-center gap-3 shrink-0">
            <Link to={`/channel/${video.owner?.username || video.owner?._id}`} className="shrink-0">
              <img 
                src={video.owner?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"} 
                alt={video.owner?.fullName || "Creator"} 
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-white/10 hover:ring-[#FF0055]/50 transition-all shrink-0"
              />
            </Link>
            
            <div className="flex flex-col shrink-0">
              <Link 
                to={`/channel/${video.owner?.username || video.owner?._id}`}
                className="flex items-center gap-1.5 hover:text-[#FF2E7E] transition-colors group"
              >
                <span className="text-sm sm:text-base font-bold text-white whitespace-nowrap group-hover:underline">
                  {video.owner?.fullName || video.owner?.username || "Creator Studio"}
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#FF0055] shrink-0" />
              </Link>
              <span className="text-xs text-neutral-400 whitespace-nowrap">
                {subscribersCount.toLocaleString()} {subscribersCount === 1 ? 'subscriber' : 'subscribers'}
              </span>
            </div>
          </div>

          {/* Subscribe Button / Manage Video for Owner */}
          {user?._id && video.owner?._id && user._id.toString() === video.owner._id.toString() ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all shrink-0"
            >
              Manage Video
            </Link>
          ) : (
            <button 
              onClick={throttledSubscribeToggle}
              className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer shrink-0 shadow-md ${
                isSubscribed 
                  ? 'bg-white/10 text-neutral-200 border border-white/15 hover:bg-white/15'
                  : 'bg-white text-black hover:bg-neutral-200 font-black'
              }`}
            >
              {isSubscribed ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Subscribed</span>
                </>
              ) : (
                <span>Subscribe</span>
              )}
            </button>
          )}
        </div>

        {/* Action Buttons: Like, Share, Watch Party, Watch Later, Playlist, Download */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          
          {/* Like / Dislike Compound Button */}
          <div className="flex items-center rounded-full bg-white/5 border border-white/10 overflow-hidden shrink-0">
            <button 
              onClick={throttledLikeToggle}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isLiked ? 'text-[#FF0055] bg-[#FF0055]/10' : 'text-neutral-200 hover:bg-white/5'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 shrink-0 ${isLiked ? 'fill-[#FF0055]' : ''}`} />
              <span className="whitespace-nowrap">{likesCount.toLocaleString()}</span>
            </button>
            <div className="w-[1px] h-5 bg-white/10 shrink-0" />
            <button 
              className="px-3 py-2 text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer shrink-0"
              title="I dislike this"
            >
              <ThumbsDown className="w-4 h-4 shrink-0" />
            </button>
          </div>

          {/* Share Button */}
          <button 
            onClick={onShare}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <Share2 className="w-4 h-4 shrink-0" />}
            <span className="whitespace-nowrap">{copied ? 'Copied' : 'Share'}</span>
          </button>

          {/* Watch Party Co-Watching Button */}
          <button 
            onClick={onOpenPartyModal}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
              activePartyId
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-200'
            }`}
            title="Watch Party with Friends"
          >
            <Users className={`w-4 h-4 shrink-0 ${activePartyId ? 'text-emerald-400' : 'text-[#FF2E7E]'}`} />
            <span className="whitespace-nowrap">{activePartyId ? 'Party Active' : 'Watch Party'}</span>
          </button>

          {/* Save / Watch Later Button */}
          <button 
            onClick={onToggleWatchLater}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
              isSavedWatchLater 
                ? 'bg-[#FF0055]/20 border-[#FF0055]/40 text-[#FF2E7E]' 
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-200'
            }`}
            title={isSavedWatchLater ? "Remove from Watch Later" : "Save to Watch Later"}
          >
            <Bookmark className={`w-4 h-4 shrink-0 ${isSavedWatchLater ? 'fill-[#FF0055] text-[#FF0055]' : ''}`} />
            <span className="whitespace-nowrap">{isSavedWatchLater ? 'Saved' : 'Watch Later'}</span>
          </button>

          {/* Add to Playlist Button */}
          <button 
            onClick={onOpenPlaylistModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0"
            title="Save to Playlist"
          >
            <ListPlus className="w-4 h-4 text-[#FF2E7E] shrink-0" />
            <span className="whitespace-nowrap">Playlist</span>
          </button>

          {/* Download Button */}
          {video.videoFile && (
            <a 
              href={video.videoFile} 
              target="_blank" 
              rel="noreferrer" 
              download
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Download</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default WatchVideoInfo;
