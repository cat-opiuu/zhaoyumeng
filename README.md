# KuGou Music Mobile Home

A mobile-first music discovery homepage inspired by KuGou Music, implemented with native HTML, CSS, and JavaScript. It uses no third-party framework, CDN, or remote asset.

## Features

- Responsive music home with channel navigation, search, featured carousel, shortcuts, song recommendations, mini player, and bottom navigation.
- Four local JSON mock endpoints loaded with `fetch`: navigation, banners, songs, and shortcuts.
- Native interactions for search filtering, favorite toggles, playback state, carousel controls, channel tabs, bottom navigation, shortcuts, and queue feedback.
- Original local SVG cover artwork. No build step or package installation is required.

## Screenshot-inspired page

Open `cat.html` for the screenshot-inspired mobile music account page. It uses local assets and four mock JSON files with native JavaScript interactions; its page-specific files are `css/music-account.css` and `js/account.js`. The home layouts `index.html`, `index1.html`, and `my.html` remain available.

## Run locally

`fetch` does not load local JSON reliably from a `file://` URL. Start a static server from the project root instead:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000/cat.html> in a browser. Python 3 is required. You can use any static HTTP server if Python is unavailable.

## Project structure

```text
index.html
index1.html
my.html
cat.html
README.md
assets/        Local SVG cover art
css/music.css  Original responsive page styles
css/music-home.css  Screenshot-inspired page styles
css/music-my.css  Screenshot-matched page styles
js/app.js      Native interactions and fetch logic
js/my.js       Native interactions for my.html
js/account.js  Native interactions for cat.html
data/          Local JSON mock data
data/account-*.json  Local account profile, tools, menu and message data
```

## Git hosting

The project has no generated build output or dependency lockfile. Add the complete directory to a Git repository and push it to Gitee or GitHub. The app works from the repository root when served as static files; if hosted below a subpath, update the relative paths in `index.html` and `js/app.js` as needed.
