import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { fetchAllPokemon } from '../api/pokeApi';
import type { Pokemon } from '../types';
import { collectTypes } from '../utils/pokemon';
import { PokemonContext } from './pokemonContext';
import type { PokemonContextValue } from './pokemonContext';

interface Props {
  children: ReactNode;
}

export default function PokemonProvider({ children }: Props) {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchAllPokemon().then((result) => {
      if (cancelled) return;
      setPokemon(result.pokemon);
      setUsingMock(result.usingMock);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<PokemonContextValue>(
    () => ({
      pokemon,
      byId: new Map(pokemon.map((p) => [p.id, p])),
      allTypes: collectTypes(pokemon),
      loading,
      usingMock,
    }),
    [pokemon, loading, usingMock],
  );

  return <PokemonContext.Provider value={value}>{children}</PokemonContext.Provider>;
}
