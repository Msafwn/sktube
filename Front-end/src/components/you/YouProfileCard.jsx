import React from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Settings, 
  LayoutGrid, 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Camera
} from 'lucide-react';

const YouProfileCard = ({ user }) => {
  if (!user) {
    return (
      <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-white/10 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#FF0055]/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 shrink-0">
            <User className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">Enjoy your favorite 4K content</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Sign in to access your history, playlists, liked streams, and subscriptions.</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 pt-2 relative z-10">
          <Link
            to="/login"
            className="btn-primary flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-bold gap-2 text-center justify-center shadow-lg shadow-[#FF0055]/30"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>
          <Link
            to="/register"
            className="px-4 py-2.5 sm:py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs sm:text-sm font-semibold transition-all text-center"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
      <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#FF0055]/15 rounded-full blur-3xl pointer-events-none" />
      
      {/* Cover Banner */}
      {user.coverImage ? (
        <div className="relative w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] h-32 sm:h-44 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 overflow-hidden rounded-t-3xl mb-1">
          <img 
            src={user.coverImage} 
            alt="Cover Banner" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e18] via-transparent to-transparent opacity-80" />
          <Link
            to="/settings"
            className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-lg"
          >
            <Camera className="w-3.5 h-3.5 text-[#FF2E7E]" />
            <span>Edit Cover</span>
          </Link>
        </div>
      ) : (
        <Link
          to="/settings"
          className="w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] h-24 sm:h-28 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 border-b border-dashed border-white/10 bg-white/[0.02] hover:bg-white/[0.05] flex flex-col items-center justify-center gap-1.5 transition-all group cursor-pointer mb-1"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 group-hover:text-white group-hover:border-[#FF0055]/40 transition-colors">
            <Camera className="w-4 h-4 text-[#FF0055]" />
          </div>
          <span className="text-xs font-bold text-neutral-300 group-hover:text-white transition-colors">
            + Add Channel Cover Photo
          </span>
        </Link>
      )}

      <div className="flex items-center gap-3.5 relative z-10">
        <div className="relative shrink-0">
          <img 
            src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop"} 
            alt={user.fullName || "User Avatar"} 
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-[#FF0055]/60 shadow-lg shadow-[#FF0055]/20"
          />
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#08080c]" />
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h1 className="text-base sm:text-xl font-black text-white truncate">
              {user.fullName || "User"}
            </h1>
            <CheckCircle2 className="w-4 h-4 text-[#FF0055] shrink-0" />
          </div>
          <span className="text-xs text-neutral-400 font-mono truncate">
            @{user.username || "creator"}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#FF0055]/20 text-[#FF2E7E] border border-[#FF0055]/30">
              CREATOR HUB
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none relative z-10">
        <Link 
          to="/settings"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF0055]/20 hover:bg-[#FF0055]/30 border border-[#FF0055]/40 text-xs font-bold text-white shrink-0 transition-colors"
        >
          <Settings className="w-3.5 h-3.5 text-[#FF2E7E]" />
          <span>Edit Profile</span>
        </Link>
        <Link 
          to="/dashboard"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-200 shrink-0 transition-colors"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-[#FF2E7E]" />
          <span>Creator Studio</span>
        </Link>
        <Link 
          to="/upload"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-200 shrink-0 transition-colors"
        >
          <UploadCloud className="w-3.5 h-3.5 text-pink-400" />
          <span>Upload</span>
        </Link>
        <Link 
          to="/notifications"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-200 shrink-0 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Alerts</span>
        </Link>
      </div>
    </div>
  );
};

export default YouProfileCard;
