import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  Home, 
  Flame, 
  Tv, 
  History, 
  Bookmark, 
  Heart, 
  Clock, 
  Sparkles, 
  LayoutGrid, 
  MessageSquare, 
  UploadCloud, 
  Settings, 
  Compass,
  Radio,
  X,
  LogOut,
  Bell
} from 'lucide-react';

const Sidebar = ({ isCollapsed, isMobileOpen, closeMobileSidebar, currentUser, logout }) => {
  const sections = [
    {
      title: 'DISCOVER',
      items: [
        { name: 'Feed', icon: Home, path: '/', badge: null },
        { name: 'Notifications', icon: Bell, path: '/notifications', badge: null, mobileOnly: true },
        { name: 'Trending', icon: Flame, path: '/explore', badge: null },
        { name: 'Subscriptions', icon: Tv, path: '/subscriptions', badge: null },
        { name: 'Live Stream', icon: Radio, path: '/live', badge: 'LIVE' },
      ]
    },
    {
      title: 'COLLECTION',
      items: [
        { name: 'History', icon: History, path: '/history' },
        { name: 'Playlists', icon: Bookmark, path: '/playlists' },
        { name: 'Liked Streams', icon: Heart, path: '/liked-videos' },
        { name: 'Watch Later', icon: Clock, path: '/watch-later' },
      ]
    },
    {
      title: 'CREATOR HUB',
      items: [
        { name: 'Studio', icon: LayoutGrid, path: '/dashboard' },
        { name: 'Community', icon: MessageSquare, path: '/tweets' },
        { name: 'Publish', icon: UploadCloud, path: '/upload' },
      ]
    }
  ];

  const getNavLinkClass = (item) => ({ isActive }) => {
    const base = isCollapsed
      ? `relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 group ${
          isActive 
            ? 'bg-gradient-to-tr from-rose-500/20 via-pink-500/10 to-indigo-500/20 text-white shadow-lg border border-rose-500/30' 
            : 'text-neutral-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
        }`
      : `relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
          isActive 
            ? 'bg-gradient-to-r from-rose-500/20 via-violet-500/10 to-transparent text-white border border-rose-500/30 font-semibold shadow-sm' 
            : 'text-neutral-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
        }`;
    
    return item?.mobileOnly ? `${base} md:hidden` : base;
  };

  return (
    <>
      {/* Mobile Backdrop Overlay (Phones only) */}
      {isMobileOpen && (
        <div 
          onClick={closeMobileSidebar}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Container */}
      <aside 
        className={`fixed top-16 left-0 bottom-0 bg-[#08080c]/95 backdrop-blur-2xl border-r border-white/5 overflow-y-auto overflow-x-hidden transition-all duration-300 z-40 flex flex-col justify-between shadow-2xl ${
          // Desktop & Tablet sizing (>= 768px)
          isCollapsed ? 'md:w-20 md:px-2 md:py-3' : 'md:w-60 md:p-3.5'
        } ${
          // Mobile responsive drawer behavior (< 768px)
          isMobileOpen 
            ? 'translate-x-0 w-64 p-4' 
            : 'max-md:-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-4">
          {/* Mobile Header & Close */}
          <div className="flex items-center justify-between pb-2 border-b border-white/5 md:hidden">
            <span className="text-xs font-bold text-neutral-400">NAVIGATION</span>
            <button 
              onClick={closeMobileSidebar}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {sections.map((section, idx) => (
            <div key={section.title} className="flex flex-col gap-1">
              {!isCollapsed ? (
                <span className="px-3 text-[10px] font-extrabold tracking-wider text-neutral-500 uppercase">
                  {section.title}
                </span>
              ) : (
                idx > 0 && <div className="h-[1px] bg-white/5 my-1 mx-2" />
              )}

              <div className="flex flex-col gap-1 mt-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink 
                      key={item.name} 
                      to={item.path} 
                      onClick={closeMobileSidebar}
                      className={getNavLinkClass(item)}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Icon className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
                          {isCollapsed && item.badge === 'HOT' && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                          )}
                        </div>
                        
                        {!isCollapsed && (
                          <span className="truncate">{item.name}</span>
                        )}
                      </div>

                      {!isCollapsed && item.badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                          item.badge === 'HOT' || item.badge === 'LIVE'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-white/10 text-neutral-300'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Auth / Pro Badge */}
        {!isCollapsed && (
          <div className="mt-4 flex flex-col gap-2.5">
            {currentUser && (
              <div className="p-2.5 rounded-2xl bg-[#12121c] border border-white/10 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-[#FF0055]/40 shrink-0">
                    <img 
                      key={currentUser.avatar}
                      src={currentUser.avatar ? (currentUser.avatar.startsWith('http://') ? currentUser.avatar.replace('http://', 'https://') : currentUser.avatar) : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"} 
                      alt={currentUser.fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces";
                      }}
                    />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-bold text-white truncate">{currentUser.fullName}</span>
                    <span className="text-[10px] text-neutral-400 font-mono truncate">@{currentUser.username}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    closeMobileSidebar();
                    if (logout) logout();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-semibold text-rose-400 hover:text-white hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            )}

            <div className="p-3 rounded-xl bg-gradient-to-br from-rose-950/30 via-purple-950/15 to-neutral-900/50 border border-rose-500/20">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Sktube Cinema</span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-snug mt-1">
                4K 60FPS streams & seamless creators hub.
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
