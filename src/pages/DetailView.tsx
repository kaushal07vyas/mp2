import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import styles from './DetailView.module.css';
import { fetchSpecies } from '../api/pokeApi';
import { usePokemon } from '../hooks/usePokemon';
import StatusMessage from '../components/StatusMessage';
import TypeBadge from '../components/TypeBadge';
import type { DetailLocationState, PokemonSpecies } from '../types';
import {
  STAT_LABELS,
  formatHeight,
  formatName,
  formatNumber,
  formatWeight,
  totalStats,
} from '../utils/pokemon';
import { typeClass } from '../utils/typeClass';

const MAX_STAT = 255;

interface SpeciesResult {
  id: number;
  data: PokemonSpecies | null;
}

function isDetailState(value: unknown): value is DetailLocationState {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<DetailLocationState>;
  return Array.isArray(candidate.ids) && typeof candidate.backTo === 'string';
}

export default function DetailView() {
  const { id } = useParams();
  const numericId = Number(id);
  const { pokemon, byId, loading } = usePokemon();
  const location = useLocation();
  const navigate = useNavigate();

  const incoming = isDetailState(location.state) ? location.state : null;

  const navState = useMemo<DetailLocationState>(() => {
    if (incoming && incoming.ids.includes(numericId)) return incoming;
    return { ids: pokemon.map((p) => p.id), backTo: '/', backLabel: 'Back to search' };
  }, [incoming, numericId, pokemon]);

  const { ids } = navState;
  const index = ids.indexOf(numericId);
  const prevId = index >= 0 ? ids[(index - 1 + ids.length) % ids.length] : undefined;
  const nextId = index >= 0 ? ids[(index + 1) % ids.length] : undefined;

  const current = byId.get(numericId);
  const prev = prevId !== undefined ? byId.get(prevId) : undefined;
  const next = nextId !== undefined ? byId.get(nextId) : undefined;

  const [species, setSpecies] = useState<SpeciesResult | null>(null);

  useEffect(() => {
    if (!current) return;
    let cancelled = false;
    fetchSpecies(current.id)
      .then((data) => {
        if (!cancelled) setSpecies({ id: current.id, data });
      })
      .catch(() => {
        if (!cancelled) setSpecies({ id: current.id, data: null });
      });
    return () => {
      cancelled = true;
    };
  }, [current]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowLeft' && prevId !== undefined) {
        navigate(`/pokemon/${prevId}`, { state: navState });
      } else if (event.key === 'ArrowRight' && nextId !== undefined) {
        navigate(`/pokemon/${nextId}`, { state: navState });
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, navState, prevId, nextId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [numericId]);

  if (loading) {
    return <StatusMessage title="Loading Pokémon" loading />;
  }

  if (!current) {
    return (
      <StatusMessage title={`No Pokémon found for “${id ?? ''}”`}>
        <p>
          This Pokédex covers numbers 1 to 151. <Link to="/">Go to search</Link>
        </p>
      </StatusMessage>
    );
  }

  const speciesReady = species !== null && species.id === current.id;
  const speciesData = speciesReady ? species.data : null;
  const primaryType = current.types[0];

  return (
    <article className={`${styles.page} ${typeClass(primaryType)}`} aria-labelledby="detail-name">
      <div className={styles.topBar}>
        <Link to={navState.backTo} className={styles.back}>
          {navState.backLabel}
        </Link>
        <span className={styles.position}>
          {index + 1} of {ids.length}
        </span>
      </div>

      <div className={styles.hero}>
        <span className={styles.bigNumber} aria-hidden="true">
          {String(current.id).padStart(3, '0')}
        </span>
        <img className={styles.artwork} src={current.image} alt={formatName(current.name)} width={360} height={360} />
        <div className={styles.heroText}>
          <p className={styles.number}>{formatNumber(current.id)}</p>
          <h1 id="detail-name" className={styles.name}>
            {formatName(current.name)}
          </h1>
          {speciesData?.genus && <p className={styles.genus}>{speciesData.genus}</p>}
          <div className={styles.types}>
            {current.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
          {speciesData?.isLegendary && <p className={styles.flag}>Legendary</p>}
          {speciesData?.isMythical && <p className={styles.flag}>Mythical</p>}
        </div>
      </div>

      <div className={styles.body}>
        <section className={styles.panel} aria-labelledby="about-heading">
          <h2 id="about-heading" className={styles.panelTitle}>
            About
          </h2>
          <p className={styles.flavor}>
            {!speciesReady
              ? 'Loading description…'
              : speciesData?.flavorText || 'No description is available for this Pokémon.'}
          </p>
          <dl className={styles.facts}>
            <div className={styles.fact}>
              <dt>Height</dt>
              <dd>{formatHeight(current.height)}</dd>
            </div>
            <div className={styles.fact}>
              <dt>Weight</dt>
              <dd>{formatWeight(current.weight)}</dd>
            </div>
            <div className={styles.fact}>
              <dt>Base experience</dt>
              <dd>{current.baseExperience}</dd>
            </div>
            <div className={styles.fact}>
              <dt>Habitat</dt>
              <dd className={styles.capitalize}>
                {speciesData?.habitat ? formatName(speciesData.habitat) : 'Unknown'}
              </dd>
            </div>
            <div className={`${styles.fact} ${styles.factWide}`}>
              <dt>Abilities</dt>
              <dd>{current.abilities.map(formatName).join(', ')}</dd>
            </div>
          </dl>
        </section>

        <section className={styles.panel} aria-labelledby="stats-heading">
          <h2 id="stats-heading" className={styles.panelTitle}>
            Base stats
          </h2>
          <ul className={styles.stats}>
            {current.stats.map((stat) => (
              <li key={stat.name} className={styles.stat}>
                <span className={styles.statName}>{STAT_LABELS[stat.name] ?? formatName(stat.name)}</span>
                <span className={styles.statValue}>{stat.value}</span>
                <progress className={styles.statBar} max={MAX_STAT} value={stat.value} aria-label={`${STAT_LABELS[stat.name] ?? stat.name} ${stat.value}`} />
              </li>
            ))}
            <li className={`${styles.stat} ${styles.statTotal}`}>
              <span className={styles.statName}>Total</span>
              <span className={styles.statValue}>{totalStats(current)}</span>
            </li>
          </ul>
        </section>
      </div>

      {prev && next && ids.length > 1 && (
        <nav className={styles.pager} aria-label="Previous and next Pokémon">
          <Link to={`/pokemon/${prev.id}`} state={navState} className={`${styles.pagerLink} ${styles.pagerPrev}`}>
            <span className={styles.arrow} aria-hidden="true">
              ‹
            </span>
            <span className={styles.pagerText}>
              <span className={styles.pagerHint}>Previous</span>
              <span className={styles.pagerName}>{formatName(prev.name)}</span>
            </span>
            <img className={styles.pagerSprite} src={prev.sprite} alt="" width={56} height={56} />
          </Link>
          <Link to={`/pokemon/${next.id}`} state={navState} className={`${styles.pagerLink} ${styles.pagerNext}`}>
            <img className={styles.pagerSprite} src={next.sprite} alt="" width={56} height={56} />
            <span className={styles.pagerText}>
              <span className={styles.pagerHint}>Next</span>
              <span className={styles.pagerName}>{formatName(next.name)}</span>
            </span>
            <span className={styles.arrow} aria-hidden="true">
              ›
            </span>
          </Link>
        </nav>
      )}
    </article>
  );
}
