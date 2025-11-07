'use client';

import { useState, useEffect, useMemo } from 'react';
import { CustomPokemonAPI } from '@/lib/api/custom-pokemon';
import { PokemonCardData, PokemonDetailData, CustomPokemon } from '@/types/pokemon';
import { convertCustomPokemonToCard, convertCustomPokemonToDetail } from '@/lib/utils/pokemon';
import { useFavorites } from '@/hooks/useFavorites';
import { Header } from '@/components/layout/Header';
import { PokemonSearch } from '@/components/pokemon/PokemonSearch';
import { CustomPokemonCard } from '@/components/pokemon/CustomPokemonCard';
import { PokemonDetail } from '@/components/pokemon/PokemonDetail';
import { PokemonPagination } from '@/components/pokemon/PokemonPagination';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTheme } from '@/hooks/useTheme';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function CustomPokemons() {
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [customPokemons, setCustomPokemons] = useState<PokemonCardData[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pokemonToDelete, setPokemonToDelete] = useState<PokemonCardData | null>(null);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(16);

  const { favorites } = useFavorites();

  // Load custom pokemons
  useEffect(() => {
    const loadCustomPokemons = async () => {
      try {
        setIsLoading(true);

        // Load from API
        const apiPokemons = await CustomPokemonAPI.getCustomPokemons();

        // Also load from localStorage for offline access
        const localPokemons = JSON.parse(localStorage.getItem('custom-pokemons') || '[]');

        // Merge and deduplicate
        const allCustomPokemons = [...apiPokemons];
        localPokemons.forEach((local: CustomPokemon) => {
          if (!allCustomPokemons.find(api => api.id === local.id)) {
            allCustomPokemons.push(local);
          }
        });

        const pokemonCards = allCustomPokemons.map(convertCustomPokemonToCard);
        setCustomPokemons(pokemonCards);
      } catch (error) {
        console.error('Failed to load custom pokemons:', error);

        // Fallback to localStorage only
        const localPokemons = JSON.parse(localStorage.getItem('custom-pokemons') || '[]');
        const pokemonCards = localPokemons.map(convertCustomPokemonToCard);
        setCustomPokemons(pokemonCards);
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomPokemons();
  }, []);

  // Filter pokemons based on search and type filters
  const filteredPokemons = useMemo(() => {
    let filtered = customPokemons;

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
  }, [customPokemons, searchQuery, selectedTypes]);

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

      // Try to get from API first
      let customPokemon = await CustomPokemonAPI.getCustomPokemon(pokemon.id);

      // If not found in API, try localStorage
      if (!customPokemon) {
        const localPokemons = JSON.parse(localStorage.getItem('custom-pokemons') || '[]');
        customPokemon = localPokemons.find((p: CustomPokemon) => p.id === pokemon.id);
      }

      if (customPokemon) {
        const detailData = convertCustomPokemonToDetail(customPokemon);
        setSelectedPokemon(detailData);
      }
    } catch (error) {
      console.error('Failed to load custom pokemon details:', error);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Handle delete request
  const handleDeleteRequest = (pokemon: PokemonCardData) => {
    setPokemonToDelete(pokemon);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!pokemonToDelete) return;

    try {
      await CustomPokemonAPI.deleteCustomPokemon(pokemonToDelete.id);

      // Update state
      setCustomPokemons(prev => prev.filter(p => p.id !== pokemonToDelete.id));

      // Close detail if this pokemon was selected
      if (selectedPokemon?.id === pokemonToDelete.id) {
        setSelectedPokemon(null);
      }

      toast({
        title: 'Pokémon excluído',
        description: `${pokemonToDelete.name} foi removido com sucesso.`,
      });
    } catch (error) {
      console.error('Failed to delete pokemon:', error);
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o pokémon. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setPokemonToDelete(null);
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
              Carregando pokémons criados...
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🎨 Meus Pokémons Criados
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {customPokemons.length === 0
              ? 'Nenhum pokémon personalizado criado ainda'
              : `${customPokemons.length} pokémon${customPokemons.length > 1 ? 's' : ''} personalizado${customPokemons.length > 1 ? 's' : ''} criado${customPokemons.length > 1 ? 's' : ''}`
            }
          </p>
        </div>

        {customPokemons.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Nenhum pokémon criado ainda
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Que tal criar seu primeiro pokémon personalizado? Use sua imaginação e crie algo único!
            </p>
            <Link
              href="/create"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              ✨ Criar Meu Primeiro Pokémon
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
                  {filteredPokemons.length === customPokemons.length
                    ? `Mostrando todos os ${customPokemons.length} pokémons criados`
                    : `${filteredPokemons.length} pokémons encontrados de ${customPokemons.length} criados`
                  }
                </div>
              )}

              {/* Pokemon Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentPokemons.map((pokemon) => (
                  <CustomPokemonCard
                    key={pokemon.id}
                    pokemon={pokemon}
                    onClick={() => handlePokemonSelect(pokemon)}
                    onDelete={() => handleDeleteRequest(pokemon)}
                  />
                ))}
              </div>

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

              {/* Create New Button */}
              <div className="flex justify-center pt-4">
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <span className="text-lg">✨</span>
                  Criar Novo Pokémon
                </Link>
              </div>
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
        )}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Pokémon?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{pokemonToDelete?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}