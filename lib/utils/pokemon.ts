import { Pokemon, CustomPokemon, PokemonCardData, PokemonDetailData } from '@/types/pokemon';
import { PokemonAPI } from '@/lib/api/pokemon';

export const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

export const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC'
};

export function formatPokemonName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' ');
}

export function formatPokemonId(id: number): string {
  return `#${id.toString().padStart(3, '0')}`;
}

export function formatHeight(height: number | string): string {
  if (typeof height === 'string') {
    return height || 'Desconhecido';
  }
  const meters = height / 10;
  return `${meters}m`;
}

export function formatWeight(weight: number | string): string {
  if (typeof weight === 'string') {
    return weight || 'Desconhecido';
  }
  const kg = weight / 10;
  return `${kg}kg`;
}

export function getTypeColor(type: string): string {
  return TYPE_COLORS[type.toLowerCase()] || '#68A090';
}

export function convertPokemonToCard(pokemon: Pokemon): PokemonCardData {
  return {
    id: pokemon.id,
    name: pokemon.name,
    image: PokemonAPI.getBestPokemonImage(pokemon),
    types: pokemon.types.map(t => t.type.name)
  };
}

export function convertCustomPokemonToCard(pokemon: CustomPokemon): PokemonCardData {
  return {
    id: pokemon.id,
    name: pokemon.name,
    image: pokemon.imageUrl || '/placeholder-pokemon.png',
    types: pokemon.types,
    isCustom: true
  };
}

export function convertPokemonToDetail(pokemon: Pokemon): PokemonDetailData {
  return {
    id: pokemon.id,
    name: pokemon.name,
    image: PokemonAPI.getBestPokemonImage(pokemon),
    types: pokemon.types.map(t => t.type.name),
    height: formatHeight(pokemon.height),
    weight: formatWeight(pokemon.weight)
  };
}

export function convertCustomPokemonToDetail(pokemon: CustomPokemon): PokemonDetailData {
  return {
    id: pokemon.id,
    name: pokemon.name,
    image: pokemon.imageUrl || '/placeholder-pokemon.png',
    types: pokemon.types,
    height: formatHeight(pokemon.height),
    weight: formatWeight(pokemon.weight),
    isCustom: true
  };
}

export function getDefaultPokemonImage(): string {
  return 'https://images.pexels.com/photos/2693651/pexels-photo-2693651.jpeg?auto=compress&cs=tinysrgb&w=400';
}