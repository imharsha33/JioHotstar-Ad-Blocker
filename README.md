# Jio Hotstar Ad Blocker

A Manifest V3 Chrome extension that attempts to skip detectable video ads on JioHotstar (`hotstar.com`) and hide common sponsored/ad containers.

## What it does

- Detects common ad markers in the player DOM.
- Looks for a visible Skip Ad button and clicks it when present.
- When a short video is confidently identified as an ad, seeks to the end of that ad media.
- Hides common ad/sponsored spaces.
- Stores settings and skip count locally with `chrome.storage.local`.
- Has no analytics, remote scripts, or external service.

## Important limitation

JioHotstar can change player markup, ad delivery, or media URLs at any time. This is a best-effort client-side extension; it is not guaranteed to remove every ad. It does not unlock paid content, bypass subscriptions, bypass DRM, or decrypt protected media.

## Install in Chrome

1. Open `chrome://extensions/`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this folder: `Jio Hotstar ad Blocker`.
5. Open or reload `https://www.hotstar.com/in/`.
6. Start a movie/show and leave the extension enabled.

After changing source code, click **Reload** on the extension card and reload the Hotstar tab.

## Project structure

```text
Jio Hotstar ad Blocker/
├── manifest.json
├── background.js
├── content.js
├── main-world.js
├── popup.html
├── popup.css
├── popup.js
├── README.md
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

## Troubleshooting

If a new Hotstar ad is not detected, inspect the player in DevTools and add the new stable marker to `AD_TEXT_RE`, `selectors`, or the URL patterns in `isLikelyAd()` / `main-world.js`. Prefer narrow, well-tested selectors so normal movie playback is not mistaken for an ad.
