import moji from 'moji';
import { chromePages } from '../../default.json';
import { Preferences } from './preference';

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
  SearchEngineKeyword,
  ChromePage,
  OpenTab,
  SearchHistory,
}

export type SearchItem = {
  type: SearchItemType.SearchEngine,
  engine: SearchEngine,
} | {
  type: SearchItemType.SearchEngineKeyword,
  website: Website,
} | {
  type: SearchItemType.ChromePage,
  page: ChromePage,
} | {
  type: SearchItemType.OpenTab,
  tab: Tab,
} | {
  type: SearchItemType.SearchHistory,
  history: SearchHistory,
};

export type SearchItemQuery = {
  text: string,
  historyStartTime: number,
};

export namespace SearchItem {
  export async function search(query: SearchItemQuery): Promise<SearchItem[]> {
    const searchText = levelString(query.text);
    const keywords = searchText.split(' ').filter((eachKeyword) => eachKeyword !== '');

    if (!keywords.length) {
      // fix: favorite
      return [];
    }

    const preferences = await Preferences.get();

    const convertedSearchEngines: SearchItem[] = SearchEngine.search(preferences.searchEngines, searchText)
      .map((eachEngine) => ({
        type: SearchItemType.SearchEngine,
        engine: eachEngine,
      }));

    const convertedChromePages: SearchItem[] = ChromePage.search(chromePages, keywords)
      .splice(0, 3)
      .map((eachPage) => ({
        type: SearchItemType.ChromePage,
        page: eachPage,
      }));

    const rawOpenTabs = await chrome.tabs.query({ windowType: 'normal' });

    const convertedOpenTabs = rawOpenTabs
      .filter((eachTab) => eachTab.id !== undefined && eachTab.title !== undefined && eachTab.url !== undefined)
      .map((eachTab) => ({
        id: eachTab.id!,
        website: {
          title: eachTab.title!,
          url: eachTab.url!,
          favIconUrl: eachTab.favIconUrl,
          domain: Website.getDomain(eachTab.url!),
        },
      }));

    const openTabs: SearchItem[] = Tab.search(convertedOpenTabs ?? [], keywords)
      .splice(0, 5)
      .map((eachTab) => ({
        type: SearchItemType.OpenTab,
        tab: eachTab,
      }));

    // 履歴だけこれと同期せず検索する
    const rawHistories = await SearchHistory.search(searchText, query.historyStartTime);

    const histories: SearchItem[] = rawHistories
      .splice(0, 5)
      .map((eachHistory) => ({
        type: SearchItemType.SearchHistory,
        history: eachHistory,
      }));

    return [
      ...convertedSearchEngines,
      ...convertedChromePages,
      ...openTabs,
      ...histories,
    ];
  }
}

export type SearchEngine = {
  name: string,
  command: string,
  url: string,
};

export namespace SearchEngine {
  export function search(searchEngines: SearchEngine[], searchText: string): SearchEngine[] {
    return searchEngines.filter((eachEngine) => levelString(eachEngine.command) === searchText);
  }

  export function replaceKeyword(url: string, keyword: string): string {
    // fix escaping
    return url.replaceAll('{keyword}', keyword);
  }
}

export type ChromePage = {
  title: string,
  url: string,
};

export namespace ChromePage {
  export function search(chromePages: ChromePage[], keywords: string[]): ChromePage[] {
    return chromePages.filter((eachPage) => (
      keywords.some((eachKeyword) => levelString(eachPage.title).includes(eachKeyword)) ||
      keywords.some((eachKeyword) => levelString(eachPage.url).includes(eachKeyword))
    ));
  }
}

export type Website = {
  title: string,
  url: string,
  favIconUrl?: string,
  domain: string,
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
}

export type Tab = {
  id: number,
  website: Website,
};

export namespace Tab {
  export function search(tabs: Tab[], keywords: string[]): Tab[] {
    return tabs.filter((eachTab) => (
      !eachTab.website.url.startsWith('chrome://') && (
        keywords.some((eachKeyword) => levelString(eachTab.website.title).includes(eachKeyword)) ||
        keywords.some((eachKeyword) => levelString(eachTab.website.url).includes(eachKeyword)) ||
        keywords.some((eachKeyword) => levelString(eachTab.website.domain).includes(eachKeyword))
      )
    ));
  }
}

export type SearchHistory = {
  lastVisited: number,
  visitCount: number,
  website: Website,
};

export namespace SearchHistory {
  export async function search(text: string, startTime: number): Promise<SearchHistory[]> {
    const items = await chrome.history.search({ text, startTime });

    return items
      .filter((eachItem) => eachItem.lastVisitTime !== undefined && eachItem.title !== undefined && eachItem.url !== undefined)
      .map((eachItem) => ({
        lastVisited: eachItem.lastVisitTime!,
        visitCount: eachItem.visitCount ?? 1,
        website: {
          title: eachItem.title!,
          url: eachItem.url!,
          favIconUrl: Website.getFavIconUrl(eachItem.url!),
          domain: Website.getDomain(eachItem.url!),
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
      });
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
