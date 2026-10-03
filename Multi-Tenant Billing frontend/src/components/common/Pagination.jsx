import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  itemName = 'items',
}) => {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers range with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="p-4 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold">
      {/* Left Info Label */}
      <div className="text-slate-500 font-medium">
        Showing <strong className="text-slate-900 font-bold">{startItem} to {endItem}</strong> of{' '}
        <strong className="text-slate-900 font-bold">{totalItems}</strong> {itemName}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Page Buttons */}
        <div className="flex items-center gap-1">
          {/* Previous Button */}
          <button
            disabled={currentPage <= 1}
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 font-bold select-none">
                  ...
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={`page-${page}`}
                onClick={() => onPageChange && onPageChange(page)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'border border-slate-200 text-slate-700 hover:bg-white hover:text-indigo-600'
                }`}
              >
                {page}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
            title="Next Page"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Page Size Dropdown Selector */}
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option} / page
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

export default Pagination;
