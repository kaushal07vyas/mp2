import { NavLink, Route, Routes } from 'react-router-dom';
import styles from './App.module.css';
import { usePokemon } from './hooks/usePokemon';
import ListView from './pages/ListView';
import GalleryView from './pages/GalleryView';
import DetailView from './pages/DetailView';
import NotFound from './pages/NotFound';

function navClass({ isActive }: { isActive: boolean }): string {
  return isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink;
}

export default function App() {
  const { usingMock } = usePokemon();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <NavLink to="/" className={styles.brand} end>
            <span className={styles.lens} aria-hidden="true" />
            <span className={styles.brandText}>Pokédex</span>
          </NavLink>
          <nav className={styles.nav} aria-label="Main">
            <NavLink to="/" end className={navClass}>
              Search
            </NavLink>
            <NavLink to="/gallery" className={navClass}>
              Gallery
            </NavLink>
          </nav>
        </div>
      </header>

      {usingMock && (
        <div className={styles.banner} role="status">
          PokeAPI could not be reached, so you are seeing a small sample set.{' '}
          <button type="button" className={styles.bannerButton} onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      )}

      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<ListView />} />
          <Route path="/gallery" element={<GalleryView />} />
          <Route path="/pokemon/:id" element={<DetailView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className={styles.footer}>
        Data from <a href="https://pokeapi.co" target="_blank" rel="noreferrer">PokeAPI</a>. Pokémon and
        Pokémon names are trademarks of Nintendo.
      </footer>
    </div>
  );
}
