import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { 
  DashboardHeader, 
  DashboardStats, 
  DashboardVideoTable, 
  EditVideoModal 
} from '../components/dashboard';
import dashboardService from '../services/dashboardService';
import videoService from '../services/videoService';

// ==========================================
// MAIN COMPOUND ROOT COMPONENT: Dashboard (Studio)
// ==========================================
const Dashboard = () => {
  const { user } = useAuth();
  const { showConfirm, showToast } = useModal();
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalViews: 0,
    totalSubscribers: 0,
    totalLikes: 0
  });
  const [videos, setVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingVideo, setEditingVideo] = useState(null);

  // Fetch channel stats & videos
  const fetchStudioData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, videosRes] = await Promise.allSettled([
        dashboardService.getChannelStats(),
        dashboardService.getChannelVideos()
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        setStats(statsRes.value.data);
      }
      if (videosRes.status === 'fulfilled' && Array.isArray(videosRes.value?.data)) {
        setVideos(videosRes.value.data);
      } else {
        setVideos([]);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudioData();
  }, [fetchStudioData]);

  // Handle Edit Save
  const handleSaveVideo = useCallback(async (videoId, payload) => {
    const res = await videoService.updateVideo(videoId, payload);
    const updatedVideo = res?.data;
    if (updatedVideo) {
      setVideos(prev => prev.map(v => v._id === videoId ? { ...v, ...updatedVideo } : v));
    } else {
      fetchStudioData();
    }
  }, [fetchStudioData]);

  // Handle Delete
  const handleDelete = useCallback((id) => {
    showConfirm({
      title: 'Delete Video?',
      message: 'Are you sure you want to permanently delete this video? This action cannot be undone.',
      type: 'danger',
      confirmText: 'Delete Video',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await videoService.deleteVideo(id);
          setVideos(prev => prev.filter(v => v._id !== id));
          setStats(prev => ({
            ...prev,
            totalVideos: Math.max(0, (prev.totalVideos || 1) - 1)
          }));
          showToast({ message: 'Video permanently deleted', type: 'success' });
        } catch (err) {
          console.error('Error deleting video:', err);
          showToast({ message: err.message || 'Failed to delete video', type: 'error' });
        }
      }
    });
  }, [showConfirm, showToast]);

  // Handle Publish/Draft Toggle
  const handleTogglePublish = useCallback(async (id) => {
    try {
      await videoService.togglePublishStatus(id);
      setVideos(prev => prev.map(v => 
        v._id === id ? { ...v, isPublished: !v.isPublished } : v
      ));
    } catch (err) {
      console.error('Error toggling publish status:', err);
    }
  }, []);

  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return videos;
    return videos.filter(v => 
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [videos, searchQuery]);

  return (
    <div className="flex flex-col gap-6 container-4k pb-24 sm:pb-12">
      {/* 1. Studio Header */}
      <DashboardHeader 
        user={user} 
        totalVideos={stats.totalVideos} 
      />

      {/* 2. Stats Grid */}
      <DashboardStats 
        stats={stats} 
      />

      {/* 3. Content Table */}
      <DashboardVideoTable 
        videos={filteredVideos}
        onEdit={(vid) => setEditingVideo(vid)}
        onDelete={handleDelete}
        onTogglePublish={handleTogglePublish}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* 4. Edit Video Modal */}
      {editingVideo && (
        <EditVideoModal
          video={editingVideo}
          onClose={() => setEditingVideo(null)}
          onSave={handleSaveVideo}
        />
      )}
    </div>
  );
};

// Compound Object assignment for dot notation
Dashboard.Header = DashboardHeader;
Dashboard.Stats = DashboardStats;
Dashboard.VideoTable = DashboardVideoTable;

export default Dashboard;
