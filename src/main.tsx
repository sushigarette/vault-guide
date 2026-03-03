import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Enregistrer le service worker avec gestion de mise à jour
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      // Vérifier les mises à jour
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              // Nouveau service worker activé, recharger pour utiliser la nouvelle version
              window.location.reload();
            }
          });
        }
      });
    }).catch(() => {});
  });
}

const rootElement = document.getElementById("root");
if (rootElement) {
  try {
    createRoot(rootElement).render(<App />);
  } catch (error) {
    console.error('Erreur de rendu React:', error);
    rootElement.innerHTML = '<div style="padding:2rem;text-align:center;font-family:sans-serif"><h1>Erreur de chargement</h1><p>Veuillez rafraîchir la page.</p><button onclick="location.reload()" style="padding:0.5rem 1rem;margin-top:1rem;cursor:pointer">Rafraîchir</button></div>';
  }
}
