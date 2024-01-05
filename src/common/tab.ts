export namespace Tab {
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
