import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Film, 
  Flame, 
  Radio, 
  Sparkles, 
  Search, 
  X,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import videoService from '../services/videoService';
import useDebounce from '../hooks/useDebounce';
import { useThrottleCallback } from '../hooks/useThrottle';
import Pagination from '../components/Pagination';
import { 
  HomeHero, 
  HomeFilters, 
  HomeCard, 
  HomeGrid 
} from '../components/home';

// ==========================================
// MAIN COMPOUND ROOT COMPONENT: Home
// ==========================================
const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState('✨ All Cinema');

  // Search Params
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('query') || '';
  const debouncedSearchQuery = useDebounce(searchQuery, 350);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);

  const navigate = useNavigate();

  // Modern Neo categories memoized
  const categories = useMemo(() => [
    { name: '✨ All Cinema', icon: Film },
    { name: '🔥 Trending', icon: Flame },
    { name: '🔴 Live 4K', icon: Radio },
    { name: '💻 Web Dev & AI', icon: Sparkles },
    { name: '🎮 Cyber Gaming', icon: null },
    { name: '🎧 Lofi & Sound', icon: null },
    { name: '⚡ Tech & Setup', icon: null },
    { name: '🎬 Short Films', icon: null }
  ], []);

  // Format Duration useCallback
  const formatDuration = useCallback((seconds) => {
    const mins = Math.floor((seconds || 0) / 60);
    const secs = String(Math.floor((seconds || 0) % 60)).padStart(2, '0');
    return `${mins}:${secs}`;
  }, []);

  // Category Selection useCallback
  const handleSelectCategory = useCallback((categoryName) => {
    setActiveCategory(categoryName);
    setCurrentPage(1);
    setVideos([]);
  }, []);

  // Watch Video Handler
  const handleWatchStream = useCallback((video) => {
    if (video?._id) {
      if (video.isLive) {
        navigate(`/live?v=${video._id}`);
      } else {
        navigate(`/watch?v=${video._id}`);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [navigate]);

  // Backend Fetch Videos with Debounced Search Query & Pagination
  useEffect(() => {
    const controller = new AbortController();

    const loadVideos = async () => {
      try {
        if (currentPage === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const params = {
          page: currentPage,
          limit: limit,
          sortBy: activeCategory === '🔥 Trending' ? 'views' : 'createdAt',
          sortType: 'desc'
        };

        if (debouncedSearchQuery.trim()) {
          params.query = debouncedSearchQuery.trim();
        }

        const res = await videoService.getAllVideos(params, { signal: controller.signal });
        let fetched = [];
        if (res?.data?.videos) {
          fetched = res.data.videos;
          if (activeCategory === '🔴 Live 4K') {
            fetched = fetched.filter(v => v.isLive);
          }
          setTotalPages(res.data.totalPages || 1);
          setTotalVideos(res.data.totalVideos || res.data.videos.length);
        } else if (Array.isArray(res?.data)) {
          fetched = res.data;
          if (activeCategory === '🔴 Live 4K') {
            fetched = fetched.filter(v => v.isLive);
          }
          setTotalPages(1);
          setTotalVideos(res.data.length);
        }

        // Append videos if loading page > 1, or replace if page 1
        setVideos(prev => {
          if (currentPage === 1) return fetched;
          // Prevent duplicate IDs when appending
          const existingIds = new Set(prev.map(v => v._id));
          const uniqueNew = fetched.filter(v => !existingIds.has(v._id));
          return [...prev, ...uniqueNew];
        });
      } catch (err) {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          if (currentPage === 1) {
            setVideos([]);
            setTotalPages(1);
            setTotalVideos(0);
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    loadVideos();
    return () => {
      controller.abort();
    };
  }, [currentPage, limit, debouncedSearchQuery, activeCategory]);

  // ==========================================
  // THROTTLED INFINITE SCROLL LISTENER (200ms)
  // ==========================================
  // Throttled handler checks scroll position at most once every 200ms
  const handleThrottledScroll = useThrottleCallback(() => {
    if (loading || loadingMore) return;
    if (currentPage >= totalPages) return;

    // Check if user is within 400px of page bottom
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.documentElement.scrollHeight - 400;

    if (scrollPosition >= threshold) {
      setCurrentPage(prev => prev + 1);
    }
  }, 200);

  useEffect(() => {
    window.addEventListener('scroll', handleThrottledScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleThrottledScroll);
  }, [handleThrottledScroll]);

  // Reset pagination when search query changes
  useEffect(() => {
    setCurrentPage(1);
    setVideos([]);
  }, [debouncedSearchQuery]);

  const clearSearch = () => {
    searchParams.delete('query');
    setSearchParams(searchParams);
  };

  // Featured Spotlight Hero (First video on Page 1 without search)
  const featuredVideo = videos.length > 0 && !searchQuery ? videos[0] : null;

  return (
    <div className="flex flex-col gap-8 container-4k pb-24 sm:pb-16">
      {/* Search Filter Header (if searching) */}
      {searchQuery && (
        <div className="flex items-center justify-between p-4 rounded-2xl glass-panel border border-[#FF0055]/30">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-[#FF2E7E]" />
            <span className="text-sm text-neutral-300">
              Search results for: <span className="font-bold text-white">"{searchQuery}"</span>
            </span>
          </div>
          <button
            onClick={clearSearch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      )}

      {/* 1. Hero Spotlight */}
      {featuredVideo && (
        <HomeHero featuredVideo={featuredVideo} onWatch={handleWatchStream} />
      )}

      {/* 2. Category Filters */}
      <HomeFilters 
        categories={categories} 
        activeCategory={activeCategory} 
        onSelectCategory={handleSelectCategory} 
      />

      {/* 3. Stream Video Grid */}
      <HomeGrid 
        videos={videos} 
        formatDuration={formatDuration} 
        onWatch={handleWatchStream} 
        loading={loading}
      />

      {/* 4. Infinite Scroll Indicators */}
      <div className="flex flex-col items-center justify-center py-6">
        {loadingMore && (
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <Loader2 className="w-5 h-5 text-[#FF0055] animate-spin" />
            <span className="text-xs font-bold text-neutral-300 tracking-wide">
              Loading more cinema streams...
            </span>
          </div>
        )}

        {!loading && !loadingMore && videos.length > 0 && currentPage >= totalPages && (
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/[0.03] border border-white/5 text-neutral-400 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400/70 shrink-0" />
            <span>You've explored all {totalVideos} streams</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Attach compound subcomponents for dot notation
Home.Hero = HomeHero;
Home.Filters = HomeFilters;
Home.Grid = HomeGrid;
Home.Card = HomeCard;
Home.Pagination = Pagination;

export default Home;
