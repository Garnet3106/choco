export enum SearchItemType {
  SearchEngine,
  SearchHistory,
  Tab,
}

export type SearchItem = {
  type: SearchItemType.SearchEngine,
  engine: SearchEngine,
} | {
  type: SearchItemType.Tab,
  tab: Tab,
} | {
  type: SearchItemType.SearchHistory,
  history: SearchHistory,
};

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

export type SearchHistory = {
  title: string,
  url: string,
  domain: string,
};
