import { CustomPokemon } from '@/types/pokemon';

const STORAGE_KEY = 'custom-pokemons';

function getLocalPokemons(): CustomPokemon[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveLocalPokemons(pokemons: CustomPokemon[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pokemons));
}

export class CustomPokemonAPI {
  static async getCustomPokemons(): Promise<CustomPokemon[]> {
    return getLocalPokemons();
  }

  static async getCustomPokemon(id: number): Promise<CustomPokemon | null> {
    const pokemons = getLocalPokemons();
    return pokemons.find(p => p.id === id) || null;
  }

  static async createCustomPokemon(pokemon: Omit<CustomPokemon, 'id' | 'isCustom' | 'createdAt'>): Promise<CustomPokemon> {
    const pokemons = getLocalPokemons();
    const newId = pokemons.length > 0 ? Math.max(...pokemons.map(p => p.id)) + 1 : 9001;
    const newPokemon: CustomPokemon = {
      ...pokemon,
      id: newId,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    pokemons.push(newPokemon);
    saveLocalPokemons(pokemons);
    return newPokemon;
  }

  static async updateCustomPokemon(id: number, pokemon: Partial<CustomPokemon>): Promise<CustomPokemon> {
    const pokemons = getLocalPokemons();
    const idx = pokemons.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Pokémon não encontrado');
    pokemons[idx] = { ...pokemons[idx], ...pokemon };
    saveLocalPokemons(pokemons);
    return pokemons[idx];
  }

  static async deleteCustomPokemon(id: number): Promise<void> {
    let pokemons = getLocalPokemons();
    pokemons = pokemons.filter(p => p.id !== id);
    saveLocalPokemons(pokemons);
  }
}