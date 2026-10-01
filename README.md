# Jio Hotstar Ad Blocker

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Chromium Supported](https://img.shields.io/badge/Browsers-Chrome%20%7C%20Edge%20%7C%20Brave-green.svg)](#browser-compatibility)
[![Privacy First](https://img.shields.io/badge/Privacy-100%25%20Local-success.svg)](#privacy--security)
[![License](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)

A lightweight, local-only **Manifest V3** browser extension designed to skip detectable video ads and auto-click "Skip Ad" buttons on **JioHotstar** (`hotstar.com`).

---

## Table of Contents

- [Features](#features)
- [How It Works](#how-it-works)
- [Step-by-Step Installation Guide](#step-by-step-installation-guide)
  - [Prerequisites](#prerequisites)
  - [Option A: Download as ZIP (Easiest for most users)](#option-a-download-as-zip-easiest-for-most-users)
  - [Option B: Clone using Git (Recommended for developers)](#option-b-clone-using-git-recommended-for-developers)
  - [Loading into Your Browser](#loading-into-your-browser)
    - [Google Chrome](#google-chrome)
    - [Brave Browser](#brave-browser)
    - [Microsoft Edge](#microsoft-edge)
- [How to Use](#how-to-use)
- [Extension Settings & Popup UI](#extension-settings--popup-ui)
- [Updating the Extension](#updating-the-extension)
- [Permissions & Privacy](#permissions--privacy)
- [Troubleshooting & FAQ](#troubleshooting--faq)
- [Project Structure](#project-structure)
- [Disclaimer & Limitations](#disclaimer--limitations)

---

## Features

- ⚡ **Automated Ad Fast-Forwarding**: Detects in-stream video ads and seeks past them instantly.
- ⏭️ **Auto-Click "Skip Ad"**: Automatically locates and triggers the "Skip Ad" button the moment it becomes available.
- 🔒 **100% Local & Privacy-Friendly**: Zero telemetry, zero analytics, zero external API requests. Everything runs directly inside your browser.
- 📊 **Stats Counter**: Tracks how many ads have been skipped with an easy one-click reset.
- ⚙️ **Clean Controls**: Simple on/off toggle and fast-forward switch via a modern popup interface.

---

## How It Works

1. **Content Script (`content.js`)**: Runs in the context of `hotstar.com` at document start. Continuously observes video players, DOM mutations, and ad badge indicators.
2. **Main World Script (`main-world.js`)**: Interacts directly with player media elements to detect ad durations and trigger timely skips.
3. **Local Storage**: Stores user preferences and skipped ad counts locally via `chrome.storage.local`.

---

## Step-by-Step Installation Guide

### Prerequisites

You need any modern Chromium-based desktop web browser:
- **Google Chrome** (version 110 or higher)
- **Brave Browser**
- **Microsoft Edge**
- **Opera / Vivaldi / Arc**

---

### Option A: Download as ZIP (Easiest for most users)

1. Go to the GitHub repository:  
   👉 **[https://github.com/imharsha33/JioHotstar-Ad-Blocker](https://github.com/imharsha33/JioHotstar-Ad-Blocker)**
2. Click the green **Code** button near the top right, then select **Download ZIP**.
3. Locate the downloaded `.zip` file on your computer and extract (unzip) it.
4. Move the extracted folder to a safe location where you won't accidentally delete it (e.g., `Documents` or your development folder).

---

### Option B: Clone using Git (Recommended for developers)

Open your terminal or command prompt and run:

```bash
git clone https://github.com/imharsha33/JioHotstar-Ad-Blocker.git
```

This will download the project into a folder named `JioHotstar-Ad-Blocker`.

---

### Loading into Your Browser

#### Google Chrome

1. Open Google Chrome and enter `chrome://extensions/` into the address bar (or go to **Menu (⋮)** > **Extensions** > **Manage Extensions**).
2. Look in the top right corner and switch the **Developer mode** toggle to **ON**.
3. In the top left corner, click the **Load unpacked** button.
4. In the file picker dialog, navigate to and select the root folder of this project (the folder containing `manifest.json`).
5. You should now see **Jio Hotstar Ad Blocker** listed among your extensions.

#### Brave Browser

1. Navigate to `brave://extensions/` in the address bar.
2. Turn on **Developer mode** in the top right corner.
3. Click **Load unpacked** in the top left.
4. Select the project folder containing `manifest.json`.

#### Microsoft Edge

1. Navigate to `edge://extensions/` in the address bar.
2. In the left-hand sidebar, toggle on **Developer mode**.
3. Click the **Load unpacked** button that appears.
4. Select the project folder containing `manifest.json`.

---

## How to Use

1. **Pin the Extension**:
   - Click the puzzle icon (🧩) in your browser toolbar.
   - Find **Jio Hotstar Ad Blocker** and click the pin icon to keep it visible in your toolbar.
2. **Visit JioHotstar**:
   - Go to [https://www.hotstar.com/](https://www.hotstar.com/).
   - If Hotstar was already open before installing the extension, **refresh the page** (`Ctrl+R` or `Cmd+R`).
3. **Stream Content**:
   - Play your desired show, movie, or live stream.
   - When an ad is encountered, the extension will attempt to fast-forward past it or automatically click the skip button.
4. **Check Your Stats**:
   - Click the extension icon in your toolbar to view the number of ads skipped.

---

## Extension Settings & Popup UI

Clicking the extension icon opens the popup panel with the following controls:

| Setting | Description | Default |
| :--- | :--- | :--- |
| **Protection Enabled** | Global switch to turn the blocker on or off. | **ON** |
| **Skip detected video ads** | Automatically seeks past short identified ad media. | **Checked** |
| **Reset count** | Resets the skipped ads counter back to `0`. | — |

---

## Updating the Extension

When a new version or improvement is released:

### If you cloned via Git:
```bash
cd JioHotstar-Ad-Blocker
git pull origin main
```
Then go to `chrome://extensions/` and click the **reload icon (↻)** on the Jio Hotstar Ad Blocker card.

### If you downloaded as ZIP:
1. Download the latest ZIP from GitHub and extract it over your existing folder.
2. Go to `chrome://extensions/` and click the **reload icon (↻)** on the extension card.
3. Refresh your `hotstar.com` tab.

---

## Permissions & Privacy

This extension follows the principle of least privilege:

| Permission | Why It's Needed |
| :--- | :--- |
| `storage` | Saves your preferences (toggles) and skipped ads counter locally in your browser. |
| `host_permissions` (`*://hotstar.com/*`, `*://*.hotstar.com/*`) | Allows content scripts to run only on Hotstar domains to detect and skip ad elements. |

- ❌ **No account tracking**
- ❌ **No remote code execution**
- ❌ **No external requests or analytics**

---

## Troubleshooting & FAQ

### 1. Error: "Manifest file is missing or unreadable"
Make sure you select the exact folder that directly contains `manifest.json`, not a parent or nested folder.

### 2. An ad is still playing. Why?
Streaming platforms frequently update their video players, ad injection mechanics, and class names.
- Try refreshing the video page.
- Make sure the extension toggle is set to **Protection enabled** in the popup.
- If Hotstar has rolled out a new player format, feel free to open an issue on GitHub with details.

### 3. Does this give free access to VIP/Premium content?
**No.** This extension does **not** bypass subscriptions, paywalls, or digital rights management (DRM). It only handles client-side ad skipping on content you already have permission to view.

---

## Project Structure

```text
JioHotstar-Ad-Blocker/
├── manifest.json       # Manifest V3 extension configuration
├── background.js       # Background service worker (installation & lifecycle)
├── content.js          # DOM observer and ad skip controller
├── main-world.js       # In-page player interaction script
├── popup.html          # Extension popup UI
├── popup.css           # Styling for popup UI
├── popup.js            # Settings toggle & counter logic
├── icons/              # Extension icons (16px, 32px, 48px, 128px)
├── .gitignore          # Git ignore rules
└── README.md           # Documentation & installation guide
```

---

## Disclaimer & Limitations

- **Best-Effort Basis**: Hotstar's ad systems evolve constantly. While this extension aims to handle detectable ads gracefully, 100% ad removal cannot be guaranteed at all times.
- **Fair Use**: This project is intended for personal and educational use. It is not affiliated with, endorsed by, or associated with Jio, Hotstar, or Disney+ Hotstar. All trademarks belong to their respective owners.
