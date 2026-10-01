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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Neon Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FF0055]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-[#7928CA]/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-xl w-full text-center relative z-10">
        {/* Animated 404 Floating Badge */}
        <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl mb-6 shadow-2xl shadow-[#FF0055]/10 animate-bounce duration-1000">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF0055] to-[#7928CA] flex items-center justify-center shadow-lg shadow-[#FF0055]/30">
            <SearchX className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* 404 Big Gradient Number */}
        <h1 className="text-8xl sm:text-9xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#FF0055] via-rose-300 to-[#7928CA] select-none drop-shadow-sm">
          404
        </h1>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2 mb-3">
          Lost in the Stream?
        </h2>

        {/* Description */}
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-8">
          The video, channel, or page you are looking for has vanished into the digital void or the link might have a typo.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FF0055] to-rose-600 hover:from-[#ff1a66] hover:to-rose-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-[#FF0055]/25 active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>

          <button
            onClick={() => navigate('/explore')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-zinc-200 hover:text-white font-medium text-sm transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-md"
          >
            <Compass className="w-4 h-4 text-rose-400" />
            Explore Content
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 text-zinc-400 hover:text-zinc-200 font-medium text-sm transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Quick Links Section */}
        <div className="pt-6 border-t border-white/[0.08]">
          <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold block mb-4">
            Popular Destinations
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-rose-300 border border-white/5 hover:border-[#FF0055]/30 transition-all duration-200"
                >
                  <Icon className="w-3.5 h-3.5 text-zinc-400" />
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
