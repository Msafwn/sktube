import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Flame, Plus, Tv, User } from 'lucide-react';

const BottomNav = () => {
  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Explore', icon: Flame, path: '/explore' },
    { name: 'Create', icon: Plus, path: '/upload', isCreate: true },
    { name: 'Subs', icon: Tv, path: '/subscriptions' },
    { name: 'You', icon: User, path: '/you' },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 h-16 bg-[#08080c]/95 backdrop-blur-2xl border-t border-white/10 px-2 flex items-center justify-around z-50 md:hidden pb-[env(safe-area-inset-bottom)]"
      style={{ boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.6)' }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        
        if (item.isCreate) {
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className="flex items-center justify-center -mt-6 cursor-pointer group select-none"
              aria-label="Create new video"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF0055] via-[#FF2E7E] to-[#7928CA] text-white flex items-center justify-center shadow-lg shadow-[#FF0055]/50 ring-4 ring-[#08080c] group-active:scale-95 group-hover:scale-105 transition-all">
                <Plus className="w-6 h-6 stroke-[2.8]" />
              </div>
            </NavLink>
          );
        }

        return (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all select-none ${
                isActive
                  ? 'text-[#FF2E7E] font-extrabold scale-105 drop-shadow-[0_0_8px_rgba(255,46,126,0.6)]'
                  : 'text-neutral-400 hover:text-neutral-200 active:scale-95'
              }`
            }
          >
            <Icon className="w-5 h-5 transition-transform" />
            <span className="text-[10px] tracking-tight">{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNav;

