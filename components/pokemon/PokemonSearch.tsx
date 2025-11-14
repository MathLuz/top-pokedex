'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { POKEMON_TYPES, formatPokemonName } from '@/lib/utils/pokemon';
import { cn } from '@/lib/utils';

interface PokemonSearchProps {
  searchQuery: string;
  selectedTypes: string[];
  onSearchChange: (query: string) => void;
  onTypesChange: (types: string[]) => void;
  className?: string;
}

export function PokemonSearch({
  searchQuery,
  selectedTypes,
  onSearchChange,
  onTypesChange,
  className
}: PokemonSearchProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleTypeToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter(t => t !== type));
    } else {
      if (selectedTypes.length < 2) {
        onTypesChange([...selectedTypes, type]);
      }
    }
  };

  const clearFilters = () => {
    onTypesChange([]);
    onSearchChange('');
  };

  const activeFiltersCount = selectedTypes.length + (searchQuery ? 1 : 0);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Buscar por nome ou ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
      </div>

      {/* Filter Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
        >
          <Filter className="h-4 w-4" />
          Filtros por Tipo
          {activeFiltersCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            <X className="h-4 w-4" />
            Limpar
          </button>
        )}
      </div>

      {/* Type Filters */}
      {showFilters && (
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-zinc-900 dark:text-white">
              Filtrar por Tipos (máximo 2)
            </h4>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {selectedTypes.length}/2 selecionados
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {POKEMON_TYPES.map((type) => {
              const isSelected = selectedTypes.includes(type);
              const isDisabled = !isSelected && selectedTypes.length >= 2;

              return (
                <button
                  key={type}
                  onClick={() => handleTypeToggle(type)}
                  disabled={isDisabled}
                  className={cn(
                    'px-3 py-2 text-xs font-medium rounded-lg border transition-colors',
                    isSelected
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-600'
                      : isDisabled
                      ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-600 cursor-not-allowed'
                      : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                  )}
                >
                  {formatPokemonName(type)}
                </button>
              );
            })}
          </div>

          {selectedTypes.length > 0 && (
            <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-600">
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                Tipos selecionados:
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedTypes.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                  >
                    {formatPokemonName(type)}
                    <button
                      onClick={() => handleTypeToggle(type)}
                      className="hover:text-blue-600 dark:hover:text-blue-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}