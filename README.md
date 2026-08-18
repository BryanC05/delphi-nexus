# Delphi Nexus

Delphi Nexus is a cyberpunk-themed monitoring dashboard for real-time intelligence: global news, weather, cybersecurity threats, space launches, solar weather, anime releases, and an embedded AI terminal.

## Features

Active dashboard modules (configurable in Settings):

| Module | Description |
|--------|-------------|
| **Weather** | Hyper-local conditions and 12-hour forecast |
| **Anime Tracker** | Upcoming seasonal anime (Jikan / MyAnimeList) |
| **Bio-Hazard Monitor** | Air quality via OpenWeatherMap |
| **Solar Weather** | Planetary K-index and NOAA space weather |
| **Cosmic Monitor** | Upcoming rocket launches |
| **Cyber Pulse** | Hacker News tech feed + DNS diagnostics |
| **Zero-Day Monitor** | Latest CVEs + sanctions search |
| **Daily Intel** | Facts, glyph decoder, GitHub/Discord dossier, knowledge archive |
| **Morse Code Station** | Web Audio Morse synthesizer and decoder |
| **Linguistic Dialects** | Translation + cultural vocabulary |
| **News Feed** | Aggregated headlines (NewsAPI / Mediastack) |
| **AI Terminal** | Groq-powered chat with dashboard context |

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Custom CSS (P3R / classic themes)
- **Charts:** Recharts
- **Backend:** Firebase Auth + Firestore (optional layout sync)
- **HTTP:** Axios

## Setup

```bash
git clone <your-repo-url>
cd delphi-nexus
npm install
cp .env.example .env
# Add your API keys to .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Environment variables

| Variable | Used by |
|----------|---------|
| `VITE_OPENWEATHER_API_KEY` | Weather, Bio-Hazard |
| `VITE_GROQ_API_KEY` | AI Terminal |
| `VITE_NEWSAPI_API_KEY` | News Feed (global) |
| `VITE_MEDIASTACK_API_KEY` | News Feed (alternate) |

In production on Vercel, NewsAPI and Mediastack requests are proxied via `vercel.json` rewrites.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Project structure

```
src/
  app/           App shell
  components/    Shared UI (WidgetShell, NewsFeed, modals, …)
  config/        Themes + widget registry
  hooks/         Geolocation, layout, theme
  widgets/       Lazy-loaded dashboard modules
  services/      Firebase
  shared/        Types, sound utils
```

## License

ISC
