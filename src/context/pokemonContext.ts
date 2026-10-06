import { createContext } from 'react';
import type { Pokemon } from '../types';

export interface PokemonContextValue {
  pokemon: Pokemon[];
  byId: Map<number, Pokemon>;
  allTypes: string[];
  loading: boolean;
  usingMock: boolean;
}

export const PokemonContext = createContext<PokemonContextValue | null>(null);
