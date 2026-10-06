import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'normalize.css';
import './styles/global.css';
import App from './App';
import PokemonProvider from './context/PokemonProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <PokemonProvider>
        <App />
      </PokemonProvider>
    </BrowserRouter>
  </StrictMode>,
);
