'use client';

import { PokemonCard } from './PokemonCard';
import { PokemonCardData } from '@/types/pokemon';
import { cn } from '@/lib/utils';

interface PokemonGridProps {
  pokemons: PokemonCardData[];
  onPokemonClick: (pokemon: PokemonCardData) => void;
  className?: string;
}

export function PokemonGrid({ pokemons, onPokemonClick, className }: PokemonGridProps) {
  if (pokemons.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">🔍</div>
          <h3 className="text-lg font-medium mb-1">Nenhum Pokémon encontrado</h3>
          <p className="text-sm">Tente ajustar sua busca ou filtros</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
      className
    )}>
      {pokemons.map((pokemon) => (
        <PokemonCard
          key={`${pokemon.isCustom ? 'custom' : 'api'}-${pokemon.id}`}
          pokemon={pokemon}
          onClick={() => onPokemonClick(pokemon)}
        />
      ))}
    </div>
  );
}