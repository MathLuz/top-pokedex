export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
    other: {
      'official-artwork': {
        front_default: string | null;
      };
      home: {
        front_default: string | null;
      };
    };
  };
  types: Array<{
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }>;
}

export interface PokemonSpecies {
  id: number;
  name: string;
  evolution_chain: {
    url: string;
  };
}

export interface EvolutionChain {
  id: number;
  chain: {
    species: {
      name: string;
      url: string;
    };
    evolves_to: Array<{
      species: {
        name: string;
        url: string;
      };
      evolves_to: Array<{
        species: {
          name: string;
          url: string;
        };
        evolves_to: any[];
      }>;
    }>;
  };
}

export interface PokemonType {
  id: number;
  name: string;
  pokemon: Array<{
    pokemon: {
      name: string;
      url: string;
    };
    slot: number;
  }>;
}

export interface CustomPokemon {
  id: number;
  name: string;
  imageUrl: string;
  height: string;
  weight: string;
  types: string[];
  isCustom: true;
  createdAt: string;
  updatedAt?: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    name: string;
    url: string;
  }>;
}

export interface PokemonCardData {
  id: number;
  name: string;
  image: string;
  types: string[];
  isCustom?: boolean;
}

export interface PokemonDetailData extends PokemonCardData {
  height: string;
  weight: string;
  evolutionChain?: string[];
}