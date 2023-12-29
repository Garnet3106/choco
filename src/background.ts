getAllTabs();

async function getAllTabs() {
  const tabs = await chrome.tabs.query({
    currentWindow: true,
  });

  tabs.forEach((v) => console.log(v.title));
}
