import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Send, Loader2, Lock, LogIn } from 'lucide-react';

export const FeedCreatePost = ({ currentUser, onPostSubmit, isSubmitting }) => {
  const [content, setContent] = useState('');

  if (!currentUser) {
    return (
      <div className="glass-panel p-5 2xl:p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 shrink-0">
            <Lock className="w-5 h-5 text-[#FF2E7E]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">Join the Conversation</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Sign in to your Sktube account to publish posts, stream updates, and participate in community threads.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          <Link
            to="/login"
            className="btn-primary flex-1 sm:flex-initial px-5 py-2 text-xs font-bold text-center inline-flex items-center justify-center gap-1.5 shadow-lg shadow-[#FF0055]/30"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In to Post</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onPostSubmit({ content: content.trim() });
    setContent('');
  };

  return (
    <div className="glass-panel p-4 2xl:p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col gap-3">
      <div className="flex gap-3.5">
        <img 
          src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"} 
          alt="User Avatar" 
          className="w-10 h-10 2xl:w-12 2xl:h-12 rounded-xl object-cover ring-2 ring-[#FF0055]/40 shrink-0" 
        />
        <div className="flex-1 flex flex-col gap-2">
          <textarea
            rows="3"
            placeholder="Share stream updates, thoughts, tech insights, or what's on your mind with the Sktube community..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-[#12121c] border border-white/10 focus:border-[#FF0055]/50 rounded-xl p-3 text-xs 2xl:text-sm text-white placeholder-neutral-500 outline-none resize-none transition-colors leading-relaxed"
          ></textarea>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#FF2E7E]" />
                <span>Publish to everyone</span>
              </span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className="btn-primary px-5 py-2 text-xs 2xl:text-sm gap-2 disabled:opacity-40 cursor-pointer shadow-lg shadow-[#FF0055]/30"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <span>Dispatch Post</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedCreatePost;
