const DEFAULTS = {
  enabled: true,
  fastForward: true,
  showBadge: true,
  skipCount: 0
};

chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.local.get(DEFAULTS);
  await chrome.storage.local.set({ ...DEFAULTS, ...current });
  updateBadge(current.showBadge, current.skipCount || 0);
});

chrome.storage.onChanged.addListener(async (changes) => {
  const current = await chrome.storage.local.get(DEFAULTS);
  updateBadge(current.showBadge, current.skipCount || 0);
});

function updateBadge(show, count) {
  chrome.action.setBadgeText({ text: show && count > 0 ? String(Math.min(count, 999)) : '' });
  if (show) chrome.action.setBadgeBackgroundColor({ color: '#e50914' });
}

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message?.type === 'AD_SKIPPED') {
    chrome.storage.local.get(DEFAULTS).then((current) => {
      const next = (current.skipCount || 0) + 1;
      chrome.storage.local.set({ skipCount: next });
      updateBadge(current.showBadge, next);
    });
  }
});
