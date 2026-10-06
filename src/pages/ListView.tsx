import { useMemo } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import styles from './ListView.module.css';
import { usePokemon } from '../hooks/usePokemon';
import StatusMessage from '../components/StatusMessage';
import TypeBadge from '../components/TypeBadge';
import type { DetailLocationState, SortKey, SortOrder } from '../types';
import {
  SORT_OPTIONS,
  filterByQuery,
  formatName,
  formatNumber,
  isSortKey,
  sortPokemon,
  sortValueLabel,
} from '../utils/pokemon';

const DEFAULT_SORT: SortKey = 'id';
const DEFAULT_ORDER: SortOrder = 'asc';

export default function ListView() {
  const { pokemon, loading } = usePokemon();
  const location = useLocation();
  const [params, setParams] = useSearchParams();

  const query = params.get('q') ?? '';
  const sortParam = params.get('sort');
  const sortKey: SortKey = isSortKey(sortParam) ? sortParam : DEFAULT_SORT;
  const order: SortOrder = params.get('order') === 'desc' ? 'desc' : DEFAULT_ORDER;

  function updateParam(key: string, value: string, defaultValue: string) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === '' || value === defaultValue) next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true },
    );
  }

  const results = useMemo(
    () => sortPokemon(filterByQuery(pokemon, query), sortKey, order),
    [pokemon, query, sortKey, order],
  );

  const detailState: DetailLocationState = {
    ids: results.map((p) => p.id),
    backTo: location.pathname + location.search,
    backLabel: 'Back to search',
  };

  return (
    <section className={styles.page} aria-labelledby="list-heading">
      <div className={styles.intro}>
        <h1 id="list-heading" className={styles.heading}>
          Find a Pokémon
        </h1>
        <p className={styles.lede}>Search the original 151 by name or number.</p>
      </div>

      <div className={styles.controls}>
        <label className={styles.searchField}>
          <span className={styles.visuallyHidden}>Search Pokémon</span>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Try “char” or “25”"
            value={query}
            onChange={(e) => updateParam('q', e.target.value, '')}
            autoComplete="off"
            spellCheck={false}
          />
        </label>

        <div className={styles.sortGroup}>
          <label className={styles.sortLabel}>
            Sort by
            <select
              className={styles.select}
              value={sortKey}
              onChange={(e) => updateParam('sort', e.target.value, DEFAULT_SORT)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.orderToggle} role="group" aria-label="Sort order">
            <button
              type="button"
              className={styles.orderButton}
              aria-pressed={order === 'asc'}
              onClick={() => updateParam('order', 'asc', DEFAULT_ORDER)}
            >
              Ascending
            </button>
            <button
              type="button"
              className={styles.orderButton}
              aria-pressed={order === 'desc'}
              onClick={() => updateParam('order', 'desc', DEFAULT_ORDER)}
            >
              Descending
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <StatusMessage title="Loading Pokémon" loading />
      ) : results.length === 0 ? (
        <StatusMessage title={`No Pokémon match “${query}”`}>
          <p>Check the spelling, or search by number instead.</p>
        </StatusMessage>
      ) : (
        <>
          <p className={styles.count} aria-live="polite">
            {results.length} {results.length === 1 ? 'result' : 'results'}
          </p>
          <ul className={styles.list}>
            {results.map((p) => (
              <li key={p.id}>
                <Link to={`/pokemon/${p.id}`} state={detailState} className={styles.row}>
                  <img className={styles.sprite} src={p.sprite} alt="" loading="lazy" width={72} height={72} />
                  <span className={styles.number}>{formatNumber(p.id)}</span>
                  <span className={styles.name}>{formatName(p.name)}</span>
                  <span className={styles.types}>
                    {p.types.map((t) => (
                      <TypeBadge key={t} type={t} size="small" />
                    ))}
                  </span>
                  <span className={styles.metric}>{sortValueLabel(p, sortKey)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
