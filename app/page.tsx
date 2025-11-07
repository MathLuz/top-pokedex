'use client';

import { useState, useEffect, useMemo } from 'react';
import { PokemonAPI } from '@/lib/api/pokemon';
import { PokemonCardData, PokemonDetailData, Pokemon } from '@/types/pokemon';
import { convertPokemonToCard, convertPokemonToDetail } from '@/lib/utils/pokemon';
import { useFavorites } from '@/hooks/useFavorites';
import { Header } from '@/components/layout/Header';
import { PokemonSearch } from '@/components/pokemon/PokemonSearch';
import { PokemonGrid } from '@/components/pokemon/PokemonGrid';
import { PokemonDetail } from '@/components/pokemon/PokemonDetail';
import { PokemonPagination } from '@/components/pokemon/PokemonPagination';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export default function Home() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const [allPokemons, setAllPokemons] = useState<PokemonCardData[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const { favorites } = useFavorites();

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Load initial pokemon data
  useEffect(() => {
    const loadPokemons = async () => {
      try {
        setIsLoading(true);
        
        // Verificar se já tem dados no localStorage
        const cachedPokemons = localStorage.getItem('cached-pokemons');
        const cacheTimestamp = localStorage.getItem('cached-pokemons-timestamp');
        const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
        
        // Se tem cache válido (menos de 24h), usar ele
        if (cachedPokemons && cacheTimestamp) {
          const timestamp = parseInt(cacheTimestamp);
          const now = Date.now();
          
          if (now - timestamp < CACHE_DURATION) {
            const pokemonCards = JSON.parse(cachedPokemons);
            setAllPokemons(pokemonCards);
            setIsLoading(false);
            return;
          }
        }
        
        // Se não tem cache ou está expirado, buscar da API
        const pokemonList = await PokemonAPI.getPokemonList(0, 1025); // Todos os pokémons
        
        const pokemonPromises = pokemonList.results.map(async (pokemon) => {
          try {
            const pokemonData = await PokemonAPI.getPokemon(pokemon.name);
            return convertPokemonToCard(pokemonData);
          } catch (error) {
            console.error(`Failed to load pokemon ${pokemon.name}:`, error);
            return null;
          }
        });
        
        const pokemonCards = await Promise.all(pokemonPromises);
        const validPokemons = pokemonCards.filter(p => p !== null) as PokemonCardData[];
        
        // Salvar no localStorage
        localStorage.setItem('cached-pokemons', JSON.stringify(validPokemons));
        localStorage.setItem('cached-pokemons-timestamp', Date.now().toString());
        
        setAllPokemons(validPokemons);
      } catch (error) {
        console.error('Failed to load pokemons:', error);
        
        // Em caso de erro, tentar usar o cache mesmo que expirado
        const cachedPokemons = localStorage.getItem('cached-pokemons');
        if (cachedPokemons) {
          const pokemonCards = JSON.parse(cachedPokemons);
          setAllPokemons(pokemonCards);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPokemons();
  }, []);

  // Filter pokemons based on search and type filters
  const filteredPokemons = useMemo(() => {
    let filtered = allPokemons;

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
  }, [allPokemons, searchQuery, selectedTypes]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredPokemons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPokemons = filteredPokemons.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTypes, itemsPerPage]);

  // Handle pokemon selection for details
  const handlePokemonSelect = async (pokemon: PokemonCardData) => {
    if (selectedPokemon?.id === pokemon.id) return;
    
    try {
      setIsLoadingDetail(true);
      const pokemonData = await PokemonAPI.getPokemon(pokemon.id);
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
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center flex flex-col items-center">
            <LoadingSpinner size="lg"/>
            <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-400">
              Carregando pokémons...
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
                {filteredPokemons.length === allPokemons.length 
                  ? `Mostrando todos os ${allPokemons.length} pokémons`
                  : `${filteredPokemons.length} pokémons encontrados de ${allPokemons.length} total`
                }
              </div>
            )}

            {/* Pokemon Grid */}
            <PokemonGrid
              pokemons={currentPokemons}
              onPokemonClick={handlePokemonSelect}
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
              <PokemonDetail pokemon={selectedPokemon} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Pokemon Detail Modal */}
      {selectedPokemon && (
        <div className="lg:hidden">
          <PokemonDetail
            pokemon={selectedPokemon}
            onClose={() => setSelectedPokemon(null)}
            isMobile
          />
        </div>
      )}
    </div>
  );
}