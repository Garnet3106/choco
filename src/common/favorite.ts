import { Website } from './search';

export type Favorites = Website[];

export namespace Favorites {
  export async function search(favorites: Favorites): Promise<Favorites> {
    // fix
    return favorites;
  }

  export async function get(): Promise<Favorites> {
    const { favorites } = await chrome.storage.local.get('favorites');
    return favorites ?? [];
  }

  export async function add(website: Website): Promise<void> {
    const favorites = await Favorites.get();
    return chrome.storage.local.set({ favorites: [...favorites, website] });
  }

  // todo: add remove
}
