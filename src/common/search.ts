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
    const keywords = query.text.split(' ').filter((eachKeyword) => eachKeyword !== '');

    if (!keywords.length) {
      // fix: favorite
      return [];
    }

    const storageData = await chrome.storage.local.get();

    const openTabs: SearchItem[] = Tab.search(storageData.openTabs ?? [], keywords)
      .splice(0, 5)
      .map((eachTab) => ({
        type: SearchItemType.OpenTab,
        tab: eachTab,
      }));

    const histories: SearchItem[] = (await SearchHistory.search(query.text, query.historyStartTime))
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
      keywords.some((eachKeyword) => eachTab.website.title.includes(eachKeyword)) ||
      keywords.some((eachKeyword) => eachTab.website.url.includes(eachKeyword)) ||
      keywords.some((eachKeyword) => eachTab.website.domain.includes(eachKeyword))
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
    const items = await chrome.history.search({
      text,
      startTime,
    });

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
      }));
  }
}
