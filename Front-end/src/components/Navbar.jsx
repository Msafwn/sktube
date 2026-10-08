import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  Plus, 
  Bell, 
  Flame, 
  X, 
  Command, 
  ArrowLeft,
  LogOut,
  User,
  UploadCloud,
  Heart,
  History,
  Play,
  Loader2
} from 'lucide-react';
import notificationService from '../services/notificationService';
import videoService from '../services/videoService';
import { useSocket } from '../context/SocketContext';
import useDebounce from '../hooks/useDebounce';

const Navbar = ({ toggleSidebar, isSidebarCollapsed, currentUser, logout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { socket, unreadCount, setUnreadCount } = useSocket();
  
  const userMenuRef = useRef(null);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

  // Debounced Search Value (300ms Delay)
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Live Debounced Search Suggestions API Call with AbortController
  useEffect(() => {
    const controller = new AbortController();

    const fetchSuggestions = async () => {
      if (!debouncedSearch.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      try {
        setIsSearching(true);
        const res = await videoService.getAllVideos(
          { query: debouncedSearch.trim(), limit: 5 },
          { signal: controller.signal }
        );
        const list = res?.data?.videos || (Array.isArray(res?.data) ? res.data : []);
        setSearchResults(list);
      } catch (err) {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          setSearchResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    };

    fetchSuggestions();
    return () => {
      controller.abort();
    };
  }, [debouncedSearch]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?query=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
      setIsSearchFocused(false);
    }
  };

  const handleSelectSuggestion = (vid) => {
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
    setSearchQuery('');
    navigate(`/watch?v=${vid._id}`);
  };

  const handleLogoutClick = () => {
    setIsUserMenuOpen(false);
    if (logout) {
      logout();
    }
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 sm:h-16 z-50 px-2.5 sm:px-6 flex items-center justify-between glass-panel border-b border-white/5 bg-[#08080c]/95 backdrop-blur-2xl">
      {/* Mobile Search Overlay Full Bar */}
      {isMobileSearchOpen ? (
        <div className="flex items-center w-full gap-2 animate-fadeIn relative">
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(false)}
            className="p-2 text-neutral-400 hover:text-white rounded-xl bg-white/5 cursor-pointer shrink-0 transition-colors"
            title="Close Search"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>

          <form onSubmit={handleSearch} className="flex-1 flex items-center bg-[#12121c] border border-white/15 focus-within:border-[#FF0055]/60 rounded-xl px-3 h-9 sm:h-10 transition-colors">
            <input
              type="text"
              placeholder="Search 4K streams, creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-neutral-500 outline-none"
            />
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-[#FF2E7E] animate-spin shrink-0" />
            ) : searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-neutral-400 hover:text-white shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </form>

          <button
            type="button"
            onClick={handleSearch}
            className="btn-primary p-2 sm:p-2.5 rounded-xl shrink-0 cursor-pointer"
            title="Submit Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Mobile Live Suggestions Dropdown */}
          {searchQuery.trim() && searchResults.length > 0 && (
            <div className="absolute top-12 left-0 right-0 bg-[#0d0d16] border border-white/15 rounded-2xl p-2 shadow-2xl z-50 animate-fadeIn">
              {searchResults.map((vid) => (
                <div
                  key={vid._id}
                  onClick={() => handleSelectSuggestion(vid)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <img src={vid.thumbnail} alt="" className="w-12 h-8 rounded-lg object-cover" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-bold text-white truncate">{vid.title}</span>
                    <span className="text-[10px] text-neutral-400 truncate">{vid.owner?.fullName || vid.owner?.username}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* 1. Left: Brand & Sidebar Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Hamburger Toggle (Mobile Drawer & Desktop Collapse) */}
            <button 
              onClick={toggleSidebar}
              className="p-2 sm:p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-neutral-300 hover:text-white transition-all cursor-pointer shrink-0"
              title="Toggle Menu"
            >
              <div className="flex flex-col gap-1 w-4 sm:w-4.5">
                <span className={`h-0.5 bg-current rounded-full transition-all ${isSidebarCollapsed ? 'w-4' : 'w-2.5'}`}></span>
                <span className="h-0.5 bg-current rounded-full w-4 sm:w-4.5"></span>
                <span className={`h-0.5 bg-current rounded-full transition-all ${isSidebarCollapsed ? 'w-4' : 'w-3.5 ml-auto'}`}></span>
              </div>
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-[#FF0055] via-[#FF2E7E] to-[#7928CA] flex items-center justify-center shadow-lg shadow-[#FF0055]/30 group-hover:scale-105 transition-transform">
                <Flame className="w-4 h-4 text-white fill-white animate-pulse" />
              </div>
              
              <div className="flex items-center gap-1">
                <span className="text-sm sm:text-base font-black tracking-tight text-white">
                  SKTUBE
                </span>
                <span className="hidden sm:inline-flex text-[8px] sm:text-[9px] font-extrabold px-1 sm:px-1.5 py-0.2 rounded-md bg-[#FF0055]/15 text-[#FF2E7E] border border-[#FF0055]/30">
                  NEO
                </span>
              </div>
            </Link>
          </div>

          {/* 2. Center: Desktop, Tablet & 4K Search Bar with Debounced Live Suggestions */}
          <div 
            ref={searchContainerRef}
            className="relative hidden md:flex items-center justify-center flex-1 max-w-xs md:max-w-sm lg:max-w-xl 2xl:max-w-2xl min-[2560px]:max-w-3xl min-[3840px]:max-w-4xl mx-2 sm:mx-4"
          >
            <form 
              onSubmit={handleSearch}
              className={`relative w-full flex items-center rounded-2xl transition-all duration-300 ${
                isSearchFocused 
                  ? 'bg-[#12121c] ring-2 ring-[#FF0055]/50 shadow-xl shadow-[#FF0055]/15 border-transparent' 
                  : 'bg-white/[0.04] border border-white/10 hover:bg-white/[0.07] hover:border-white/20'
              }`}
            >
              <div className="pl-3.5 text-neutral-400">
                <Search className={`w-4 h-4 ${isSearchFocused ? 'text-[#FF2E7E]' : 'text-neutral-400'}`} />
              </div>

              <input
                type="text"
                placeholder="Explore 4K streams, creators, AI & trends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 outline-none"
              />

              {isSearching ? (
                <Loader2 className="w-4 h-4 mr-2 text-[#FF2E7E] animate-spin shrink-0" />
              ) : searchQuery ? (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery('')}
                  className="p-1 mr-1 text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}

              <div className="pr-3 hidden lg:flex">
                <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-semibold text-neutral-400 bg-white/5 border border-white/10 rounded">
                  <Command className="w-2.5 h-2.5" /> K
                </kbd>
              </div>
            </form>

            {/* Desktop Live Suggestions Dropdown (Debounced 300ms) */}
            {isSearchFocused && searchQuery.trim() && searchResults.length > 0 && (
              <div className="absolute top-12 left-0 right-0 bg-[#0c0c14]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-50 animate-fadeIn flex flex-col gap-1">
                <div className="px-2 py-1 text-[10px] uppercase font-bold text-neutral-500 tracking-wider flex items-center justify-between">
                  <span>Matching Streams</span>
                  <span>Press Enter to search all</span>
                </div>
                {searchResults.map((vid) => (
                  <div
                    key={vid._id}
                    onClick={() => handleSelectSuggestion(vid)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors group"
                  >
                    <div className="relative w-14 h-9 rounded-lg overflow-hidden bg-neutral-900 shrink-0">
                      <img src={vid.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-3 h-3 text-white fill-white" />
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs font-bold text-white group-hover:text-[#FF2E7E] transition-colors truncate">
                        {vid.title}
                      </span>
                      <span className="text-[10px] text-neutral-400 truncate">
                        {vid.owner?.fullName || vid.owner?.username} • {vid.views ? `${vid.views.toLocaleString()} views` : 'New'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Right: Studio (Desktop only), Search (Mobile only), Notifications, Profile/SignIn */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Search Icon Trigger (Visible on Mobile only) */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(true)}
              className="p-2 sm:p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-300 hover:text-white md:hidden cursor-pointer shrink-0 transition-colors"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Desktop Studio Button (Strictly hidden on Mobile & Tablet, available in Sidebar) */}
            <div className="hidden lg:flex items-center">
              <Link 
                to="/upload"
                className="btn-primary px-3.5 py-2 gap-1.5 text-xs inline-flex shrink-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Studio</span>
              </Link>
            </div>

            {/* Notification Bell (Visible on all screen sizes) */}
            <Link 
              to="/notifications"
              onClick={() => setUnreadCount(0)}
              className="flex relative p-2 sm:p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-neutral-300 hover:text-white transition-colors cursor-pointer shrink-0 items-center justify-center"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[18px] text-[9px] font-black text-white bg-[#FF0055] rounded-full flex items-center justify-center shadow-[0_0_10px_#FF0055] animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>

            {/* User Profile or Sign In */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="cursor-pointer shrink-0 p-0.5 rounded-xl bg-gradient-to-tr from-[#FF0055] to-[#7928CA] shadow-md shadow-[#FF0055]/20 hover:scale-105 transition-transform flex items-center justify-center"
                  title="Account Menu"
                >
                  <img 
                    key={currentUser.avatar}
                    src={currentUser.avatar ? (currentUser.avatar.startsWith('http://') ? currentUser.avatar.replace('http://', 'https://') : currentUser.avatar) : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"} 
                    alt={currentUser.fullName || "User"}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-[10px] object-cover bg-neutral-900"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces";
                    }}
                  />
                </button>

                {/* Profile Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-11 sm:top-12 w-56 sm:w-64 max-w-[calc(100vw-1.5rem)] bg-[#0d0d16] rounded-2xl p-2.5 sm:p-3 border border-white/15 shadow-[0_10px_40px_rgba(0,0,0,0.9)] z-50 animate-fadeIn">
                    {/* User Info Header */}
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.05] border border-white/10 mb-2">
                      <div className="w-9 h-9 rounded-xl overflow-hidden bg-neutral-800 ring-1 ring-[#FF0055]/50 shrink-0">
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
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white truncate">
                          {currentUser.fullName || "User"}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono truncate">
                          @{currentUser.username || "creator"}
                        </span>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex flex-col gap-0.5">
                      <Link
                        to="/settings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-[#FF2E7E]" />
                        <span>Profile & Settings</span>
                      </Link>

                      <Link
                        to="/history"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <History className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Watch History</span>
                      </Link>
                    </div>

                    {/* Divider */}
                    <div className="h-[1px] bg-white/10 my-1" />

                    {/* Logout Button */}
                    <button
                      type="button"
                      onClick={handleLogoutClick}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-500/20 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 shrink-0" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/login"
                className="btn-secondary inline-flex flex-row items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold whitespace-nowrap shrink-0 h-9 rounded-xl"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FF2E7E] shrink-0" />
                <span className="whitespace-nowrap">Sign In</span>
              </Link>
            )}
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;
