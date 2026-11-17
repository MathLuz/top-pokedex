'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PokemonPaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  className?: string;
}

export function PokemonPagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  className
}: PokemonPaginationProps) {
  const itemsPerPageOptions = [12, 24, 36, 48];

  const startItem = ((currentPage - 1) * itemsPerPage) + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mantém sempre 5 páginas visíveis, inclusive perto do fim
      const start = Math.max(1, Math.min(currentPage - 2, totalPages - maxVisible + 1));
      const end = start + maxVisible - 1;
      
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalItems === 0) return null;

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700', className)}>
      {/* Items per page selector */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">Mostrar</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="border border-zinc-300 dark:border-zinc-600 rounded-md px-2 py-1 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
        >
          {itemsPerPageOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="text-zinc-600 dark:text-zinc-400">por página</span>
      </div>

      {/* Page info */}
      <div className="text-sm text-zinc-600 dark:text-zinc-400">
        Mostrando {startItem}-{endItem} de {totalItems} pokémons
      </div>

      {/* Pagination controls */}
      <div className={cn('flex items-center gap-1', totalPages <= 1 && 'invisible')}>
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-md border transition-colors',
            currentPage === 1
              ? 'border-zinc-200 dark:border-zinc-600 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
              : 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getPageNumbers().map((page, index) => (
          <button
            key={page === '...' ? `ellipsis-${index}` : page}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-md border text-sm transition-colors',
              page === '...'
                ? 'border-transparent text-zinc-400 dark:text-zinc-500 cursor-default'
                : page === currentPage
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                : 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700'
            )}
          >
            {page}
          </button>
        ))}

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-md border transition-colors',
            currentPage === totalPages
              ? 'border-zinc-200 dark:border-zinc-600 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
              : 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700'
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}