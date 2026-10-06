import { useContext } from 'react';
import { PokemonContext } from '../context/pokemonContext';
import type { PokemonContextValue } from '../context/pokemonContext';

export function usePokemon(): PokemonContextValue {
  const context = useContext(PokemonContext);
  if (!context) {
    throw new Error('usePokemon must be used inside <PokemonProvider>.');
  }
  return context;
}
