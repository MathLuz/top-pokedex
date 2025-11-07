import { Pokemon, PokemonSpecies, EvolutionChain, PokemonType, PokemonListResponse } from '@/types/pokemon';

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

export class PokemonAPI {
  // Get a single pokemon by ID or name
  static async getPokemon(idOrName: string | number): Promise<Pokemon> {
    const response = await fetch(`${POKEAPI_BASE}/pokemon/${idOrName}`);
    if (!response.ok) {
      throw new Error(`Pokemon not found: ${idOrName}`);
    }
    return response.json();
  }

  // Get pokemon list with pagination
  static async getPokemonList(offset = 0, limit = 20): Promise<PokemonListResponse> {
    const response = await fetch(`${POKEAPI_BASE}/pokemon?offset=${offset}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch pokemon list');
    }
    return response.json();
  }

  // Get pokemon species data
  static async getPokemonSpecies(idOrName: string | number): Promise<PokemonSpecies> {
    const response = await fetch(`${POKEAPI_BASE}/pokemon-species/${idOrName}`);
    if (!response.ok) {
      throw new Error(`Pokemon species not found: ${idOrName}`);
    }
    return response.json();
  }

  // Get evolution chain
  static async getEvolutionChain(url: string): Promise<EvolutionChain> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch evolution chain');
    }
    return response.json();
  }

  // Get all pokemon types
  static async fetchPokemonTypes(): Promise<{ results: Array<{ name: string; url: string }> }> {
    const response = await fetch(`${POKEAPI_BASE}/type`);
    if (!response.ok) {
      throw new Error('Failed to fetch pokemon types');
    }
    return response.json();
  }

  // Get pokemon by type
  static async getPokemonByType(typeName: string): Promise<PokemonType> {
    const response = await fetch(`${POKEAPI_BASE}/type/${typeName}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch pokemon of type: ${typeName}`);
    }
    return response.json();
  }

  // Search pokemon by name (fuzzy search simulation)
  static async searchPokemon(query: string, limit = 50): Promise<Pokemon[]> {
    try {
      // First try exact match
      try {
        const pokemon = await this.getPokemon(query.toLowerCase());
        return [pokemon];
      } catch {
        // If exact match fails, get a larger list and filter
        const pokemonList = await this.getPokemonList(0, 1000);
        const filtered = pokemonList.results.filter(p => 
          p.name.toLowerCase().includes(query.toLowerCase())
        );
        
        const promises = filtered.slice(0, limit).map(p => 
          this.getPokemon(p.name).catch(() => null)
        );
        
        const results = await Promise.all(promises);
        return results.filter(p => p !== null) as Pokemon[];
      }
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }

  // Get evolution chain names from a pokemon
  static async getPokemonEvolutionChain(pokemonName: string): Promise<string[]> {
    try {
      const species = await this.getPokemonSpecies(pokemonName);
      const evolutionData = await this.getEvolutionChain(species.evolution_chain.url);
      
      const evolutionNames: string[] = [];
      
      const extractEvolutions = (chain: any) => {
        evolutionNames.push(chain.species.name);
        
        if (chain.evolves_to && chain.evolves_to.length > 0) {
          chain.evolves_to.forEach((evolution: any) => {
            extractEvolutions(evolution);
          });
        }
      };
      
      extractEvolutions(evolutionData.chain);
      return evolutionNames;
    } catch (error) {
      console.error('Failed to get evolution chain:', error);
      return [pokemonName];
    }
  }

  // Extract pokemon ID from URL
  static extractIdFromUrl(url: string): number {
    const parts = url.split('/');
    return parseInt(parts[parts.length - 2]);
  }

  // Get best image for pokemon
  static getBestPokemonImage(pokemon: Pokemon): string {
    return (
      pokemon.sprites.other['official-artwork']?.front_default ||
      pokemon.sprites.other.home?.front_default ||
      pokemon.sprites.front_default ||
      '/placeholder-pokemon.png'
    );
  }

  // Get pokemon types as string array
  static extractPokemonTypes(pokemon: Pokemon): string[] {
    return pokemon.types.map(t => t.type.name);
  }
}