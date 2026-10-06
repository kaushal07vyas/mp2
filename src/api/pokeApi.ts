import axios from 'axios';
import type { Pokemon, PokemonSpecies } from '../types';
import { MOCK_POKEMON } from '../data/mockPokemon';

export const POKEMON_LIMIT = 151;

const api = axios.create({
  baseURL: 'https://pokeapi.co/api/v2',
  timeout: 15000,
});

const CACHE_KEY = `pokedex-cache-v1-${POKEMON_LIMIT}`;
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7;

interface NamedResource {
  name: string;
  url: string;
}

interface RawListResponse {
  results: NamedResource[];
}

interface RawPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number | null;
  types: { slot: number; type: NamedResource }[];
  abilities: { ability: NamedResource; is_hidden: boolean }[];
  stats: { base_stat: number; stat: NamedResource }[];
  sprites: {
    front_default: string | null;
    other?: {
      'official-artwork'?: { front_default: string | null };
    };
  };
}

interface RawSpecies {
  genera: { genus: string; language: NamedResource }[];
  flavor_text_entries: { flavor_text: string; language: NamedResource }[];
  habitat: NamedResource | null;
  is_legendary: boolean;
  is_mythical: boolean;
}

function toPokemon(raw: RawPokemon): Pokemon {
  const artwork = raw.sprites.other?.['official-artwork']?.front_default;
  return {
    id: raw.id,
    name: raw.name,
    height: raw.height,
    weight: raw.weight,
    baseExperience: raw.base_experience ?? 0,
    types: [...raw.types].sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
    abilities: raw.abilities.map((a) => a.ability.name),
    stats: raw.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
    image: artwork ?? raw.sprites.front_default ?? '',
    sprite: raw.sprites.front_default ?? artwork ?? '',
  };
}

interface CacheEntry {
  savedAt: number;
  data: Pokemon[];
}

function readCache(): Pokemon[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (Date.now() - entry.savedAt > CACHE_TTL_MS) return null;
    if (!Array.isArray(entry.data) || entry.data.length === 0) return null;
    return entry.data;
  } catch {
    return null;
  }
}

function writeCache(data: Pokemon[]): void {
  try {
    const entry: CacheEntry = { savedAt: Date.now(), data };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch (error) {
    console.warn('Could not cache Pokémon data', error);
  }
}

export interface LoadResult {
  pokemon: Pokemon[];
  usingMock: boolean;
}

export async function fetchAllPokemon(): Promise<LoadResult> {
  const cached = readCache();
  if (cached) return { pokemon: cached, usingMock: false };

  try {
    const { data } = await api.get<RawListResponse>('/pokemon', {
      params: { limit: POKEMON_LIMIT, offset: 0 },
    });

    const responses = await Promise.all(
      data.results.map((entry) => api.get<RawPokemon>(`/pokemon/${entry.name}`)),
    );

    const pokemon = responses.map((res) => toPokemon(res.data)).sort((a, b) => a.id - b.id);
    writeCache(pokemon);
    return { pokemon, usingMock: false };
  } catch (error) {
    console.error('PokeAPI request failed, using sample data instead.', error);
    return { pokemon: MOCK_POKEMON, usingMock: true };
  }
}

const speciesCache = new Map<number, PokemonSpecies>();

export async function fetchSpecies(id: number): Promise<PokemonSpecies> {
  const hit = speciesCache.get(id);
  if (hit) return hit;

  const { data } = await api.get<RawSpecies>(`/pokemon-species/${id}`);

  const genus = data.genera.find((g) => g.language.name === 'en')?.genus ?? '';
  const flavor = data.flavor_text_entries.find((f) => f.language.name === 'en')?.flavor_text ?? '';

  const species: PokemonSpecies = {
    genus,
    flavorText: flavor.replace(/\s+/g, ' ').trim(),
    habitat: data.habitat?.name ?? null,
    isLegendary: data.is_legendary,
    isMythical: data.is_mythical,
  };

  speciesCache.set(id, species);
  return species;
}
