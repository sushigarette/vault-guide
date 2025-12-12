import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Génère une URL complète avec le base path de l'application
 * @param path - Le chemin relatif (ex: "/product/123")
 * @returns L'URL complète avec le base path
 */
export function getAppUrl(path: string): string {
  const baseUrl = window.location.origin;
  // Utiliser le même basename que dans App.tsx (BrowserRouter basename="/mhstock")
  const basePath = '/mhstock';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${basePath}${cleanPath}`;
}
