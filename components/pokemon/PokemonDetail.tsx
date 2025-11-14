'use client';

import { useState, useEffect } from 'react';
import { X, Heart, Ruler, Weight } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight, faSearch } from '@fortawesome/free-solid-svg-icons';
import { PokemonDetailData } from '@/types/pokemon';
import { PokemonAPI } from '@/lib/api/pokemon';
import { formatPokemonName, formatPokemonId, getTypeColor } from '@/lib/utils/pokemon';
import { useFavorites } from '@/hooks/useFavorites';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { PokemonPlaceholder } from './PokemonPlaceholder';

interface PokemonDetailProps {
  pokemon: PokemonDetailData | null;
  onClose?: () => void;
  isMobile?: boolean;
  onSelectPokemon?: (pokemonId: number) => void;
}

export function PokemonDetail({ pokemon, onClose, isMobile = false, onSelectPokemon }: PokemonDetailProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [evolutionChain, setEvolutionChain] = useState<string[]>([]);
  const [isLoadingEvolution, setIsLoadingEvolution] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false); // Reset image error when pokemon changes
    if (pokemon && !pokemon.isCustom) {
      setIsLoadingEvolution(true);
      PokemonAPI.getPokemonEvolutionChain(pokemon.name)
        .then(setEvolutionChain)
        .catch(console.error)
        .finally(() => setIsLoadingEvolution(false));
    } else {
      setEvolutionChain([]);
    }
  }, [pokemon]);

  if (!pokemon) {
    return (
      <div className={cn(
        'flex items-center justify-center h-full bg-zinc-50 dark:bg-zinc-900',
        isMobile ? 'min-h-screen' : 'min-h-96'
      )}>
        <div className="text-center text-zinc-500 dark:text-zinc-400">
          <FontAwesomeIcon icon={faSearch} className="text-6xl mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum Pokémon selecionado</h3>
          <p className="text-sm">Selecione um Pokémon para ver os detalhes</p>
        </div>
      </div>
    );
  }

  const handleFavoriteClick = () => {
    toggleFavorite(pokemon.id);
  };

  const containerClasses = cn(
    'bg-white dark:bg-zinc-800 border-l border-zinc-200 dark:border-zinc-700',
    isMobile && 'fixed inset-0 z-50 border-l-0'
  );

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-700">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Detalhes do Pokémon
        </h2>
        {isMobile && (
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            aria-label="Fechar detalhes"
          >
            <X className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 overflow-y-auto">
        {/* Main Info */}
        <div className="text-center space-y-4">
          {/* Pokemon Image */}
          <div className="relative h-48 flex items-center justify-center">
            {imageError || !pokemon.image || pokemon.image.trim() === '' ? (
              <PokemonPlaceholder size="lg" />
            ) : (
              <Image
                src={pokemon.image}
                alt={formatPokemonName(pokemon.name)}
                width={192}
                height={192}
                className="max-h-full object-contain"
                onError={() => setImageError(true)}
                unoptimized
              />
            )}
            {pokemon.isCustom && (
              <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                Custom
              </div>
            )}
          </div>

          {/* Name and ID */}
          <div>
            <h3 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              {formatPokemonName(pokemon.name)}
            </h3>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 font-mono">
              {formatPokemonId(pokemon.id)}
            </p>
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
          >
            <Heart
              className={cn(
                'h-5 w-5',
                isFavorite(pokemon.id)
                  ? 'fill-red-500 text-red-500'
                  : 'text-zinc-400'
              )}
            />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {isFavorite(pokemon.id) ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
            </span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-50 dark:bg-zinc-700 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 mb-2">
              <Ruler className="h-4 w-4" />
              <span className="text-sm font-medium">Altura</span>
            </div>
            <p className="text-lg font-bold text-zinc-900 dark:text-white">
              {pokemon.height}
            </p>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-700 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 mb-2">
              <Weight className="h-4 w-4" />
              <span className="text-sm font-medium">Peso</span>
            </div>
            <p className="text-lg font-bold text-zinc-900 dark:text-white">
              {pokemon.weight}
            </p>
          </div>
        </div>

        {/* Types */}
        <div>
          <h4 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">
            Tipos
          </h4>
          <div className="flex flex-wrap gap-2">
            {pokemon.types.length > 0 ? (
              pokemon.types.map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm"
                  style={{ backgroundColor: getTypeColor(type) }}
                >
                  {formatPokemonName(type)}
                </span>
              ))
            ) : (
              <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-zinc-400">
                Desconhecido
              </span>
            )}
          </div>
        </div>

        {/* Evolution Chain */}
        {!pokemon.isCustom && (
          <div>
            <h4 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">
              Linha Evolutiva
            </h4>
            {isLoadingEvolution ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : evolutionChain.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                {evolutionChain.map((evolution, index) => (
                  <div key={evolution} className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                    if (evolution.toLowerCase() !== pokemon.name.toLowerCase() && onSelectPokemon) {
                      try {
                        const evolutionPokemon = await PokemonAPI.getPokemon(evolution);
                        onSelectPokemon(evolutionPokemon.id);
                      } catch (error) {
                        console.error('Failed to load evolution pokemon:', error);
                      }
                    }
                    }}
                    disabled={evolution.toLowerCase() === pokemon.name.toLowerCase()}
                    className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    evolution.toLowerCase() === pokemon.name.toLowerCase()
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 ring-2 ring-blue-500 cursor-default'
                      : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 hover:ring-2 hover:ring-blue-400 cursor-pointer'
                    )}
                  >
                    {formatPokemonName(evolution)}
                  </button>
                  {index < evolutionChain.length - 1 && (
                    <FontAwesomeIcon 
                    icon={faCaretRight} 
                    className="text-zinc-400 dark:text-zinc-500"
                    />
                  )}
                  </div>
                ))}
                </div>
              ) : (
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                Não possui evolução
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}