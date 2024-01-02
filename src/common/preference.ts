export type Preferences = {
  searchExclusion: {
    enable: boolean,
    targetPeriodOfSearchHistory: number,
    byDomains: string[],
    byKeywords: string[],
    byBookmarkFolders: string[],
  },
  displayAndBehavior: {
    groupSearchResult: boolean,
    openInNewTab: boolean,
  },
};

export namespace Preferences {
  export function getDefault(): Preferences {
    return {
      searchExclusion: {
        enable: true,
        targetPeriodOfSearchHistory: 30,
        byDomains: [],
        byKeywords: [],
        byBookmarkFolders: [],
      },
      displayAndBehavior: {
        groupSearchResult: false,
        openInNewTab: true,
      },
    };
  }

  export async function get(): Promise<Preferences | undefined> {
    return (await chrome.storage.local.get('preferences')).preferences;
  }
}
