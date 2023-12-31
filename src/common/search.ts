import moji from 'moji';

export enum SearchItemType {
  SearchEngine,
  OpenTab,
  SearchHistory,
}

export type SearchItem = {
  type: SearchItemType.SearchEngine,
  engine: SearchEngine,
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

    const rawOpenTabs = await chrome.tabs.query({ windowType: 'normal' });

    const convertedOpenTabs = rawOpenTabs
      .filter((eachTab) => eachTab.id !== undefined && eachTab.title !== undefined && eachTab.url !== undefined)
      .map((eachTab) => ({
        id: eachTab.id!,
        website: {
          title: eachTab.title!,
          url: eachTab.url!,
          favIconUrl: eachTab.favIconUrl,
          domain: 'www.example.com',
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

    return [...openTabs, ...histories];
  }
}

export type SearchEngine = {
  name: string,
  url: string,
};

export type Website = {
  title: string,
  url: string,
  favIconUrl?: string,
  domain: string,
};

export type Tab = {
  id: number,
  website: Website,
};

export namespace Tab {
  export function search(tabs: Tab[], keywords: string[]): Tab[] {
    return tabs.filter((eachTab) => (
      keywords.some((eachKeyword) => levelString(eachTab.website.title).includes(eachKeyword)) ||
      keywords.some((eachKeyword) => levelString(eachTab.website.url).includes(eachKeyword)) ||
      keywords.some((eachKeyword) => levelString(eachTab.website.domain).includes(eachKeyword))
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
          domain: 'www.example.com',
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
  return moji(source.toLowerCase())
    .convert('ZE', 'HE')
    .convert('ZS', 'HS')
    .convert('HK', 'ZK')
    .convert('KK', 'HG')
    .toString();
}
