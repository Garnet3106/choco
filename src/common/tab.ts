import { SearchItem, SearchItemType, Website } from './search';

export type Tab = {
  id: number,
  website: Website,
};

export namespace Tab {
  export function search(tabs: Tab[], keywords: string[]): Tab[] {
    return tabs.filter((eachTab) => Website.match(eachTab.website, keywords));
  }

  export async function searchOpenTabs(keywords: string[], max: number, hideNotificationCountInTitle: boolean): Promise<SearchItem[]> {
    const source = await chrome.tabs.query({ windowType: 'normal' });

    const converted = source
      .filter((eachTab) => eachTab.id !== undefined && eachTab.title !== undefined && eachTab.url !== undefined)
      .map((eachTab) => ({
        id: eachTab.id!,
        website: {
          title: hideNotificationCountInTitle ? Website.removeNotificationCountFromTitle(eachTab.title!) : eachTab.title!,
          url: eachTab.url!,
        },
      }));

    return Tab.search(converted ?? [], keywords)
      .splice(0, max)
      .map((eachTab) => ({
        type: SearchItemType.OpenTab,
        tab: eachTab,
      }));
  }

  export async function openUrl(url: string, openInNewTab: boolean, setNewTabActive: boolean): Promise<void> {
    if (openInNewTab) {
      await chrome.tabs.create({
        url,
        active: setNewTabActive,
      });
    } else {
      const activeTabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (activeTabs[0] && activeTabs[0].id) {
        await chrome.tabs.update(activeTabs[0].id, { url });
      }
    }
  }
}
