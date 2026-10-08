import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Flame, 
  Radio, 
  Music, 
  Gamepad2, 
  Sparkles, 
  Film, 
  Trophy, 
  Newspaper, 
  TrendingUp 
} from 'lucide-react';
import videoService from '../services/videoService';
import Pagination from '../components/Pagination';
import { 
  ExploreHeader, 
  ExploreCard, 
  ExploreTrendingItem 
} from '../components/explore';

// ==========================================
// MAIN COMPOUND ROOT COMPONENT: Explore
// ==========================================
const Explore = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const exploreCategories = useMemo(() => [
    { title: "All", icon: TrendingUp, color: "from-[#FF0055] to-purple-600", desc: "Top overall streams" },
    { title: "Gaming", icon: Gamepad2, color: "from-purple-600 to-indigo-600", desc: "Esports & 4K streams" },
    { title: "Music & Lofi", icon: Music, color: "from-emerald-600 to-teal-500", desc: "Audio sessions" },
    { title: "Tech & AI", icon: Sparkles, color: "from-blue-600 to-cyan-500", desc: "Next-gen engineering" },
    { title: "Movies & Cinema", icon: Film, color: "from-amber-600 to-yellow-500", desc: "Trailers & short films" },
    { title: "Sports & Arena", icon: Trophy, color: "from-emerald-500 to-green-600", desc: "Live tournaments" },
    { title: "Live 4K", icon: Radio, color: "from-red-600 to-pink-600", desc: "Real-time broadcasts" },
    { title: "News & World", icon: Newspaper, color: "from-cyan-600 to-blue-700", desc: "Global headlines" },
  ], []);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);

  const formatDuration = useCallback((seconds) => {
    const mins = Math.floor((seconds || 0) / 60);
    const secs = String(Math.floor((seconds || 0) % 60)).padStart(2, '0');
    return `${mins}:${secs}`;
  }, []);

  const handleSelectCategory = useCallback((catTitle) => {
    setSelectedCategory(catTitle);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 350, behavior: 'smooth' });
  }, []);

  const handleLimitChange = useCallback((newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1);
  }, []);

  const navigate = useNavigate();

  const handleWatchVideo = useCallback((video) => {
    if (video?._id) {
      if (video.isLive) {
        navigate(`/live?v=${video._id}`);
      } else {
        navigate(`/watch?v=${video._id}`);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [navigate]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchTrending = async () => {
      try {
        setLoading(true);
        const params = { 
          page: currentPage, 
          limit, 
          sortBy: 'views',
          sortType: 'desc' 
        };

        if (selectedCategory && selectedCategory !== "All" && selectedCategory !== "Live 4K") {
          params.query = selectedCategory.split('&')[0].trim();
        }

        const res = await videoService.getAllVideos(params, { signal: controller.signal });
        if (res?.data?.videos) {
          let fetched = res.data.videos;
          if (selectedCategory === "Live 4K") {
            fetched = fetched.filter(v => v.isLive);
          }
          setTrendingVideos(fetched);
          setTotalPages(res.data.totalPages || 1);
          setTotalVideos(res.data.totalVideos || res.data.videos.length);
        } else if (Array.isArray(res?.data)) {
          let fetched = res.data;
          if (selectedCategory === "Live 4K") {
            fetched = fetched.filter(v => v.isLive);
          }
          setTrendingVideos(fetched);
          setTotalPages(1);
          setTotalVideos(res.data.length);
        } else {
          setTrendingVideos([]);
          setTotalPages(1);
          setTotalVideos(0);
        }
      } catch (err) {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          setTrendingVideos([]);
          setTotalPages(1);
          setTotalVideos(0);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchTrending();
    return () => {
      controller.abort();
    };
  }, [currentPage, limit, selectedCategory]);

  return (
    <div className="flex flex-col gap-8 container-4k pb-24 sm:pb-12">
      {/* 1. Page Header */}
      <ExploreHeader />

      {/* 2. Top Explore Category Hub Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {exploreCategories.map((item) => (
          <ExploreCard 
            key={item.title} 
            item={item} 
            isSelected={selectedCategory === item.title}
            onSelect={handleSelectCategory} 
          />
        ))}
      </div>

      {/* 3. Trending Ranked Video Stream Feed */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg 2xl:text-xl font-black text-white flex items-center gap-2 tracking-tight">
            <Flame className="w-5 h-5 text-[#FF0055]" />
            <span>Ranked Trending Leaderboard {selectedCategory !== 'All' ? `• ${selectedCategory}` : ''}</span>
          </h2>
          <span className="text-xs text-neutral-400">Sorted by highest view count</span>
        </div>

        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row gap-4 animate-pulse border border-white/5">
                <div className="aspect-video w-full sm:w-64 2xl:w-80 rounded-xl bg-white/10 shrink-0"></div>
                <div className="flex-1 flex flex-col gap-3 justify-center">
                  <div className="w-3/4 h-4 bg-white/10 rounded"></div>
                  <div className="w-1/3 h-3 bg-white/5 rounded"></div>
                  <div className="w-1/2 h-2.5 bg-white/5 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : trendingVideos.length === 0 ? (
          <div className="py-20 text-center glass-panel rounded-2xl border border-white/10 p-8">
            <Flame className="w-12 h-12 text-[#FF0055]/50 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No Trending Streams Found</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
              No streams found for "{selectedCategory}". Switch to "All" to view the top ranked videos.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {trendingVideos.map((video, index) => (
              <ExploreTrendingItem
                key={video._id}
                video={video}
                rank={(currentPage - 1) * limit + index + 1}
                formatDuration={formatDuration}
                onWatch={handleWatchVideo}
              />
            ))}
          </div>
        )}

        {/* 4. Compound Pagination */}
        {totalPages > 1 && (
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalVideos}
            limit={limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            itemLabel="Trending Streams"
          />
        )}
      </div>
    </div>
  );
};

// Attach compound subcomponents for dot notation
Explore.Header = ExploreHeader;
Explore.Card = ExploreCard;
Explore.TrendingItem = ExploreTrendingItem;
Explore.Pagination = Pagination;

export default Explore;
