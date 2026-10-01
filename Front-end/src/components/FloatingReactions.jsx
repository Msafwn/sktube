import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { Heart, Flame, Sparkles } from 'lucide-react';

const REACTION_OPTIONS = [
  { emoji: '❤️', label: 'Love', type: 'heart' },
  { emoji: '🔥', label: 'Fire', type: 'fire' },
  { emoji: '👏', label: 'Clap', type: 'clap' },
  { emoji: '💯', label: '100', type: 'hundred' },
  { emoji: '✨', label: 'Sparkle', type: 'sparkle' },
];

export const FloatingReactions = ({ videoId }) => {
  const { socket, sendReaction } = useSocket();
  const [particles, setParticles] = useState([]);

  // Listen for real-time floating reactions from all viewers
  useEffect(() => {
    if (!socket || !videoId) return;

    const handleNewReaction = (reaction) => {
      setParticles((prev) => [...prev, reaction]);

      // Remove after animation finishes
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== reaction.id));
      }, 2300);
    };

    socket.on('new_stream_reaction', handleNewReaction);
    return () => {
      socket.off('new_stream_reaction', handleNewReaction);
    };
  }, [socket, videoId]);

  const handleSendReaction = useCallback((option) => {
    if (!videoId) return;
    sendReaction({
      videoId,
      emoji: option.emoji,
      reactionType: option.type
    });
  }, [videoId, sendReaction]);

  return (
    <>
      {/* 1. Floating Emoji Overlay Layer (Rendered inside video player container) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute bottom-4 animate-float-up text-2xl sm:text-3xl select-none filter drop-shadow-md"
            style={{ right: `${p.xOffset || 20}%` }}
          >
            {p.emoji}
          </div>
        ))}
      </div>

      {/* 2. Interactive Reaction Tap Bar */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-full glass-panel border border-white/10 bg-black/40 backdrop-blur-md">
        {REACTION_OPTIONS.map((opt) => (
          <button
            key={opt.type}
            onClick={() => handleSendReaction(opt)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm sm:text-base hover:scale-125 active:scale-95 transition-transform bg-white/5 hover:bg-white/15 cursor-pointer"
            title={`React ${opt.label}`}
          >
            {opt.emoji}
          </button>
        ))}
      </div>
    </>
  );
};

export default FloatingReactions;
