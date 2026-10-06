import { useMemo } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import styles from './GalleryView.module.css';
import { usePokemon } from '../hooks/usePokemon';
import StatusMessage from '../components/StatusMessage';
import type { DetailLocationState, TypeMatchMode } from '../types';
import { filterByTypes, formatName, formatNumber } from '../utils/pokemon';
import { typeClass } from '../utils/typeClass';

export default function GalleryView() {
  const { pokemon, allTypes, loading } = usePokemon();
  const location = useLocation();
  const [params, setParams] = useSearchParams();

  const selected = useMemo(
    () => (params.get('types') ?? '').split(',').filter((t) => t !== ''),
    [params],
  );
  const mode: TypeMatchMode = params.get('match') === 'all' ? 'all' : 'any';

  function writeParams(nextTypes: string[], nextMode: TypeMatchMode) {
    setParams(
      () => {
        const next = new URLSearchParams();
        if (nextTypes.length > 0) next.set('types', nextTypes.join(','));
        if (nextMode === 'all') next.set('match', 'all');
        return next;
      },
      { replace: true },
    );
  }

  function toggleType(type: string) {
    const nextTypes = selected.includes(type) ? selected.filter((t) => t !== type) : [...selected, type];
    writeParams(nextTypes, mode);
  }

  const results = useMemo(() => filterByTypes(pokemon, selected, mode), [pokemon, selected, mode]);

  const detailState: DetailLocationState = {
    ids: results.map((p) => p.id),
    backTo: location.pathname + location.search,
    backLabel: 'Back to gallery',
  };

  return (
    <section className={styles.page} aria-labelledby="gallery-heading">
      <div className={styles.intro}>
        <h1 id="gallery-heading" className={styles.heading}>
          Gallery
        </h1>
        <p className={styles.lede}>Pick one or more types to narrow the collection.</p>
      </div>

      <div className={styles.filters}>
        <div className={styles.chips} role="group" aria-label="Filter by type">
          {allTypes.map((type) => (
            <button
              key={type}
              type="button"
              className={`${styles.chip} ${typeClass(type)}`}
              aria-pressed={selected.includes(type)}
              onClick={() => toggleType(type)}
            >
              {type}
            </button>
          ))}
        </div>

        <div className={styles.filterFooter}>
          <div className={styles.matchToggle} role="group" aria-label="How to combine types">
            <button
              type="button"
              className={styles.matchButton}
              aria-pressed={mode === 'any'}
              onClick={() => writeParams(selected, 'any')}
            >
              Match any type
            </button>
            <button
              type="button"
              className={styles.matchButton}
              aria-pressed={mode === 'all'}
              onClick={() => writeParams(selected, 'all')}
            >
              Match all types
            </button>
          </div>

          {selected.length > 0 && (
            <button type="button" className={styles.clear} onClick={() => writeParams([], mode)}>
              Clear filters
            </button>
          )}

          <p className={styles.count} aria-live="polite">
            Showing {results.length} of {pokemon.length}
          </p>
        </div>
      </div>

      {loading ? (
        <StatusMessage title="Loading Pokémon" loading />
      ) : results.length === 0 ? (
        <StatusMessage title="No Pokémon have all of these types">
          <p>Remove a type, or switch to “Match any type”.</p>
        </StatusMessage>
      ) : (
        <ul className={styles.grid}>
          {results.map((p) => (
            <li key={p.id}>
              <Link to={`/pokemon/${p.id}`} state={detailState} className={`${styles.card} ${typeClass(p.types[0])}`}>
                <span className={styles.imageWrap}>
                  <img className={styles.image} src={p.image} alt={formatName(p.name)} loading="lazy" width={240} height={240} />
                </span>
                <span className={styles.caption}>
                  <span className={styles.cardName}>{formatName(p.name)}</span>
                  <span className={styles.cardNumber}>{formatNumber(p.id)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
