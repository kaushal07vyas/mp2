export interface PokemonStat {
  name: string;
  value: number;
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  baseExperience: number;
  types: string[];
  abilities: string[];
  stats: PokemonStat[];
  image: string;
  sprite: string;
}

export interface PokemonSpecies {
  genus: string;
  flavorText: string;
  habitat: string | null;
  isLegendary: boolean;
  isMythical: boolean;
}

export type SortKey = 'id' | 'name' | 'height' | 'weight' | 'baseExperience' | 'totalStats';

export type SortOrder = 'asc' | 'desc';

export type TypeMatchMode = 'any' | 'all';

export interface DetailLocationState {
  ids: number[];
  backTo: string;
  backLabel: string;
}
