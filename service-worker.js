chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    /kidsdiary.jp\/h\/notice\/detail\/*/.test(tab.url)
  ) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["utils/jszip.min.js"],
    });
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["utils/jszip-utils.min.js"],
    });
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["utils/FileSaver.min.js"],
    });
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["inject.js"],
    });
  }
});
