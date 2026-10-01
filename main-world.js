(() => {
  'use strict';
  if (!/\.hotstar\.com$/i.test(location.hostname)) return;

  const seen = new WeakSet();

  function inspect(video) {
    if (!(video instanceof HTMLVideoElement) || seen.has(video)) return;
    seen.add(video);

    const emit = () => {
      const src = video.currentSrc || video.src || '';
      const duration = Number(video.duration);
      const signalText = `${src} ${document.title}`.toLowerCase();
      if (/doubleclick|googlesyndication|googleadservices|moatads|vast|vmap|advert|adservice/.test(signalText) && duration > 0) {
        window.postMessage({ source: 'JHA_MAIN', type: 'AD_MEDIA_CANDIDATE', src, duration }, '*');
      }
    };

    video.addEventListener('loadedmetadata', emit, { passive: true });
    video.addEventListener('durationchange', emit, { passive: true });
    emit();
  }

  const observer = new MutationObserver(() => {
    document.querySelectorAll('video').forEach(inspect);
  });
  observer.observe(document.documentElement || document, { childList: true, subtree: true });
  document.querySelectorAll('video').forEach(inspect);
})();
