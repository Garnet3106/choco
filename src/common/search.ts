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

export type Tab = {
  id: number,
  title: string,
  url: string,
  favIconUrl?: string,
  domain: string,
};

export namespace Tab {
  export function search(tabs: Tab[], keywords: string[]): Tab[] {
    return tabs.filter((eachTab) => (
      keywords.some((eachKeyword) => eachTab.title.includes(eachKeyword)) ||
      keywords.some((eachKeyword) => eachTab.url.includes(eachKeyword)) ||
      keywords.some((eachKeyword) => eachTab.domain.includes(eachKeyword))
    ));
  }
}

export type SearchHistory = {
  title: string,
  url: string,
  domain: string,
};

export namespace SearchHistory {
  export async function search(text: string, startTime: number): Promise<SearchHistory[]> {
    const items = await chrome.history.search({
      text,
      startTime,
    });

    return items
      .filter((eachItem) => eachItem.title !== undefined && eachItem.url !== undefined)
      .map((eachItem) => ({
        title: eachItem.title!,
        url: eachItem.url!,
        domain: 'www.example.com',
      }));
  }
}
