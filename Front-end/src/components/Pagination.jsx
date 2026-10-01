import React, { useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';

/**
 * SKTUBE Neo Ultra-Premium 4K Pagination Component
 * Features:
 * - Cyberpunk Neo Glassmorphic Container with Ambient Glow
 * - Interactive Tactile Buttons with Hover Motion & Glow Shadows
 * - Smart Ellipsis Navigation for Large Page Ranges
 * - Integrated Responsive Items Counter & Page Size Selector
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  limit = 10,
  onPageChange,
  onLimitChange,
  itemLabel = "Streams",
  showLimitSelector = true
}) => {
  if (totalPages <= 1 && totalItems <= limit) {
    return null; // Don't clutter UI if everything fits on 1 page
  }

  // Calculate visible page numbers with smart ellipsis (e.g., 1 ... 4 5 6 ... 12)
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        start = 2;
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
      }

      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');

      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // Calculate current range slice e.g. "1 - 12 of 13"
  const startItem = totalItems > 0 ? (currentPage - 1) * limit + 1 : 0;
  const endItem = Math.min(currentPage * limit, totalItems);

  return (
    <div className="relative overflow-hidden glass-panel border border-white/10 hover:border-white/15 p-3 sm:p-4 2xl:p-5 rounded-2xl sm:rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] mt-6 transition-all duration-300">
      {/* Background Decorative Ambient Radial Glow */}
      <div className="absolute -left-12 -top-12 w-40 h-40 bg-[#FF0055]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-[#7928CA]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
        
        {/* 1. Left: Stream Counter & Page Progress Pill */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Total Count Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 shadow-inner">
            <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-[#FF0055] to-[#7928CA] flex items-center justify-center text-white shadow-sm shadow-[#FF0055]/30">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-black text-white tracking-wide">
              {totalItems || 0}
            </span>
            <span className="text-xs text-neutral-400 font-medium">
              {itemLabel}
            </span>
          </div>

          {/* Page Info & Range Slice */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <span className="hidden sm:inline">Showing</span>
            <span className="text-neutral-200 font-semibold">{startItem}–{endItem}</span>
            <span className="text-neutral-500">•</span>
            <span>
              Page <strong className="text-white font-bold">{currentPage}</strong> of <strong className="text-white font-bold">{totalPages || 1}</strong>
            </span>
          </div>
        </div>

        {/* 2. Center: Sleek Interactive Navigation Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
          {/* Jump to First Page */}
          <button
            onClick={() => hasPrev && onPageChange(1)}
            disabled={!hasPrev}
            className={`p-2 rounded-xl border text-xs transition-all duration-200 cursor-pointer active:scale-95 ${
              hasPrev
                ? 'bg-white/[0.04] hover:bg-white/[0.1] text-neutral-300 hover:text-white border-white/10 hover:border-white/25 hover:shadow-[0_0_12px_rgba(255,255,255,0.08)]'
                : 'bg-white/[0.01] text-neutral-600 border-white/5 cursor-not-allowed opacity-40'
            }`}
            title="First Page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous Page Button */}
          <button
            onClick={() => hasPrev && onPageChange(currentPage - 1)}
            disabled={!hasPrev}
            className={`group flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
              hasPrev
                ? 'bg-white/[0.04] hover:bg-white/[0.1] text-neutral-200 hover:text-white border-white/10 hover:border-white/25 hover:shadow-[0_0_15px_rgba(255,0,85,0.12)]'
                : 'bg-white/[0.01] text-neutral-600 border-white/5 cursor-not-allowed opacity-40'
            }`}
          >
            <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Prev</span>
          </button>

          {/* Numbered Pills */}
          <div className="flex items-center gap-1 sm:gap-1.5 mx-1">
            {pageNumbers.map((p, idx) => {
              if (p === '...') {
                return (
                  <span 
                    key={`dots-${idx}`} 
                    className="w-8 h-8 flex items-center justify-center text-neutral-500 font-mono text-xs tracking-widest select-none"
                  >
                    •••
                  </span>
                );
              }
              const isActive = p === currentPage;
              return (
                <button
                  key={`page-${p}`}
                  onClick={() => onPageChange(p)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-tr from-[#FF0055] via-[#FF2E7E] to-[#7928CA] text-white shadow-[0_0_20px_rgba(255,0,85,0.45)] border border-[#FF0055]/60 scale-105 ring-2 ring-[#FF0055]/30'
                      : 'bg-white/[0.04] hover:bg-white/[0.1] text-neutral-300 hover:text-white border border-white/10 hover:border-[#FF0055]/40 hover:shadow-[0_0_12px_rgba(255,0,85,0.15)]'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Next Page Button */}
          <button
            onClick={() => hasNext && onPageChange(currentPage + 1)}
            disabled={!hasNext}
            className={`group flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
              hasNext
                ? 'bg-white/[0.04] hover:bg-white/[0.1] text-neutral-200 hover:text-white border-white/10 hover:border-white/25 hover:shadow-[0_0_15px_rgba(255,0,85,0.12)]'
                : 'bg-white/[0.01] text-neutral-600 border-white/5 cursor-not-allowed opacity-40'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>

          {/* Jump to Last Page */}
          <button
            onClick={() => hasNext && onPageChange(totalPages)}
            disabled={!hasNext}
            className={`p-2 rounded-xl border text-xs transition-all duration-200 cursor-pointer active:scale-95 ${
              hasNext
                ? 'bg-white/[0.04] hover:bg-white/[0.1] text-neutral-300 hover:text-white border-white/10 hover:border-white/25 hover:shadow-[0_0_12px_rgba(255,255,255,0.08)]'
                : 'bg-white/[0.01] text-neutral-600 border-white/5 cursor-not-allowed opacity-40'
            }`}
            title="Last Page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3. Right: Page Size / Limit Selector */}
        {showLimitSelector && onLimitChange && (
          <div className="flex items-center gap-2 text-xs text-neutral-400 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-neutral-400">Rows:</span>
            <div className="relative">
              <select
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                className="bg-[#10101a] hover:bg-[#151522] border border-white/15 text-white font-semibold rounded-xl pl-2.5 pr-6 py-1.5 text-xs outline-none focus:border-[#FF0055] focus:ring-1 focus:ring-[#FF0055]/40 transition-all cursor-pointer appearance-none shadow-inner"
              >
                <option value={6}>6 / page</option>
                <option value={10}>10 / page</option>
                <option value={12}>12 / page</option>
                <option value={15}>15 / page</option>
                <option value={20}>20 / page</option>
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 text-[10px]">
                ▼
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Pagination;
