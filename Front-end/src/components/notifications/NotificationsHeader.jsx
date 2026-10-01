import React from 'react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';

const NotificationsHeader = ({ unreadCount, onMarkAllAsRead, onClearAll, totalCount }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 2xl:p-7 rounded-2xl glass-panel border border-white/10 shadow-2xl relative overflow-hidden">
    <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#FF0055]/10 rounded-full blur-3xl pointer-events-none" />

    <div className="flex items-center gap-4 relative z-10">
      <div className="w-12 h-12 2xl:w-14 2xl:h-14 rounded-2xl bg-gradient-to-tr from-[#FF0055] via-[#FF2E7E] to-[#7928CA] flex items-center justify-center text-white shadow-lg shadow-[#FF0055]/30 shrink-0">
        <Bell className="w-6 h-6 text-white" />
      </div>

      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl 2xl:text-2xl font-black text-white tracking-tight">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span className="text-[10px] 2xl:text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#FF0055] text-white shadow-[0_0_12px_#FF0055]/50 animate-pulse">
              {unreadCount} NEW
            </span>
          )}
        </div>
        <p className="text-xs 2xl:text-sm text-neutral-400 mt-0.5">
          Real-time activity saved directly to database (subscribers, uploads, comments & alerts)
        </p>
      </div>
    </div>

    {/* Quick Header Actions */}
    {totalCount > 0 && (
      <div className="flex items-center gap-2.5 relative z-10">
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 text-xs 2xl:text-sm font-semibold transition-all cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-[#FF2E7E]" />
            <span>Mark all read</span>
          </button>
        )}
        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-white/10 text-xs 2xl:text-sm font-semibold transition-all cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear all</span>
        </button>
      </div>
    )}
  </div>
);

export default NotificationsHeader;
