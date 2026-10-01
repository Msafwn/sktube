import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, UploadCloud } from 'lucide-react';

const DashboardHeader = ({ user, totalVideos }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 2xl:p-8 rounded-2xl glass-panel border border-white/10 shadow-2xl relative overflow-hidden">
    <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#FF0055]/10 rounded-full blur-3xl pointer-events-none" />
    
    <div className="flex items-center gap-4 relative z-10">
      <div className="relative">
        <img 
          src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop"} 
          alt={user?.fullName || "Creator"} 
          className="w-14 h-14 2xl:w-16 2xl:h-16 rounded-2xl object-cover border-2 border-[#FF0055]/40 shadow-lg shadow-[#FF0055]/20"
        />
        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0B0B0F]" />
      </div>

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl 2xl:text-3xl font-black text-white tracking-tight">
            {user?.fullName || "Creator Studio"}
          </h1>
          <CheckCircle2 className="w-5 h-5 text-[#FF0055]" />
          <span className="text-[10px] 2xl:text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#FF0055]/20 text-[#FF2E7E] border border-[#FF0055]/30 uppercase tracking-wider">
            PRO STUDIO
          </span>
        </div>
        <p className="text-xs 2xl:text-sm text-neutral-400 mt-1">
          Channel analytics, content management & broadcast performance overview
        </p>
      </div>
    </div>

    <div className="flex items-center gap-3 relative z-10">
      <Link
        to="/upload"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF0055] via-[#FF2E7E] to-[#7928CA] text-white text-xs 2xl:text-sm font-bold shadow-lg shadow-[#FF0055]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
      >
        <UploadCloud className="w-4 h-4" />
        <span>Publish Video</span>
      </Link>
    </div>
  </div>
);

export default DashboardHeader;
