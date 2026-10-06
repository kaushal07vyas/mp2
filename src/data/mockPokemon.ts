import type { Pokemon } from '../types';

const ARTWORK =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';
const SPRITE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

const STAT_NAMES = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

function mock(
  id: number,
  name: string,
  height: number,
  weight: number,
  baseExperience: number,
  types: string[],
  abilities: string[],
  stats: number[],
): Pokemon {
  return {
    id,
    name,
    height,
    weight,
    baseExperience,
    types,
    abilities,
    stats: stats.map((value, i) => ({ name: STAT_NAMES[i], value })),
    image: `${ARTWORK}/${id}.png`,
    sprite: `${SPRITE}/${id}.png`,
  };
}

export const MOCK_POKEMON: Pokemon[] = [
  mock(1, 'bulbasaur', 7, 69, 64, ['grass', 'poison'], ['overgrow', 'chlorophyll'], [45, 49, 49, 65, 65, 45]),
  mock(4, 'charmander', 6, 85, 62, ['fire'], ['blaze', 'solar-power'], [39, 52, 43, 60, 50, 65]),
  mock(7, 'squirtle', 5, 90, 63, ['water'], ['torrent', 'rain-dish'], [44, 48, 65, 50, 64, 43]),
  mock(25, 'pikachu', 4, 60, 112, ['electric'], ['static', 'lightning-rod'], [35, 55, 40, 50, 50, 90]),
  mock(133, 'eevee', 3, 65, 65, ['normal'], ['run-away', 'adaptability', 'anticipation'], [55, 55, 50, 45, 65, 55]),
  mock(150, 'mewtwo', 20, 1220, 340, ['psychic'], ['pressure', 'unnerve'], [106, 110, 90, 154, 90, 130]),
];
