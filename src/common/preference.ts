import { SearchEngine } from './search';
import { searchEngines as defaultSearchEngines } from '../../default.json';

export type Preferences = {
  searchExclusion: {
    enable: boolean,
    byDomains: string[],
    byKeywords: string[],
    byBookmarkFolders: string[],
  },
  displayAndBehavior: {
    showCategoryName: boolean,
    hideNotificationCountInTitle: boolean,
    openInNewTab: boolean,
  },
  searchEngines: SearchEngine[],
};

export namespace Preferences {
  export function getDefault(): Preferences {
    return {
      searchExclusion: {
        enable: true,
        byDomains: [],
        byKeywords: [],
        byBookmarkFolders: [],
      },
      displayAndBehavior: {
        showCategoryName: true,
        hideNotificationCountInTitle: true,
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
