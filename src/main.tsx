import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Enregistrer le service worker pour la PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const basePath = import.meta.env.BASE_URL || '/';
    const swPath = `${basePath}sw.js`.replace(/\/\//g, '/'); // Éviter les doubles slashes
    navigator.serviceWorker.register(swPath)
      .then((registration) => {
        console.log('Service Worker enregistré avec succès:', registration.scope);
      })
      .catch((error) => {
        console.log('Échec de l\'enregistrement du Service Worker:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
