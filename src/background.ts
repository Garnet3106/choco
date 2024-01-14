chrome.runtime.onInstalled.addListener(updatePopupTitle);
chrome.runtime.onStartup.addListener(updatePopupTitle);

async function updatePopupTitle(): Promise<void> {
  const shortcut = await getPopupShortcut();

  if (shortcut) {
    const currentTitle = await chrome.action.getTitle({});
    const newTitle = `${currentTitle} (${shortcut})`;
    chrome.action.setTitle({ title: newTitle });
  }
}

async function getPopupShortcut(): Promise<string | null> {
  const commands = await chrome.commands.getAll();
  return commands.find((v) => v.name === '_execute_action')?.shortcut ?? null;
}
