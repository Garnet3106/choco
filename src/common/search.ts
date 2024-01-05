import moji from 'moji';
import { chromePages as defaultChromePages } from '../../default.json';
import { Preferences } from './preference';
import { UnexhaustiveError } from './error';

export enum SearchResultType {
  Normal,
  SearchEngine,
}

export type SearchResult = {
  type: SearchResultType.Normal,
  items: SearchItem[],
} | {
  type: SearchResultType.SearchEngine,
  searchEngine: SearchEngine,
  items: SearchItem[],
};

export enum SearchItemType {
  SearchEngine,
  Favorite,
  SearchEngineKeyword,
  ChromePage,
  OpenTab,
  SearchHistory,
}

export type SearchItem =
  | {
    type: SearchItemType.SearchEngine,
    engine: SearchEngine,
  }
  | {
    type: SearchItemType.Favorite,
    website: Website,
  }
  | {
    type: SearchItemType.SearchEngineKeyword,
    website: Website,
  }
  | {
    type: SearchItemType.ChromePage,
    page: ChromePage,
  }
  | {
    type: SearchItemType.OpenTab,
    tab: Tab,
  }
  | {
    type: SearchItemType.SearchHistory,
    history: SearchHistory,
  };

export type SearchItemQuery = {
  text: string,
  historyStartTime: number,
};

export namespace SearchItem {
  export function getWebsite(searchItem: SearchItem): Website | undefined {
    switch (searchItem.type) {
      case SearchItemType.SearchEngine:
        return undefined;

      case SearchItemType.Favorite:
        return searchItem.website;

      case SearchItemType.SearchEngineKeyword:
        return searchItem.website;

      case SearchItemType.ChromePage:
        return undefined;

      case SearchItemType.OpenTab:
        return searchItem.tab.website;

      case SearchItemType.SearchHistory:
        return searchItem.history.website;

      default:
        throw new UnexhaustiveError();
    }
  }

  export async function search(query: SearchItemQuery): Promise<SearchItem[]> {
    const searchText = levelString(query.text);
    const keywords = searchText.split(' ').filter((eachKeyword) => eachKeyword !== '');

    if (!keywords.length) {
      return (await Favorites.get())
        .map((eachFavorite) => ({
          type: SearchItemType.Favorite,
          website: eachFavorite,
        }));
    }

    const preferences = await Preferences.get();
    const searchEngines = SearchEngine.search(preferences.searchEngines, searchText);
    const favorites = await Favorites.search(keywords, 3);
    const chromePages = ChromePage.search(keywords, 1);
    const openTabs = await Tab.searchOpenTabs(keywords, 5);
    // todo: 履歴だけこれと同期せず検索する
    const searchHistories = await SearchHistory.search(searchText, query.historyStartTime, 5);

    return [
      ...searchEngines,
      ...favorites,
      ...chromePages,
      ...openTabs,
      ...searchHistories,
    ];
  }
}

export type SearchEngine = {
  name: string,
  command: string,
  url: string,
};

export namespace SearchEngine {
  export function search(searchEngines: SearchEngine[], searchText: string): SearchItem[] {
    return searchEngines
      .filter((eachEngine) => levelString(eachEngine.command) === searchText)
      .map((eachEngine) => ({
        type: SearchItemType.SearchEngine,
        engine: eachEngine,
      }));
  }

  export function replaceKeyword(url: string, keyword: string): string {
    // fix escaping
    return url.replaceAll('{keyword}', keyword);
  }
}

export type Favorites = Website[];

export namespace Favorites {
  export async function search(keywords: string[], max: number): Promise<SearchItem[]> {
    return (await Favorites.get())
      .filter((eachWebsite) => Website.match(eachWebsite, keywords))
      .splice(0, max)
      .map((eachFavorite) => ({
        type: SearchItemType.Favorite,
        website: eachFavorite,
      }));
  }

  export async function get(): Promise<Favorites> {
    const { favorites } = await chrome.storage.local.get('favorites');
    return favorites ?? [];
  }

  export async function add(website: Website): Promise<void> {
    const favorites = (await Favorites.get()).filter((v) => v.url !== website.url);
    return chrome.storage.local.set({ favorites: [...favorites, website] });
  }

  export async function remove(url: string): Promise<void> {
    const favorites = (await Favorites.get()).filter((v) => v.url !== url);
    return chrome.storage.local.set({ favorites });
  }
}

export type ChromePage = {
  title: string,
  url: string,
};

export namespace ChromePage {
  export function search(keywords: string[], max: number): SearchItem[] {
    return defaultChromePages
      .filter((eachPage) => (
        keywords.some((eachKeyword) => levelString(eachPage.title).includes(eachKeyword)) ||
        keywords.some((eachKeyword) => levelString(eachPage.url).includes(eachKeyword))
      ))
      .splice(0, max)
      .map((eachPage) => ({
        type: SearchItemType.ChromePage,
        page: eachPage,
      }));
  }
}

export type Website = {
  title: string,
  url: string,
};

export namespace Website {
  export function getDomain(url: string): string {
    return new URL(url).hostname;
  }

  export function getFavIconUrl(url: string): string {
    const favIconUrl = new URL('https://www.google.com/s2/favicons');
    favIconUrl.searchParams.set('domain', url);
    favIconUrl.searchParams.set('size', '128');
    return favIconUrl.toString();
  }

  export function match(website: Website, keywords: string[]): boolean {
    return (
      !website.url.startsWith('chrome://') && (
        keywords.some((eachKeyword) => levelString(website.title).includes(eachKeyword)) ||
        keywords.some((eachKeyword) => levelString(website.url).includes(eachKeyword))
      )
    );
  }
}

export type Tab = {
  id: number,
  website: Website,
};

export namespace Tab {
  export function search(tabs: Tab[], keywords: string[]): Tab[] {
    return tabs.filter((eachTab) => Website.match(eachTab.website, keywords));
  }

  export async function searchOpenTabs(keywords: string[], max: number): Promise<SearchItem[]> {
    const source = await chrome.tabs.query({ windowType: 'normal' });

    const converted = source
      .filter((eachTab) => eachTab.id !== undefined && eachTab.title !== undefined && eachTab.url !== undefined)
      .map((eachTab) => ({
        id: eachTab.id!,
        website: {
          title: eachTab.title!,
          url: eachTab.url!,
        },
      }));

    return Tab.search(converted ?? [], keywords)
      .splice(0, max)
      .map((eachTab) => ({
        type: SearchItemType.OpenTab,
        tab: eachTab,
      }));
  }
}

export type SearchHistory = {
  lastVisited: number,
  visitCount: number,
  website: Website,
};

export namespace SearchHistory {
  export async function search(text: string, startTime: number, max: number): Promise<SearchItem[]> {
    const items = await chrome.history.search({ text, startTime });

    return items
      .filter((eachItem) => eachItem.lastVisitTime !== undefined && eachItem.title !== undefined && eachItem.url !== undefined)
      .map((eachItem) => ({
        lastVisited: eachItem.lastVisitTime!,
        visitCount: eachItem.visitCount ?? 1,
        website: {
          title: eachItem.title!,
          url: eachItem.url!,
        },
      }))
      .sort((a, b) => {
        if (a.lastVisited < b.lastVisited) {
          return 1;
        }

        if (a.lastVisited > b.lastVisited) {
          return -1;
        }

        return 0;
      })
      .splice(0, max)
      .map((eachHistory) => ({
        type: SearchItemType.SearchHistory,
        history: eachHistory,
      }));
  }
}

function levelString(source: string): string {
  return moji(source.trim().toLowerCase())
    .convert('ZE', 'HE')
    .convert('ZS', 'HS')
    .convert('HK', 'ZK')
    .convert('KK', 'HG')
    .toString();
}
