const DEFAULTS = { enabled: true, fastForward: true, showBadge: true, skipCount: 0 };
const $ = (id) => document.getElementById(id);

async function load() {
  const data = await chrome.storage.local.get(DEFAULTS);
  $('fastForward').checked = data.fastForward;
  $('count').textContent = String(data.skipCount || 0);
  setEnabled(Boolean(data.enabled));
  await updateSiteStatus();
}

function setEnabled(enabled) {
  $('status').textContent = enabled ? 'Protection enabled' : 'Protection paused';
  $('statusDot').classList.toggle('on', enabled);
  $('toggle').classList.toggle('on', enabled);
}

async function updateSiteStatus() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = new URL(tab?.url || '');
    const hotstar = /(^|\.)hotstar\.com$/i.test(url.hostname);
    $('siteStatus').textContent = hotstar ? 'Active on this Hotstar tab' : 'Open a hotstar.com tab to use it';
  } catch (_) {}
}

$('toggle').addEventListener('click', async () => {
  const data = await chrome.storage.local.get(DEFAULTS);
  await chrome.storage.local.set({ enabled: !data.enabled });
  setEnabled(!data.enabled);
});

$('fastForward').addEventListener('change', (e) => chrome.storage.local.set({ fastForward: e.target.checked }));
$('reset').addEventListener('click', async () => {
  await chrome.storage.local.set({ skipCount: 0 });
  $('count').textContent = '0';
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.skipCount) $('count').textContent = String(changes.skipCount.newValue || 0);
  if (changes.enabled) setEnabled(Boolean(changes.enabled.newValue));
});

load();
