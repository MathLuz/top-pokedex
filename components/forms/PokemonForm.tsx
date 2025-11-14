'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { POKEMON_TYPES, formatPokemonName } from '@/lib/utils/pokemon';
import { CustomPokemonAPI } from '@/lib/api/custom-pokemon';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PokemonFormData {
  name: string;
  imageUrl: string;
  height: string;
  weight: string;
  types: string[];
}

export function PokemonForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PokemonFormData>({
    name: '',
    imageUrl: '',
    height: '',
    weight: '',
    types: []
  });

  const handleInputChange = (field: keyof PokemonFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleTypeToggle = (type: string) => {
    setFormData(prev => {
      const currentTypes = prev.types;
      if (currentTypes.includes(type)) {
        return { ...prev, types: currentTypes.filter(t => t !== type) };
      } else if (currentTypes.length < 2) {
        return { ...prev, types: [...currentTypes, type] };
      }
      return prev;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('O nome é obrigatório');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newPokemon = await CustomPokemonAPI.createCustomPokemon({
        name: formData.name.trim(),
        imageUrl: formData.imageUrl.trim(),
        height: formData.height.trim(),
        weight: formData.weight.trim(),
        types: formData.types
      });

      // Reset form
      setFormData({
        name: '',
        imageUrl: '',
        height: '',
        weight: '',
        types: []
      });

      // Redirect to custom pokemons page
      router.push('/custom');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao criar pokémon');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Nome do Pokémon *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Ex: Pikachu"
            className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            required
          />
        </div>

        {/* Image URL Field */}
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            URL da Imagem
          </label>
          <input
            type="url"
            id="imageUrl"
            value={formData.imageUrl}
            onChange={(e) => handleInputChange('imageUrl', e.target.value)}
            placeholder="https://example.com/pokemon.png"
            className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
          {formData.imageUrl && (
            <div className="mt-3 text-center">
              <Image
                src={formData.imageUrl}
                alt="Preview"
                width={128}
                height={128}
                className="mx-auto h-32 w-32 object-contain rounded-lg border border-zinc-200 dark:border-zinc-600"
                onLoadingComplete={(result) => {
                  if (result.naturalWidth === 0) {
                    // Handle broken image case
                    (document.querySelector(`[src="${formData.imageUrl}"]`) as HTMLElement).style.display = 'none';
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Height and Weight */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="height" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Altura
            </label>
            <input
              type="text"
              id="height"
              value={formData.height}
              onChange={(e) => handleInputChange('height', e.target.value)}
              placeholder="Ex: 0.4m"
              className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Peso
            </label>
            <input
              type="text"
              id="weight"
              value={formData.weight}
              onChange={(e) => handleInputChange('weight', e.target.value)}
              placeholder="Ex: 6.0kg"
              className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        {/* Types */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
            Tipos (máximo 2)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {POKEMON_TYPES.map((type) => {
              const isSelected = formData.types.includes(type);
              const isDisabled = !isSelected && formData.types.length >= 2;

              return (
                <button
                  key={type}
                  type="button"
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

          {formData.types.length > 0 && (
            <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              Tipos selecionados: {formData.types.map(formatPokemonName).join(', ')}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !formData.name.trim()}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-lg transition-colors',
            isSubmitting || !formData.name.trim()
              ? 'bg-zinc-300 dark:bg-zinc-600 text-zinc-500 dark:text-zinc-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
          )}
        >
          {isSubmitting && <LoadingSpinner size="sm" className="border-white border-t-blue-600" />}
          {isSubmitting ? 'Criando Pokémon...' : 'Criar Pokémon'}
        </button>
      </form>
    </div>
  );
}