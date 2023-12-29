export enum SearchItemType {
  SearchEngine,
  SearchHistory,
}

export type SearchItem = {
  type: SearchItemType.SearchEngine,
  engine: SearchEngine,
} | {
  type: SearchItemType.SearchHistory,
  history: SearchHistory,
};

export type SearchEngine = {
  name: string,
  url: string,
};

export type SearchHistory = {
  title: string,
  url: string,
  domain: string,
};
