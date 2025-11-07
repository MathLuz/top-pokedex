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
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome ou ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
      </div>

      {/* Filter Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-4 w-4" />
            Limpar
          </button>
        )}
      </div>

      {/* Type Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Filtrar por Tipos (máximo 2)
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400">
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
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  )}
                >
                  {formatPokemonName(type)}
                </button>
              );
            })}
          </div>

          {selectedTypes.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
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