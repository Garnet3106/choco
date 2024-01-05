import moji from 'moji';
import { chromePages as defaultChromePages } from '../../default.json';
import { Preferences } from './preference';
import { UnexhaustiveError } from './error';
import { Tab } from './tab';

export enum SearchResultType {
  Normal,
  SearchEngine,
}

export type SearchResult = {
  type: SearchResultType.Normal,
  items: SearchItem[],
  categorizeItems: boolean,
} | {
  type: SearchResultType.SearchEngine,
  searchEngine: SearchEngine,
  items: SearchItem[],
};

export type CategorizedSearchItems = { [type in SearchItemType]: SearchItem[] };

export namespace CategorizedSearchItems {
  export function getDefault(): CategorizedSearchItems {
    return {
      [SearchItemType.SearchEngine]: [],
      [SearchItemType.SearchEngineKeyword]: [],
      [SearchItemType.Favorite]: [],
      [SearchItemType.ChromePage]: [],
      [SearchItemType.OpenTab]: [],
      [SearchItemType.SearchHistory]: [],
    };
  }

  export function categorize(items: SearchItem[]): CategorizedSearchItems {
    const categorized = CategorizedSearchItems.getDefault();
    items.forEach((eachItem) => categorized[eachItem.type].push(eachItem));
    return categorized;
  }
}

export enum SearchItemType {
  SearchEngine,
  SearchEngineKeyword,
  Favorite,
  ChromePage,
  OpenTab,
  SearchHistory,
}

export namespace SearchItemType {
  export const translation: { [type in SearchItemType]: string } = {
    [SearchItemType.SearchEngine]: '検索エンジン',
    [SearchItemType.SearchEngineKeyword]: '検索キーワード',
    [SearchItemType.Favorite]: 'お気に入り',
    [SearchItemType.ChromePage]: 'ブラウザ機能',
    [SearchItemType.OpenTab]: '開いているタブ',
    [SearchItemType.SearchHistory]: '検索履歴',
  };
}

export type SearchItem =
  | {
    type: SearchItemType.SearchEngine,
    engine: SearchEngine,
  }
  | {
    type: SearchItemType.SearchEngineKeyword,
    website: Website,
  }
  | {
    type: SearchItemType.Favorite,
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

export type SearchQuery = {
  text: string,
  historyStartTime: number,
  hideNotificationCountInTitle: boolean,
};

export namespace Search {
  export async function search(query: SearchQuery): Promise<SearchItem[]> {
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
    const openTabs = await Tab.searchOpenTabs(keywords, 5, query.hideNotificationCountInTitle);
    // todo: 履歴だけこれと同期せず検索する
    const searchHistories = await SearchHistory.search(searchText, query.historyStartTime, 5, query.hideNotificationCountInTitle);

    return [
      ...searchEngines,
      ...favorites,
      ...chromePages,
      ...openTabs,
      ...searchHistories,
    ];
  }
}

export namespace SearchItem {
  export function getWebsite(searchItem: SearchItem): Website | undefined {
    switch (searchItem.type) {
      case SearchItemType.SearchEngine:
        return undefined;

      case SearchItemType.SearchEngineKeyword:
        return searchItem.website;

      case SearchItemType.Favorite:
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
  export function removeNotificationCountFromTitle(title: string): string {
    return title.replace(/^\(\d+\) */, '');
  }

  export function getHostname(url: string): string {
    return new URL(url).hostname;
  }

  export function getFavIconUrl(url: string): string {
    const protocol = new URL(url).protocol;
    const hostname = getHostname(url);

    const favIconUrl = new URL('https://www.google.com/s2/favicons');
    favIconUrl.searchParams.set('domain', `${protocol}//${hostname}`);
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

export type SearchHistory = {
  lastVisited: number,
  visitCount: number,
  website: Website,
};

export namespace SearchHistory {
  export async function search(text: string, startTime: number, max: number, hideNotificationCountInTitle: boolean): Promise<SearchItem[]> {
    const items = await chrome.history.search({
      text,
      maxResults: 100,
      startTime,
    });

    return items
      .filter((eachItem) => eachItem.lastVisitTime !== undefined && eachItem.title !== undefined && eachItem.url !== undefined)
      .map((eachItem) => ({
        lastVisited: eachItem.lastVisitTime!,
        visitCount: eachItem.visitCount ?? 1,
        website: {
          title: hideNotificationCountInTitle ? Website.removeNotificationCountFromTitle(eachItem.title!) : eachItem.title!,
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
