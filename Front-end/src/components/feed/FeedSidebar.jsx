import React from 'react';
import { TrendingUp, Globe } from 'lucide-react';

export const FeedSidebar = () => {
  const trendingTags = [
    { tag: "#NextGenStreaming", posts: "42.8K posts" },
    { tag: "#Cyberpunk2077_4K", posts: "29.1K posts" },
    { tag: "#FullStackMastery", posts: "18.5K posts" },
    { tag: "#SktubeCreators", posts: "15.2K posts" },
  ];

  const suggestedCreators = [
    { name: "Safwan Dev Studio", handle: "@safwandev", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" },
    { name: "Code Architect", handle: "@architect", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
    { name: "Neon Gamer", handle: "@neongamer", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Trending Topics */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col gap-3.5 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#FF2E7E]" />
            Trending Topics
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {trendingTags.map((item) => (
            <div key={item.tag} className="flex flex-col cursor-pointer group">
              <span className="text-xs 2xl:text-sm font-bold text-white group-hover:text-[#FF2E7E] transition-colors">
                {item.tag}
              </span>
              <span className="text-[10px] text-neutral-400 mt-0.5">{item.posts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Creators */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col gap-3.5 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-400" />
            Active Creators
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {suggestedCreators.map((creator) => (
            <div key={creator.handle} className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <img src={creator.avatar} alt={creator.name} className="w-8 h-8 rounded-xl object-cover ring-1 ring-white/10 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate">{creator.name}</span>
                  <span className="text-[10px] text-neutral-400 font-mono truncate">{creator.handle}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedSidebar;
