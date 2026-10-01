import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Users, 
  Volume2, 
  Heart, 
  Share2, 
  Bell, 
  Check, 
  CheckCircle2, 
  MessageSquare, 
  Send 
} from 'lucide-react';
import FloatingReactions from '../FloatingReactions';

export const LiveHero = ({ 
  activeStream, 
  messages, 
  onSendMessage, 
  onLike, 
  isLiked, 
  likesCount,
  isSubscribed,
  onToggleSub,
  liveViewersCount
}) => {
  const [chatInput, setChatInput] = useState('');
  const [copied, setCopied] = useState(false);
  const chatBottomRef = useRef(null);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput);
    setChatInput('');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!activeStream) {
    return (
      <div className="py-20 text-center glass-panel rounded-3xl border border-white/10 p-6 sm:p-8">
        <Radio className="w-12 h-12 sm:w-16 sm:h-16 text-[#FF0055] mx-auto mb-4 animate-pulse" />
        <h2 className="text-lg sm:text-xl 2xl:text-2xl font-black text-white">No Live Broadcasts Active</h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-md mx-auto">
          There are currently no live streams broadcasting. Check back soon or start your own stream via Creator Studio.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
      {/* LEFT: Live Video Stream Player (8 cols on lg+) */}
      <div className="lg:col-span-8 flex flex-col gap-3.5 sm:gap-4">
        {/* Video Frame */}
        <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden glass-card border border-white/10 shadow-2xl group bg-black">
          {/* Stream Video or Thumbnail */}
          {activeStream.videoFile ? (
            <video 
              key={activeStream._id}
              src={activeStream.videoFile} 
              poster={activeStream.thumbnail}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <img 
              src={activeStream.thumbnail || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1400&h=750&fit=crop"} 
              alt={activeStream.title} 
              className="w-full h-full object-cover filter brightness-95" 
            />
          )}

          {/* Floating Live Reactions Layer */}
          {activeStream._id && <FloatingReactions videoId={activeStream._id} />}

          {/* Top Stream Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-4 sm:left-4 sm:right-4 flex items-center justify-between gap-1.5 z-10 pointer-events-none">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-rose-600 text-white font-extrabold text-[10px] sm:text-xs shadow-lg shadow-rose-600/50">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white animate-ping"></span>
                {activeStream.isLive ? 'LIVE 4K' : '4K UHD'}
              </span>
              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] sm:text-[11px] font-bold text-neutral-200 border border-white/10 flex items-center gap-1 sm:gap-1.5">
                <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FF2E7E]" />
                <span>{liveViewersCount || (typeof activeStream.views === 'number' ? activeStream.views.toLocaleString() : 1)}</span>
                <span className="hidden xs:inline">watching</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/60 backdrop-blur-md text-[9px] sm:text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                4K 60FPS
              </span>
            </div>
          </div>

          {/* Bottom Stream Audio/Quality Overlay Bar */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-4 sm:left-4 sm:right-4 flex items-center justify-between z-10 pointer-events-none">
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 text-neutral-300 text-[10px] sm:text-xs">
              <Volume2 className="w-3.5 h-3.5 text-[#FF2E7E]" />
              <span className="font-semibold hidden sm:inline">Dolby Atmos Surround 5.1</span>
              <span className="font-semibold sm:hidden">Dolby 5.1</span>
            </div>
          </div>
        </div>

        {/* Live Stream Title & Creator Meta Box */}
        <div className="glass-panel p-3.5 sm:p-5 2xl:p-6 rounded-2xl border border-white/10 flex flex-col gap-3.5 shadow-xl">
          {/* Creator Profile & Interactive Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Creator Info */}
            <div className="flex items-center gap-3">
              <img 
                src={activeStream.owner?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"} 
                alt={activeStream.owner?.fullName || "Creator"} 
                className="w-10 h-10 sm:w-12 sm:h-12 2xl:w-14 2xl:h-14 rounded-xl sm:rounded-2xl object-cover ring-2 ring-[#FF0055]/50 shadow-md shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-base 2xl:text-lg font-bold text-white truncate">
                    {activeStream.owner?.fullName || "Creator"}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF0055] shrink-0" />
                </div>
                <span className="text-[11px] sm:text-xs text-neutral-400 truncate">
                  @{activeStream.owner?.username || "creator"}
                </span>
              </div>
            </div>

            {/* Mobile-Friendly Action Buttons Row */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              {/* Like Button */}
              <button 
                onClick={onLike}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isLiked 
                    ? 'bg-[#FF0055] text-white border-[#FF0055] shadow-lg shadow-[#FF0055]/30' 
                    : 'bg-white/5 hover:bg-white/10 text-neutral-300 border-white/10'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLiked ? 'fill-white' : ''}`} />
                <span>{likesCount}</span>
              </button>

              {/* Share Button */}
              <button 
                onClick={handleShare}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 text-xs font-bold transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                <span>{copied ? 'Copied' : 'Share'}</span>
              </button>

              {/* Subscribe Button */}
              <button 
                onClick={onToggleSub}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  isSubscribed
                    ? 'bg-white/10 text-neutral-200 border border-white/15 hover:bg-white/15'
                    : 'btn-primary text-white shadow-lg shadow-[#FF0055]/30'
                }`}
              >
                {isSubscribed ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Subscribed</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3.5 h-3.5" />
                    <span>Subscribe</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Title & Description */}
          <div className="pt-2 border-t border-white/5">
            <h1 className="text-base sm:text-lg 2xl:text-xl font-black text-white tracking-tight leading-snug">
              {activeStream.title}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1.5 leading-relaxed line-clamp-3 sm:line-clamp-none">
              {activeStream.description || "Video broadcast stream on Sktube."}
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT: Interactive Live Chat (4 cols on lg+, tabbed/responsive on mobile) */}
      <div className="lg:col-span-4 flex flex-col h-[380px] sm:h-[460px] lg:h-[540px] 2xl:h-[640px] glass-panel rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Chat Header */}
        <div className="p-3 sm:p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#FF0055]" />
            <span className="text-xs sm:text-sm font-bold text-white">Stream Comments & Chat</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              LIVE
            </span>
          </div>
        </div>

        {/* Chat Messages Stream */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-white/10">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <MessageSquare className="w-8 h-8 text-neutral-600 mb-2" />
              <p className="text-xs text-neutral-400">No comments yet. Be the first to leave a comment!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-2.5 text-xs animate-fadeIn">
                <img src={msg.avatar} alt={msg.user} className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg object-cover shrink-0 mt-0.5 bg-neutral-800" />
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-neutral-300 truncate">{msg.user}</span>
                    {msg.badge && (
                      <span className="text-[8px] sm:text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-[#FF0055]/20 text-[#FF2E7E] border border-[#FF0055]/30">
                        {msg.badge}
                      </span>
                    )}
                    <span className="text-[9px] sm:text-[10px] text-neutral-500 ml-auto">{msg.time}</span>
                  </div>
                  <p className="text-neutral-200 mt-0.5 text-[11px] sm:text-xs leading-relaxed break-words">{msg.text}</p>
                </div>
              </div>
            ))
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Chat Input Box */}
        <form onSubmit={handleChatSubmit} className="p-2.5 sm:p-3 border-t border-white/10 bg-white/[0.02] flex items-center gap-2">
          <input 
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Add a comment to this stream..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF0055]/50 transition-colors"
          />
          <button 
            type="submit"
            disabled={!chatInput.trim()}
            className="btn-primary p-2 sm:p-2.5 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            aria-label="Send message"
          >
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default LiveHero;
