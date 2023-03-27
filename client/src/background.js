chrome.browserAction.onClicked.addListener(function() {
    chrome.tabs.create({ url: chrome.extension.getURL('index.html') }, function(tab) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'render'
      });
    });
  });
  