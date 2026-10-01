(() => {
  'use strict';

  const DEFAULTS = {
    enabled: true,
    hideSpaces: true,
    fastForward: true
  };

  const state = { ...DEFAULTS };
  const processed = new WeakMap();
  const lastSkip = new WeakMap();
  let pollTimer = null;
  let observer = null;

  function loadState() {
    if (!chrome?.storage?.local) return Promise.resolve();
    return chrome.storage.local.get(DEFAULTS).then((saved) => {
      Object.assign(state, saved);
      applyHideRules();
    }).catch(() => {});
  }

  function isHotstar() {
    return /(^|\.)hotstar\.com$/i.test(location.hostname);
  }

  if (!isHotstar()) return;

  const AD_TEXT_RE = /\b(ad|ads|advertisement|commercial|sponsored|sponsor|promoted)\b/i;
  const SKIP_RE = /skip\s*(ad|ads|intro|commercial)?|skip now|skip video|continue to video|watch content/i;
  const COUNTDOWN_RE = /(?:skip|ad).{0,20}(?:\d+\s*(?:sec|secs|seconds|s)|\d{1,2}:\d{2})/i;

  const ATTRS = [
    'aria-label', 'aria-labelledby', 'data-testid', 'data-test-id',
    'data-name', 'data-purpose', 'data-content', 'class', 'id', 'role'
  ];

  function textOf(el) {
    if (!el) return '';
    const parts = [];
    for (const attr of ATTRS) {
      const value = el.getAttribute?.(attr);
      if (value) parts.push(value);
    }
    if (el.childElementCount <= 6) parts.push(el.textContent || '');
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  }

  function isVisible(el) {
    if (!el || !el.isConnected) return false;
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' &&
      parseFloat(style.opacity || '1') > 0 && rect.width > 4 && rect.height > 4;
  }

  function adScore(el) {
    let score = 0;
    const text = textOf(el);
    if (AD_TEXT_RE.test(text)) score += 2;
    if (/\bad[-_ ]?(container|slot|break|unit|overlay|label|marker)\b/i.test(text)) score += 2;
    if (/\bdoubleclick\b|\bgooglesyndication\b|\badservice\b|\bvast\b|\bvmap\b/i.test(text)) score += 2;
    if (el.matches?.('[class*="ad" i], [id*="ad" i], [data-testid*="ad" i], [data-purpose*="ad" i]')) score += 2;
    if (el.querySelector?.('[class*="ad" i], [id*="ad" i], [data-testid*="ad" i], [data-purpose*="ad" i]')) score += 1;
    if (el.querySelector?.('video')) score += 1;
    return score;
  }

  function findAdContainers() {
    const candidates = new Set();
    const selectors = [
      '[data-testid*="ad" i]', '[data-test-id*="ad" i]', '[data-purpose*="ad" i]',
      '[aria-label*="advert" i]', '[class*="advert" i]', '[id*="advert" i]',
      '[class*="ad-container" i]', '[class*="ad_container" i]', '[id*="ad-container" i]',
      '[class*="adbreak" i]', '[class*="commercial" i]'
    ];
    for (const selector of selectors) {
      document.querySelectorAll(selector).forEach((el) => candidates.add(el));
    }
    // Add ancestors around explicit ad labels or buttons.
    document.querySelectorAll('button, [role="button"], span, div').forEach((el) => {
      if (candidates.size > 1200) return;
      const text = textOf(el);
      if (AD_TEXT_RE.test(text) || COUNTDOWN_RE.test(text)) {
        let p = el;
        for (let i = 0; i < 4 && p; i++, p = p.parentElement) {
          if (isVisible(p)) candidates.add(p);
        }
      }
    });
    return [...candidates];
  }

  function findVideos() {
    return [...document.querySelectorAll('video')].filter(isVisible);
  }

  function nearbyAdContainer(video) {
    let p = video.parentElement;
    for (let i = 0; i < 7 && p; i++, p = p.parentElement) {
      if (adScore(p) >= 4) return p;
    }
    return null;
  }

  function tryClickSkipButtons(root = document) {
    if (!state.enabled) return false;
    const buttons = [...root.querySelectorAll?.('button, [role="button"], a, input[type="button"]') || []];
    for (const button of buttons) {
      if (!isVisible(button)) continue;
      const label = [
        button.getAttribute('aria-label') || '',
        button.getAttribute('title') || '',
        button.textContent || ''
      ].join(' ').replace(/\s+/g, ' ').trim();
      if (SKIP_RE.test(label)) {
        try { button.click(); } catch (_) {}
        notifySkipped();
        return true;
      }
    }
    return false;
  }

  function skipVideo(video, reason) {
    if (!state.enabled || !state.fastForward || !video || !Number.isFinite(video.duration) || video.duration <= 0) return false;
    const now = performance.now();
    const last = lastSkip.get(video) || 0;
    if (now - last < 1200) return false;

    const current = Number.isFinite(video.currentTime) ? video.currentTime : 0;
    const remaining = video.duration - current;
    if (remaining <= 0.5 || video.duration > 12 * 60) return false;

    try {
      video.currentTime = Math.max(0, video.duration - 0.15);
      lastSkip.set(video, now);
      notifySkipped();
      markSkipped(video, reason);
      return true;
    } catch (_) {
      return false;
    }
  }

  function markSkipped(video, reason) {
    const host = nearbyAdContainer(video) || video.parentElement;
    if (!host) return;
    host.setAttribute('data-jha-skipped', 'true');
    host.setAttribute('data-jha-reason', reason || 'detected-ad');
  }

  function isLikelyAd(video) {
    if (!video) return false;
    const src = `${video.currentSrc || ''} ${video.src || ''}`.toLowerCase();
    if (/doubleclick|googlesyndication|googleadservices|moatads|adservice|vast|vmap|advert|\bads\b/.test(src)) return true;
    const container = nearbyAdContainer(video);
    if (container && adScore(container) >= 5) return true;

    // Inspect nearby overlay text without assuming a specific Hotstar class name.
    const root = video.parentElement?.parentElement || video.parentElement;
    const visibleText = root ? textOf(root) : '';
    if (COUNTDOWN_RE.test(visibleText)) return true;
    return false;
  }

  function hideAdSpaces() {
    if (!state.hideSpaces) return;
    for (const container of findAdContainers()) {
      if (!isVisible(container)) continue;
      if (adScore(container) < 4) continue;
      const hasVideo = !!container.querySelector?.('video');
      const hasSkip = !![...container.querySelectorAll?.('button, [role="button"]') || []]
        .some((b) => SKIP_RE.test(textOf(b)));
      if (hasVideo || hasSkip || AD_TEXT_RE.test(textOf(container))) {
        if (!processed.has(container)) processed.set(container, container.getAttribute('style') || '');
        container.classList.add('jha-hidden-ad-space');
      }
    }
  }

  function restoreAdSpaces() {
    document.querySelectorAll('.jha-hidden-ad-space').forEach((el) => el.classList.remove('jha-hidden-ad-space'));
  }

  function applyHideRules() {
    if (state.hideSpaces) injectStyle();
    else removeStyle();
    if (!state.hideSpaces) restoreAdSpaces();
  }

  function injectStyle() {
    if (document.getElementById('jha-style')) return;
    const style = document.createElement('style');
    style.id = 'jha-style';
    style.textContent = `
      .jha-hidden-ad-space { visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; }
      [data-jha-skipped="true"] { visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; }
    `;
    (document.documentElement || document.head || document.body)?.appendChild(style);
  }

  function removeStyle() {
    document.getElementById('jha-style')?.remove();
  }

  function notifySkipped() {
    try { chrome.runtime.sendMessage({ type: 'AD_SKIPPED' }); } catch (_) {}
  }

  function scan() {
    if (!state.enabled) return;
    tryClickSkipButtons(document);
    hideAdSpaces();

    for (const video of findVideos()) {
      if (isLikelyAd(video)) {
        skipVideo(video, 'video-or-container');
      }
    }
  }

  function start() {
    loadState().finally(() => {
      injectStyle();
      observer = new MutationObserver(() => {
        if (!pollTimer) {
          pollTimer = setTimeout(() => { pollTimer = null; scan(); }, 150);
        }
      });
      observer.observe(document.documentElement || document, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'aria-label', 'data-testid'] });
      setInterval(scan, 700);
      scan();
    });
  }

  chrome.storage?.onChanged?.addListener((changes) => {
    for (const [key, change] of Object.entries(changes)) {
      if (key in state) state[key] = change.newValue;
    }
    applyHideRules();
    scan();
  });

  window.addEventListener('message', (event) => {
    if (event.source !== window || event.data?.source !== 'JHA_MAIN') return;
    if (event.data.type === 'AD_MEDIA_CANDIDATE') {
      const videos = findVideos();
      if (videos.length) {
        const target = videos.find(v => (v.currentSrc || v.src || '') === event.data.src) || videos[0];
        if (target && event.data.duration > 0 && event.data.duration < 720) {
          skipVideo(target, 'main-world-media-signal');
        }
      }
    }
  });

  start();
})();
