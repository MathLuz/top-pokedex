'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { PokemonAPI } from '@/lib/api/pokemon';
import { PokemonCardData, PokemonDetailData } from '@/types/pokemon';
import { convertPokemonToDetail, POKEMON_TYPES } from '@/lib/utils/pokemon';
import { useFavorites } from '@/hooks/useFavorites';
import { Header } from '@/components/layout/Header';
import { PokemonSearch } from '@/components/pokemon/PokemonSearch';
import { PokemonGrid } from '@/components/pokemon/PokemonGrid';
import { PokemonDetail } from '@/components/pokemon/PokemonDetail';
import { PokemonPagination } from '@/components/pokemon/PokemonPagination';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTheme } from '@/hooks/useTheme';

interface IndexEntry {
  id: number;
  name: string;
  types: string[];
}

// A lista de pokémons/tipos quase nunca muda: cache de 7 dias no localStorage
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;
const DEX_CACHE_KEY = 'pokedex-index-v2';
const LEGACY_CACHE_KEYS = ['cached-pokemons', 'cached-pokemons-timestamp', 'cached-total-pokemons'];
// Ids >= 10000 na PokéAPI são formas alternativas (mega, regionais etc.), não espécies
const MAX_SPECIES_ID = 10000;

const artworkUrl = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

function readCache<T>(key: string): { data: T; timestamp: number } | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // localStorage cheio ou indisponível: segue sem cache
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Tenta de novo com espera crescente (a PokéAPI limita rajadas de requisições)
async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i >= attempts - 1) throw error;
      await sleep(500 * 2 ** i);
    }
  }
}

// Executa as tarefas com no máximo `limit` requisições simultâneas
async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

/**
 * Monta o índice completo da Pokédex com 19 requisições leves
 * (1 lista de nomes + 18 tipos), em vez de 1 requisição pesada por pokémon.
 * Depois disso, busca, filtro e paginação rodam 100% local.
 */
async function fetchDexIndex(): Promise<IndexEntry[]> {
  const list = await withRetry(() => PokemonAPI.getPokemonList(0, 100000));
  const typeData = await mapWithConcurrency(POKEMON_TYPES, 3, type =>
    withRetry(() => PokemonAPI.getPokemonByType(type))
  );

  const typesById = new Map<number, { name: string; slot: number }[]>();
  typeData.forEach(type => {
    type.pokemon.forEach(({ pokemon, slot }) => {
      const id = PokemonAPI.extractIdFromUrl(pokemon.url);
      if (id >= MAX_SPECIES_ID) return;
      const entry = typesById.get(id) ?? [];
      entry.push({ name: type.name, slot });
      typesById.set(id, entry);
    });
  });

  return list.results
    .map(p => ({ id: PokemonAPI.extractIdFromUrl(p.url), name: p.name }))
    .filter(p => p.id < MAX_SPECIES_ID)
    .sort((a, b) => a.id - b.id)
    .map(p => ({
      ...p,
      types: (typesById.get(p.id) ?? [])
        .sort((a, b) => a.slot - b.slot)
        .map(t => t.name),
    }));
}

// Uma única carga por sessão (evita requisições duplicadas, ex.: StrictMode em dev)
let dexIndexPromise: Promise<IndexEntry[]> | null = null;
function loadDexIndexOnce() {
  dexIndexPromise ??= fetchDexIndex().catch(error => {
    dexIndexPromise = null;
    throw error;
  });
  return dexIndexPromise;
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetailData | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  // Detalhes já abertos ficam em memória para não refazer a requisição
  const detailCache = useRef(new Map<number, PokemonDetailData>());

  // Índice com TODOS os pokémons (id, nome, tipos). Filtro e paginação rodam sobre ele.
  const [pokemonIndex, setPokemonIndex] = useState<IndexEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const scrollRef = useRef<HTMLDivElement>(null);

  useFavorites();

  // Carrega o índice: do cache se válido, senão da API (e salva no cache)
  useEffect(() => {
    // Remove o cache antigo (lista de cards pesada) que não é mais usado
    LEGACY_CACHE_KEYS.forEach(key => {
      try { localStorage.removeItem(key); } catch { /* ignore */ }
    });

    const cached = readCache<IndexEntry[]>(DEX_CACHE_KEY);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setPokemonIndex(cached.data);
      setIsLoading(false);
      return;
    }

    loadDexIndexOnce()
      .then(entries => {
        setPokemonIndex(entries);
        writeCache(DEX_CACHE_KEY, entries);
      })
      .catch(error => {
        console.error('Failed to load pokedex index:', error);
        // Sem internet/API fora: usa o cache mesmo expirado
        if (cached) {
          setPokemonIndex(cached.data);
        } else {
          setLoadError('Não foi possível carregar a lista de pokémons.');
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Debounce curto da busca (o filtro é local, então pode ser rápido)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim().toLowerCase()), 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Aplica busca + filtros de tipo sobre o índice completo
  const filteredEntries = useMemo(() => {
    let result = pokemonIndex;

    if (debouncedQuery) {
      result = result.filter(p =>
        p.name.includes(debouncedQuery) || p.id.toString().includes(debouncedQuery)
      );
    }

    if (selectedTypes.length > 0) {
      result = result.filter(p => selectedTypes.every(type => p.types.includes(type)));
    }

    return result;
  }, [pokemonIndex, debouncedQuery, selectedTypes]);

  // Volta para a página 1 quando busca, filtros ou itens por página mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, selectedTypes, itemsPerPage]);

  // Pagination calculations (página sempre dentro do intervalo válido)
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const currentPokemons: PokemonCardData[] = useMemo(
    () =>
      filteredEntries.slice(startIndex, startIndex + itemsPerPage).map(p => ({
        id: p.id,
        name: p.name,
        types: p.types,
        image: artworkUrl(p.id),
      })),
    [filteredEntries, startIndex, itemsPerPage]
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isFiltering = Boolean(debouncedQuery) || selectedTypes.length > 0;
  const showSkeleton = isLoading;

  // Abre os detalhes (com cache em memória)
  const handlePokemonSelectById = async (pokemonId: number) => {
    if (selectedPokemon?.id === pokemonId) return;

    const cachedDetail = detailCache.current.get(pokemonId);
    if (cachedDetail) {
      setSelectedPokemon(cachedDetail);
      return;
    }

    try {
      setIsLoadingDetail(true);
      const pokemonData = await PokemonAPI.getPokemon(pokemonId);
      const detailData = convertPokemonToDetail(pokemonData);
      detailCache.current.set(pokemonId, detailData);
      setSelectedPokemon(detailData);
    } catch (error) {
      console.error('Failed to load pokemon details:', error);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handlePokemonSelect = (pokemon: PokemonCardData) => handlePokemonSelectById(pokemon.id);

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
                {!isLoading && !loadError && (
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    {isFiltering
                      ? `${filteredEntries.length} pokémons encontrados`
                      : `${pokemonIndex.length} pokémons`
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

                {loadError && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {loadError}
                  </div>
                )}
              </div>

              {/* Scrollable Content */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden pr-2 space-y-6">
                {/* Pokemon Grid or Skeleton */}
                {showSkeleton ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-1">
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

                  </>
                )}

                {/* Pagination (fica visível também durante o carregamento da página) */}
                {!isLoading && filteredEntries.length > 0 && (
                  <PokemonPagination
                    currentPage={safePage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredEntries.length}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={setItemsPerPage}
                  />
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