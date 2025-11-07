import { CustomPokemon } from '@/types/pokemon';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class CustomPokemonAPI {
  // Get all custom pokemon
  static async getCustomPokemons(): Promise<CustomPokemon[]> {
    try {
      const response = await fetch(`${API_BASE}/api/custom-pokemons`);
      if (!response.ok) {
        throw new Error('Failed to fetch custom pokemons');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching custom pokemons:', error);
      return [];
    }
  }

  // Get a specific custom pokemon
  static async getCustomPokemon(id: number): Promise<CustomPokemon | null> {
    try {
      const response = await fetch(`${API_BASE}/api/custom-pokemons/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch custom pokemon');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching custom pokemon:', error);
      return null;
    }
  }

  // Create a new custom pokemon
  static async createCustomPokemon(pokemon: Omit<CustomPokemon, 'id' | 'isCustom' | 'createdAt'>): Promise<CustomPokemon> {
    const response = await fetch(`${API_BASE}/api/custom-pokemons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pokemon),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create custom pokemon');
    }

    return response.json();
  }

  // Update a custom pokemon
  static async updateCustomPokemon(id: number, pokemon: Partial<CustomPokemon>): Promise<CustomPokemon> {
    const response = await fetch(`${API_BASE}/api/custom-pokemons/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pokemon),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update custom pokemon');
    }

    return response.json();
  }

  // Delete a custom pokemon
  static async deleteCustomPokemon(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/api/custom-pokemons/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete custom pokemon');
    }
  }
}