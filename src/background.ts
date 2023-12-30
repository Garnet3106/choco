import { Tab } from './common/search';

console.log('Initializing extension...');

store();

async function store(): Promise<void> {
  const tabs = await getAllTabs();

  chrome.storage.local.set({
    openTabs: tabs,
  });
}

async function getAllTabs(): Promise<Tab[]> {
  const tabs = await chrome.tabs.query({ windowType: 'normal' });

  return tabs
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
}
