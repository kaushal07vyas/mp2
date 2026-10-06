import type { Pokemon, SortKey, SortOrder, TypeMatchMode } from '../types';

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'id', label: 'Number' },
  { value: 'name', label: 'Name' },
  { value: 'height', label: 'Height' },
  { value: 'weight', label: 'Weight' },
  { value: 'baseExperience', label: 'Base experience' },
  { value: 'totalStats', label: 'Total stats' },
];

export function isSortKey(value: string | null): value is SortKey {
  return SORT_OPTIONS.some((option) => option.value === value);
}

export const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Attack',
  'special-defense': 'Sp. Defense',
  speed: 'Speed',
};

export function formatName(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatNumber(id: number): string {
  return `#${String(id).padStart(3, '0')}`;
}

export function formatHeight(decimetres: number): string {
  return `${(decimetres / 10).toFixed(1)} m`;
}

export function formatWeight(hectograms: number): string {
  return `${(hectograms / 10).toFixed(1)} kg`;
}

export function totalStats(pokemon: Pokemon): number {
  return pokemon.stats.reduce((sum, stat) => sum + stat.value, 0);
}

export function sortValueLabel(pokemon: Pokemon, key: SortKey): string {
  switch (key) {
    case 'height':
      return formatHeight(pokemon.height);
    case 'weight':
      return formatWeight(pokemon.weight);
    case 'baseExperience':
      return `${pokemon.baseExperience} XP`;
    case 'totalStats':
      return `${totalStats(pokemon)} total`;
    default:
      return '';
  }
}

export function filterByQuery(list: Pokemon[], rawQuery: string): Pokemon[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return list;

  if (/^#?\d+$/.test(query)) {
    const digits = query.replace('#', '').replace(/^0+(?=\d)/, '');
    return list.filter((p) => String(p.id).startsWith(digits));
  }

  return list.filter((p) => p.name.includes(query) || formatName(p.name).toLowerCase().includes(query));
}

export function sortPokemon(list: Pokemon[], key: SortKey, order: SortOrder): Pokemon[] {
  const direction = order === 'asc' ? 1 : -1;
  return [...list].sort((a, b) => {
    let result: number;
    if (key === 'name') {
      result = a.name.localeCompare(b.name);
    } else if (key === 'totalStats') {
      result = totalStats(a) - totalStats(b);
    } else {
      result = a[key] - b[key];
    }
    return result !== 0 ? result * direction : a.id - b.id;
  });
}

export function filterByTypes(list: Pokemon[], selected: string[], mode: TypeMatchMode): Pokemon[] {
  if (selected.length === 0) return list;
  return list.filter((p) =>
    mode === 'all' ? selected.every((t) => p.types.includes(t)) : selected.some((t) => p.types.includes(t)),
  );
}

const TYPE_ORDER = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground',
  'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
];

export function collectTypes(list: Pokemon[]): string[] {
  const present = new Set(list.flatMap((p) => p.types));
  return TYPE_ORDER.filter((t) => present.has(t));
}
