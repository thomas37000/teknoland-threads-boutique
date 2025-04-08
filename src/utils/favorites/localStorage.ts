
import { Product } from '@/types';

const STORAGE_KEY = 'teknoland-favorites';

/**
 * Get favorites from localStorage
 */
export const getFavoritesFromLocalStorage = (): Product[] => {
  const savedFavorites = localStorage.getItem(STORAGE_KEY);
  if (savedFavorites) {
    try {
      return JSON.parse(savedFavorites);
    } catch (error) {
      console.error('Failed to parse favorites from localStorage:', error);
      return [];
    }
  }
  return [];
};

/**
 * Save favorites to localStorage
 */
export const saveFavoritesToLocalStorage = (favorites: Product[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
};
