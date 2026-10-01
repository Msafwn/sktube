import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Home, 
  Compass, 
  ArrowLeft, 
  Flame, 
  Radio, 
  History, 
  Film,
  SearchX
} from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  const quickLinks = [
    { label: '🔥 Trending', path: '/explore', icon: Flame },
    { label: '🔴 Live Stream', path: '/live', icon: Radio },
    { label: '🎬 History', path: '/history', icon: History },
    { label: '✨ Cinema Feed', path: '/feed', icon: Film },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] min-h-[460px] flex items-center justify-center px-4 relative overflow-hidden select-none">
      {/* Background Neon Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#FF0055]/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-[#7928CA]/15 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-lg w-full text-center relative z-10 flex flex-col items-center">
        {/* Animated 404 Floating Badge */}
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl mb-3 shadow-xl shadow-[#FF0055]/10 animate-bounce duration-1000">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#FF0055] to-[#7928CA] flex items-center justify-center shadow-md shadow-[#FF0055]/30">
            <SearchX className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* 404 Big Gradient Number */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#FF0055] via-rose-300 to-[#7928CA] leading-none drop-shadow-sm">
          404
        </h1>

        {/* Heading */}
        <h2 className="text-xl sm:text-2xl font-bold text-white mt-2 mb-2">
          Lost in the Stream?
        </h2>

        {/* Description */}
        <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto mb-6">
          The video, channel, or page you are looking for has vanished into the digital void or the link might have a typo.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6 w-full max-w-md">
          <button
            onClick={() => navigate('/')}
            className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF0055] to-rose-600 hover:from-[#ff1a66] hover:to-rose-500 text-white font-medium text-xs sm:text-sm transition-all duration-200 shadow-md shadow-[#FF0055]/25 active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Home
          </button>

          <button
            onClick={() => navigate('/explore')}
            className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-zinc-200 hover:text-white font-medium text-xs sm:text-sm transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-md"
          >
            <Compass className="w-4 h-4 text-rose-400" />
            Explore
          </button>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 text-zinc-400 hover:text-zinc-200 font-medium text-xs sm:text-sm transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Quick Links Section */}
        <div className="pt-4 border-t border-white/[0.08] w-full">
          <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block mb-2.5">
            Popular Destinations
          </span>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-rose-300 border border-white/5 hover:border-[#FF0055]/30 transition-all duration-200"
                >
                  <Icon className="w-3 h-3 text-zinc-400" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
