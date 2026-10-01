import React from 'react';
import { History, Trash2 } from 'lucide-react';

const HistoryHeader = ({ count, onClearAll }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 2xl:p-7 rounded-2xl glass-panel border border-white/10 shadow-xl">
    <div className="flex items-center gap-3.5">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#FF0055] via-[#FF2E7E] to-[#7928CA] flex items-center justify-center text-white shadow-lg shadow-[#FF0055]/30 shrink-0">
        <History className="w-6 h-6" />
      </div>
      <div>
        <h1 className="text-xl 2xl:text-2xl font-black text-white tracking-tight">
          Watch History
        </h1>
        <p className="text-xs 2xl:text-sm text-neutral-400">
          {count} streams saved in your timeline
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2">
      {count > 0 && (
        <button
          onClick={onClearAll}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-neutral-300 hover:text-rose-400 border border-white/10 text-xs 2xl:text-sm font-semibold transition-all cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear History</span>
        </button>
      )}
    </div>
  </div>
);

export default HistoryHeader;
