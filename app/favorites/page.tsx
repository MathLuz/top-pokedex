'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faHeartBroken } from '@fortawesome/free-solid-svg-icons';
import { PokemonAPI } from '@/lib/api/pokemon';
import { CustomPokemonAPI } from '@/lib/api/custom-pokemon';
import { PokemonCardData, PokemonDetailData } from '@/types/pokemon';
import { convertPokemonToCard, convertPokemonToDetail, convertCustomPokemonToCard, convertCustomPokemonToDetail } from '@/lib/utils/pokemon';
import { useFavorites } from '@/hooks/useFavorites';
import { Header } from '@/components/layout/Header';
import { PokemonSearch } from '@/components/pokemon/PokemonSearch';
import { PokemonGrid } from '@/components/pokemon/PokemonGrid';
import { PokemonDetail } from '@/components/pokemon/PokemonDetail';
import { PokemonPagination } from '@/components/pokemon/PokemonPagination';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTheme } from '@/hooks/useTheme';

export default function Favorites() {
  const { theme, toggleTheme } = useTheme();
  const [favoritePokemons, setFavoritePokemons] = useState<PokemonCardData[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(16);

  const { favorites } = useFavorites();

  // Load favorite pokemons
  useEffect(() => {
    const loadFavoritePokemons = async () => {
      if (favorites.length === 0) {
        setFavoritePokemons([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const customPokemons = await CustomPokemonAPI.getCustomPokemons();

        const pokemonPromises = favorites.map(async (id) => {
          try {
            // First try to find in custom pokemons
            const customPokemon = customPokemons.find(p => p.id === id);
            if (customPokemon) {
              return convertCustomPokemonToCard(customPokemon);
            }

            // Then try API pokemon
            const pokemonData = await PokemonAPI.getPokemon(id);
            return convertPokemonToCard(pokemonData);
          } catch (error) {
            console.error(`Failed to load favorite pokemon ${id}:`, error);
            return null;
          }
        });

        const pokemonCards = await Promise.all(pokemonPromises);
        const validPokemons = pokemonCards.filter(p => p !== null) as PokemonCardData[];

        setFavoritePokemons(validPokemons);
      } catch (error) {
        console.error('Failed to load favorite pokemons:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavoritePokemons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favorites.length, favorites.join(',')]);

  // Filter pokemons based on search and type filters
  const filteredPokemons = useMemo(() => {
    let filtered = favoritePokemons;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(pokemon =>
        pokemon.name.toLowerCase().includes(query) ||
        pokemon.id.toString().includes(query)
      );
    }

    // Apply type filters
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(pokemon =>
        selectedTypes.every(type => pokemon.types.includes(type))
      );
    }

    return filtered;
    // 
  }, [searchQuery, selectedTypes, favoritePokemons]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredPokemons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPokemons = filteredPokemons.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTypes]);

  // Handle pokemon selection for details
  const handlePokemonSelect = async (pokemon: PokemonCardData) => {
    if (selectedPokemon?.id === pokemon.id) return;

    try {
      setIsLoadingDetail(true);

      if (pokemon.isCustom) {
        const customPokemon = await CustomPokemonAPI.getCustomPokemon(pokemon.id);
        if (customPokemon) {
          const detailData = convertCustomPokemonToDetail(customPokemon);
          setSelectedPokemon(detailData);
        }
      } else {
        const pokemonData = await PokemonAPI.getPokemon(pokemon.id);
        const detailData = convertPokemonToDetail(pokemonData);
        setSelectedPokemon(detailData);
      }
    } catch (error) {
      console.error('Failed to load pokemon details:', error);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Handle pokemon selection by ID (for evolution chain clicks)
  const handlePokemonSelectById = async (pokemonId: number) => {
    if (selectedPokemon?.id === pokemonId) return;
    
    try {
      setIsLoadingDetail(true);
      const pokemonData = await PokemonAPI.getPokemon(pokemonId);
      const detailData = convertPokemonToDetail(pokemonData);
      setSelectedPokemon(detailData);
    } catch (error) {
      console.error('Failed to load pokemon details:', error);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header theme={theme} toggleTheme={toggleTheme} />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-400">
              Carregando pokémons favoritos...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header theme={theme} toggleTheme={toggleTheme} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <FontAwesomeIcon icon={faHeart} className="text-red-500" />
            Pokémons Favoritos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {favorites.length === 0
              ? 'Nenhum pokémon marcado como favorito ainda'
              : `${favorites.length} pokémon${favorites.length > 1 ? 's' : ''} favoritado${favorites.length > 1 ? 's' : ''}`
            }
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <FontAwesomeIcon icon={faHeartBroken} className="text-6xl mb-4 text-gray-400" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Nenhum favorito ainda
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Explore a pokédex e marque seus pokémons favoritos clicando no ícone de coração nos cards!
            </p>
            {/* Use Link para navegação client-side */}
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Explorar Pokémons
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[calc(100vh-12rem)]">
            {/* Left Column - Pokemon List */}
            <div className="lg:col-span-2 space-y-6">
              {/* Search and Filters */}
              <PokemonSearch
                searchQuery={searchQuery}
                selectedTypes={selectedTypes}
                onSearchChange={setSearchQuery}
                onTypesChange={setSelectedTypes}
              />

              {/* Results Summary */}
              {filteredPokemons.length > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredPokemons.length === favoritePokemons.length
                    ? `Mostrando todos os ${favoritePokemons.length} pokémons favoritos`
                    : `${filteredPokemons.length} pokémons encontrados de ${favoritePokemons.length} favoritos`
                  }
                </div>
              )}

              {/* Pokemon Grid */}
              <PokemonGrid
                pokemons={currentPokemons}
                onPokemonClick={handlePokemonSelect}
                selectedPokemonId={selectedPokemon?.id}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <PokemonPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredPokemons.length}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              )}
            </div>

            {/* Right Column - Pokemon Details */}
            <div className="hidden lg:block">
              {isLoadingDetail ? (
                <div className="bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex items-center justify-center h-full">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <PokemonDetail 
                  pokemon={selectedPokemon} 
                  onSelectPokemon={handlePokemonSelectById}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Pokemon Detail Modal */}
      {selectedPokemon && (
        <div className="lg:hidden">
          <PokemonDetail
            pokemon={selectedPokemon}
            onClose={() => setSelectedPokemon(null)}
            isMobile
            onSelectPokemon={handlePokemonSelectById}
          />
        </div>
      )}
    </div>
  );
}