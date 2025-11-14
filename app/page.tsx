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
import { useTheme } from '@/hooks/useTheme';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [allPokemons, setAllPokemons] = useState<PokemonCardData[]>([]);
  const [searchResults, setSearchResults] = useState<PokemonCardData[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalAvailable, setTotalAvailable] = useState(0);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const { favorites } = useFavorites();

  // Load initial pokemon data
  useEffect(() => {
    const loadPokemons = async () => {
      try {
        setIsLoading(true);
        
        // Verificar se já tem dados no localStorage
        const cachedPokemons = localStorage.getItem('cached-pokemons');
        const cacheTimestamp = localStorage.getItem('cached-pokemons-timestamp');
        const cachedTotal = localStorage.getItem('cached-total-pokemons');
        const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
        
        // Se tem cache válido (menos de 24h), usar ele
        if (cachedPokemons && cacheTimestamp && cachedTotal) {
          const timestamp = parseInt(cacheTimestamp);
          const now = Date.now();
          
          if (now - timestamp < CACHE_DURATION) {
            const pokemonCards = JSON.parse(cachedPokemons);
            setAllPokemons(pokemonCards);
            setTotalAvailable(parseInt(cachedTotal));
            setIsLoading(false);
            return;
          }
        }
        
        // Buscar informações gerais para saber o total
        const initialList = await PokemonAPI.getPokemonList(0, 1);
        setTotalAvailable(initialList.count);
        localStorage.setItem('cached-total-pokemons', initialList.count.toString());
        
        // Carregar apenas os primeiros 151 pokémons (Geração 1) inicialmente
        const INITIAL_LOAD = 151;
        const pokemonList = await PokemonAPI.getPokemonList(0, INITIAL_LOAD);
        
        // Carregar em lotes de 20 para não sobrecarregar
        const BATCH_SIZE = 20;
        const validPokemons: PokemonCardData[] = [];
        
        for (let i = 0; i < pokemonList.results.length; i += BATCH_SIZE) {
          const batch = pokemonList.results.slice(i, i + BATCH_SIZE);
          
          const pokemonPromises = batch.map(async (pokemon) => {
            try {
              const pokemonData = await PokemonAPI.getPokemon(pokemon.name);
              return convertPokemonToCard(pokemonData);
            } catch (error) {
              console.error(`Failed to load pokemon ${pokemon.name}:`, error);
              return null;
            }
          });
          
          const batchResults = await Promise.all(pokemonPromises);
          const validBatch = batchResults.filter(p => p !== null) as PokemonCardData[];
          validPokemons.push(...validBatch);
          
          // Atualizar UI incrementalmente
          setAllPokemons([...validPokemons]);
        }
        
        // Salvar no localStorage
        localStorage.setItem('cached-pokemons', JSON.stringify(validPokemons));
        localStorage.setItem('cached-pokemons-timestamp', Date.now().toString());
        
      } catch (error) {
        console.error('Failed to load pokemons:', error);
        
        // Em caso de erro, tentar usar o cache mesmo que expirado
        const cachedPokemons = localStorage.getItem('cached-pokemons');
        const cachedTotal = localStorage.getItem('cached-total-pokemons');
        if (cachedPokemons) {
          const pokemonCards = JSON.parse(cachedPokemons);
          setAllPokemons(pokemonCards);
        }
        if (cachedTotal) {
          setTotalAvailable(parseInt(cachedTotal));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPokemons();
  }, []);

  // Search for pokemon by name or ID in the API when not found locally
  useEffect(() => {
    const searchPokemon = async () => {
      const query = searchQuery.trim();
      
      // Se não tem busca, limpar resultados
      if (!query) {
        setSearchResults([]);
        return;
      }

      // Resetar para primeira página quando pesquisar
      setCurrentPage(1);

      // Primeiro buscar nos pokémons já carregados
      const localResults = allPokemons.filter(pokemon => 
        pokemon.name.toLowerCase().includes(query.toLowerCase()) ||
        pokemon.id.toString().includes(query)
      );

      // Se encontrou resultados locais e não tem filtro de tipo, usar eles
      if (localResults.length > 0 && selectedTypes.length === 0) {
        setSearchResults(localResults);
        return;
      }

      // Se a busca parece ser um nome ou ID específico, tentar buscar na API
      if (query.length >= 3 || !isNaN(Number(query))) {
        try {
          setIsSearching(true);
          const pokemonData = await PokemonAPI.getPokemon(query.toLowerCase());
          const pokemonCard = convertPokemonToCard(pokemonData);
          
          // Verificar se atende aos filtros de tipo
          if (selectedTypes.length === 0 || selectedTypes.every(type => pokemonCard.types.includes(type))) {
            // Combinar resultado da API com resultados locais (sem duplicatas)
            const combinedResults = localResults.filter(p => p.id !== pokemonCard.id);
            combinedResults.unshift(pokemonCard);
            setSearchResults(combinedResults);
          } else {
            setSearchResults(localResults);
          }
        } catch (error) {
          // Se não encontrou na API, usar apenas resultados locais
          setSearchResults(localResults);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults(localResults);
      }
    };

    const debounceTimer = setTimeout(searchPokemon, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedTypes, allPokemons]);

  // Filter pokemons based on type filters (when no search)
  const filteredPokemons = useMemo(() => {
    // Se tem busca, usar searchResults
    if (searchQuery.trim()) {
      return searchResults;
    }

    let filtered = allPokemons;

    // Apply type filters
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(pokemon =>
        selectedTypes.every(type => pokemon.types.includes(type))
      );
    }

    return filtered;
  }, [allPokemons, selectedTypes, searchQuery, searchResults]);

  // Load more pokemons function
  const loadMorePokemons = async () => {
    if (isLoadingMore || allPokemons.length >= totalAvailable) return;
    
    try {
      setIsLoadingMore(true);
      
      const currentCount = allPokemons.length;
      const LOAD_MORE = 50; // Carregar mais 50 por vez
      
      const pokemonList = await PokemonAPI.getPokemonList(currentCount, LOAD_MORE);
      
      const pokemonPromises = pokemonList.results.map(async (pokemon) => {
        try {
          const pokemonData = await PokemonAPI.getPokemon(pokemon.name);
          return convertPokemonToCard(pokemonData);
        } catch (error) {
          console.error(`Failed to load pokemon ${pokemon.name}:`, error);
          return null;
        }
      });
      
      const newPokemons = await Promise.all(pokemonPromises);
      const validNewPokemons = newPokemons.filter(p => p !== null) as PokemonCardData[];
      
      const updatedPokemons = [...allPokemons, ...validNewPokemons];
      setAllPokemons(updatedPokemons);
      
      // Atualizar cache
      localStorage.setItem('cached-pokemons', JSON.stringify(updatedPokemons));
      localStorage.setItem('cached-pokemons-timestamp', Date.now().toString());
      
    } catch (error) {
      console.error('Failed to load more pokemons:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Check if we need to load more when reaching end of current list
  useEffect(() => {
    if (!searchQuery && selectedTypes.length === 0 && !isLoadingMore) {
      const isNearEnd = currentPage >= Math.ceil(allPokemons.length / itemsPerPage) - 1;
      const hasMore = allPokemons.length < totalAvailable;
      
      if (isNearEnd && hasMore) {
        loadMorePokemons();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, allPokemons.length, totalAvailable, searchQuery, selectedTypes, itemsPerPage, isLoadingMore]);

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

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-900">
      <Header theme={theme} toggleTheme={toggleTheme} />
      
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            {/* Left Column - Pokemon List (Scrollable) */}
            <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
              {/* Search and Filters - Fixed */}
              <div className="flex-shrink-0 space-y-4 mb-6">
                <PokemonSearch
                  searchQuery={searchQuery}
                  selectedTypes={selectedTypes}
                  onSearchChange={setSearchQuery}
                  onTypesChange={setSelectedTypes}
                />

                {/* Results Summary */}
                {!isLoading && !isSearching && filteredPokemons.length > 0 && (
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    {searchQuery.trim() 
                      ? `${filteredPokemons.length} pokémons encontrados`
                      : `${allPokemons.length} de ${totalAvailable} pokémons carregados`
                    }
                  </div>
                )}

                {/* Loading State */}
                {isLoading && (
                  <div className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Carregando pokémons...
                  </div>
                )}

                {/* Searching State */}
                {isSearching && (
                  <div className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Buscando pokémon...
                  </div>
                )}
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 space-y-6">
                {/* Pokemon Grid or Skeleton */}
                {isLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 12 }).map((_, index) => (
                      <div
                        key={index}
                        className="bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden border border-zinc-200 dark:border-zinc-700 animate-pulse"
                      >
                        <div className="aspect-square bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600" />
                        <div className="p-4 space-y-3">
                          <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3" />
                          <div className="h-6 bg-zinc-300 dark:bg-zinc-600 rounded w-2/3" />
                          <div className="flex gap-2">
                            <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded flex-1" />
                            <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded flex-1" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
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

                    {/* Loading More Indicator */}
                    {isLoadingMore && (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                          <LoadingSpinner size="sm" />
                          Carregando mais pokémons...
                        </div>
                      </div>
                    )}

                    {/* Load More Button (optional - if not auto-loading) */}
                    {!isLoadingMore && allPokemons.length < totalAvailable && !searchQuery && selectedTypes.length === 0 && (
                      <div className="flex items-center justify-center py-4">
                        <button
                          onClick={loadMorePokemons}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                          Carregar mais pokémons ({allPokemons.length} de {totalAvailable})
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right Column - Pokemon Details (Fixed) */}
            <div className="hidden lg:block sticky top-0 h-full overflow-y-auto">
              {isLoadingDetail ? (
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center h-full">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="sticky top-0">
                  <PokemonDetail 
                    pokemon={selectedPokemon} 
                    onSelectPokemon={handlePokemonSelectById}
                  />
                </div>
              )}
            </div>
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
            onSelectPokemon={handlePokemonSelectById}
          />
        </div>
      )}
    </div>
  );
}