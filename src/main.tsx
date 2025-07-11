import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initSentry } from './lib/sentry'

// Initialiser Sentry en production
initSentry();

createRoot(document.getElementById("root")!).render(<App />);
