import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Film, 
  Heart, 
  Clock, 
  MessageSquare, 
  Tv, 
  ChevronRight, 
  LogOut 
} from 'lucide-react';

const YouMenuGrid = ({ user, onLogout }) => {
  const menuItems = [
    { name: 'Your Studio Videos', icon: Film, path: '/dashboard', color: 'text-[#FF2E7E]' },
    { name: 'Liked Streams', icon: Heart, path: '/liked-videos', color: 'text-rose-400' },
    { name: 'Watch Later', icon: Clock, path: '/watch-later', color: 'text-purple-400' },
    { name: 'Community Posts', icon: MessageSquare, path: '/tweets', color: 'text-blue-400' },
    { name: 'Your Subscriptions', icon: Tv, path: '/subscriptions', color: 'text-emerald-400' },
  ];

  return (
    <div className="flex flex-col gap-2.5">
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-white/[0.04] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 group-hover:scale-110 transition-transform">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <span className="text-xs sm:text-sm font-bold text-neutral-200 group-hover:text-white transition-colors">
                  {item.name}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
            </Link>
          );
        })}
      </div>

      {user && (
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-all cursor-pointer mt-1"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out from Account</span>
        </button>
      )}
    </div>
  );
};

export default YouMenuGrid;
