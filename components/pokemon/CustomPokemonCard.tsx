'use client';

import { Heart, Trash2 } from 'lucide-react';
import { PokemonCardData } from '@/types/pokemon';
import { formatPokemonName, formatPokemonId, getTypeColor } from '@/lib/utils/pokemon';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { PokemonPlaceholder } from './PokemonPlaceholder';
import { useState } from 'react';

interface CustomPokemonCardProps {
  pokemon: PokemonCardData;
  onClick?: () => void;
  onDelete?: () => void;
  className?: string;
  isSelected?: boolean;
}

export function CustomPokemonCard({ pokemon, onClick, onDelete, className, isSelected = false }: CustomPokemonCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [imageError, setImageError] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(pokemon.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <div
      className={cn(
        'group relative bg-white dark:bg-zinc-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-1',
        isSelected ? 'ring-2 ring-blue-500 z-30 animate-tilt-3d' : 'z-10',
        'hover:!z-50',
        className
      )}
      onClick={onClick}
    >
      {/* Action Buttons */}
      <div className="absolute top-3 right-3 z-10 flex gap-2">
        <button
          onClick={handleFavoriteClick}
          className="p-2 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-zinc-800 transition-colors"
          aria-label={isFavorite(pokemon.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart
            className={cn(
              'h-4 w-4 transition-colors',
              isFavorite(pokemon.id)
                ? 'fill-red-500 text-red-500'
                : 'text-zinc-400 hover:text-red-400'
            )}
          />
        </button>
        
        {onDelete && (
          <button
            onClick={handleDeleteClick}
            className="p-2 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            aria-label="Excluir pokémon"
          >
            <Trash2 className="h-4 w-4 text-zinc-400 hover:text-red-500 transition-colors" />
          </button>
        )}
      </div>

      {/* Custom Badge */}
      {pokemon.isCustom && (
        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-md">
          Custom
        </div>
      )}

      {/* Pokemon Image */}
      <div className="relative h-48 flex items-center justify-center p-4">
        {imageError || !pokemon.image || pokemon.image.trim() === '' ? (
          <PokemonPlaceholder size="sm" />
        ) : (
          <Image
            src={pokemon.image}
            width={128}
            height={128}
            alt={formatPokemonName(pokemon.name)}
            className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        )}
      </div>

      {/* Pokemon Info */}
      <div className="p-4 pt-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
            {formatPokemonName(pokemon.name)}
          </h3>
          <span className="text-sm text-zinc-500 dark:text-zinc-400 font-mono">
            {formatPokemonId(pokemon.id)}
          </span>
        </div>

        {/* Types */}
        <div className="flex flex-wrap gap-2">
          {pokemon.types.length > 0 ? (
            pokemon.types.map((type) => (
              <span
                key={type}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white shadow-sm"
                style={{ backgroundColor: getTypeColor(type) }}
              >
                {formatPokemonName(type)}
              </span>
            ))
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white bg-zinc-400">
              Desconhecido
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
