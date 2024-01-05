import { SearchEngine } from './search';
import { preferences as defaultPreferences, searchEngines as defaultSearchEngines } from '../../default.json';

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
  searchEngines: SearchEngine[],
};

export namespace Preferences {
  export function getDefault(): Preferences {
    return {
      searchExclusion: {
        enable: true,
        targetPeriodOfSearchHistory: defaultPreferences.searchExclusion.targetPeriodOfSearchHistory,
        byDomains: [],
        byKeywords: [],
        byBookmarkFolders: [],
      },
      displayAndBehavior: {
        groupSearchResult: false,
        openInNewTab: true,
      },
      searchEngines: defaultSearchEngines,
    };
  }

  export async function get(): Promise<Preferences> {
    const preferences = (await chrome.storage.local.get('preferences')).preferences;
    return Object.assign(Preferences.getDefault(), preferences);
  }

  export async function update(preferences: Preferences): Promise<void> {
    return chrome.storage.local.set({ preferences });
  }
}
