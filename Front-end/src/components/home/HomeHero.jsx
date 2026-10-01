import React from 'react';
import { Radio, Play } from 'lucide-react';

const HomeHero = ({ featuredVideo, onWatch }) => {
  if (!featuredVideo) return null;

  return (
    <div className="relative rounded-3xl overflow-hidden glass-card p-6 sm:p-10 border border-white/10 group shadow-2xl">
      {/* Background Image with Ambient Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={featuredVideo.thumbnail || featuredVideo.banner || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&h=600&fit=crop"} 
          alt={featuredVideo.title} 
          className="w-full h-full object-cover opacity-35 scale-105 group-hover:scale-100 transition-transform duration-700 filter brightness-90" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-[#08080c]/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#08080c] via-transparent to-transparent"></div>
      </div>

      {/* Content Details */}
      <div className="relative z-10 flex flex-col items-start gap-4 max-w-3xl 2xl:max-w-4xl">
        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF0055] text-white font-extrabold text-xs shadow-lg shadow-[#FF0055]/40">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            SPOTLIGHT 4K
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-neutral-200 border border-white/10">
            {featuredVideo.views || 0} VIEWS
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl 2xl:text-5xl font-extrabold text-white tracking-tight leading-tight">
          {featuredVideo.title}
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base 2xl:text-lg text-neutral-300 line-clamp-2 leading-relaxed">
          {featuredVideo.description || "Watch this stream in ultra-high fidelity 4K resolution on SkTube."}
        </p>

        {/* Channel Info & Actions */}
        <div className="flex items-center gap-4 pt-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            <img 
              src={featuredVideo.owner?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"} 
              alt={featuredVideo.owner?.fullName || "Creator"} 
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#FF0055]/60" 
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">{featuredVideo.owner?.fullName || "Creator"}</span>
              <span className="text-[11px] text-neutral-400">@{featuredVideo.owner?.username || "creator"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => onWatch(featuredVideo)} 
              className="btn-primary px-6 py-2.5 gap-2 text-sm shadow-xl shadow-[#FF0055]/30 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Watch Stream</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeHero;
