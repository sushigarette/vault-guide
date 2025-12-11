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
  const basePath = import.meta.env.BASE_URL || '/';
  // Enlever le trailing slash du basePath et du path pour éviter les doubles slashes
  const cleanBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanBasePath}${cleanPath}`;
}
