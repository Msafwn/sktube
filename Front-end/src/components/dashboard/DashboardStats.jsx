import React from 'react';
import { 
  Users, 
  Eye, 
  Heart, 
  Film, 
  TrendingUp 
} from 'lucide-react';

const DashboardStats = ({ stats }) => {
  const statCards = [
    {
      title: "Total Subscribers",
      value: stats.totalSubscribers?.toLocaleString() || "0",
      change: "Audience Community",
      icon: Users,
      color: "from-blue-500/20 to-indigo-500/10",
      border: "border-blue-500/30",
      iconColor: "text-blue-400"
    },
    {
      title: "Total Views",
      value: stats.totalViews?.toLocaleString() || "0",
      change: "Lifetime Channel Views",
      icon: Eye,
      color: "from-[#FF0055]/20 to-[#FF2E7E]/10",
      border: "border-[#FF0055]/30",
      iconColor: "text-[#FF2E7E]"
    },
    {
      title: "Stream Likes",
      value: stats.totalLikes?.toLocaleString() || "0",
      change: "Creator Positive Feedback",
      icon: Heart,
      color: "from-rose-500/20 to-pink-500/10",
      border: "border-rose-500/30",
      iconColor: "text-rose-400"
    },
    {
      title: "Published Streams",
      value: stats.totalVideos?.toLocaleString() || "0",
      change: "All 4K UHD enabled",
      icon: Film,
      color: "from-purple-500/20 to-violet-500/10",
      border: "border-purple-500/30",
      iconColor: "text-purple-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 2xl:gap-6">
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div 
            key={idx}
            className={`p-5 2xl:p-6 rounded-2xl glass-card border ${card.border} bg-gradient-to-br ${card.color} shadow-xl relative overflow-hidden group hover:-translate-y-0.5 transition-all`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs 2xl:text-sm font-semibold text-neutral-400">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-xl bg-white/5 ${card.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl 2xl:text-3xl font-black text-white tracking-tight">
                {card.value}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 text-[11px] 2xl:text-xs text-neutral-400">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">{card.change}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
