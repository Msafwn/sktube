import React, { useState, useEffect, useCallback } from 'react';
import { History } from 'lucide-react';
import { useModal } from '../context/ModalContext';
import userService from '../services/userService';
import { HistoryHeader, HistoryItem } from '../components/history';

// ==========================================
// MAIN COMPOUND ROOT COMPONENT: WatchHistory
// ==========================================
const WatchHistory = () => {
  const { showConfirm, showToast } = useModal();
  const [historyVideos, setHistoryVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Format Duration with useCallback
  const formatDuration = useCallback((seconds) => {
    const mins = Math.floor((seconds || 0) / 60);
    const secs = String(Math.floor((seconds || 0) % 60)).padStart(2, '0');
    return `${mins}:${secs}`;
  }, []);

  const removeItem = useCallback(async (id) => {
    setHistoryVideos((prev) => prev.filter((item) => item._id !== id));
    try {
      await userService.removeVideoFromHistory(id);
    } catch (e) {
      console.error("Error removing video from history:", e);
    }
  }, []);

  const clearAll = useCallback(() => {
    showConfirm({
      title: 'Clear Watch History?',
      message: 'Are you sure you want to clear your entire watch history? This cannot be recovered.',
      type: 'danger',
      confirmText: 'Clear History',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setHistoryVideos([]);
        try {
          await userService.clearWatchHistory();
          showToast({ message: 'Watch history cleared', type: 'success' });
        } catch (e) {
          console.error("Error clearing watch history:", e);
          showToast({ message: 'Failed to clear history', type: 'error' });
        }
      }
    });
  }, [showConfirm, showToast]);

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await userService.getWatchHistory();
        if (isMounted) {
          if (Array.isArray(res?.data)) {
            setHistoryVideos(res.data);
          } else {
            setHistoryVideos([]);
          }
        }
      } catch (err) {
        if (isMounted) {
          setHistoryVideos([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 container-4k pb-24 sm:pb-12">
      <HistoryHeader 
        count={historyVideos.length} 
        onClearAll={clearAll} 
      />

      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row gap-4 animate-pulse border border-white/5">
                <div className="aspect-video w-full sm:w-60 2xl:w-72 rounded-xl bg-white/10 shrink-0"></div>
                <div className="flex-1 flex flex-col gap-3 justify-center">
                  <div className="w-3/4 h-4 bg-white/10 rounded"></div>
                  <div className="w-1/3 h-3 bg-white/5 rounded"></div>
                  <div className="w-1/2 h-2.5 bg-white/5 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : historyVideos.length > 0 ? (
          historyVideos.map((item) => (
            <HistoryItem
              key={item._id}
              item={item}
              formatDuration={formatDuration}
              onRemove={removeItem}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF2E7E]">
              <History className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">No Watch History</h3>
            <p className="text-xs text-neutral-400 max-w-sm">
              Videos that you stream or watch will automatically appear here in your timeline.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Attach compound subcomponents for dot notation
WatchHistory.Header = HistoryHeader;
WatchHistory.Item = HistoryItem;

export default WatchHistory;
