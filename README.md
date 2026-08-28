# ☁ SkyPulse Weather

A production-ready weather dashboard built with React 19, TypeScript, Vite, and Tailwind CSS — matching the SkyPulse design spec with glassmorphism UI, real weather data, and AI-powered insights.

## ✨ Features

### Core Weather
- **Real-time data** via Open-Meteo (free, no key required)
- **Current conditions** — temp, feels like, humidity, pressure, visibility, UV, AQI, dew point, wind gusts
- **24-hour hourly forecast** with interactive temperature curve chart
- **7/8-day daily forecast** with min/max temp bars, moon phases, rain probability
- **Dynamic sky backgrounds** — gradient adapts to weather condition and time of day

### UI & UX
- **SkyPulse dashboard layout** — left panel (current), centre (weekly + hourly + globe), right drawer (charts/wind/8-day)
- **Glassmorphism cards** with backdrop blur throughout
- **Dark / light mode** — switchable instantly
- **°C / °F toggle** — live conversion across all panels
- **Skeleton loading** states for every section
- **Smooth Framer Motion** transitions and panel animations

### Advanced Panels
- **3D interactive globe** (react-globe.gl) — click to select any city
- **Advanced metrics** — AQI rainbow donut gauge, rain probability bar chart, animated sun arc with progress
- **Wind compass** — animated needle, direction, gusts, Beaufort scale
- **Temperature trend chart** — dual-line (temp + feels like) with Recharts
- **8-day forecast drawer** with moon phases and UV index bars

### Smart Features
- **AI Weather Insights** (Claude API) — clothing advice, outdoor activities, air quality tips, travel recommendations
- **Weather alerts** — collapsible banner with dismiss, auto-expand first alert
- **Favorites system** — heart any city, quick-access strip with localStorage persistence
- **Recent searches** — last 8 cities remembered across sessions
- **City search autocomplete** — flag emojis, state/country labels, debounced API calls

### PWA
- **Installable** — Add to Home Screen on iOS/Android/desktop
- **Service worker** with Workbox — offline-capable for previously viewed cities
- **API response caching** — 5-min weather cache, 30-day icon cache
- **Background data sync** — stale-while-revalidate strategy

## 🚀 Quick Start

```bash
npm install
npm run dev
```

**No API key needed** — works out of the box with Open-Meteo.

## 🔑 Optional: OpenWeatherMap Key

Add to `.env` for richer geocoding and real AQI data:

```env
VITE_OWM_API_KEY=your_key_here
```

Get free key at [openweathermap.org](https://openweathermap.org/api). Without it, the app uses Open-Meteo geocoding and shows AQI gauge only when available.

## 📁 Architecture

```
src/
├── components/
│   ├── globe/          GlobeMini.tsx — react-globe.gl 3D Earth
│   ├── layout/         Header.tsx, LandingScreen.tsx
│   ├── ui/             SearchBar.tsx, WeatherSkeleton.tsx
│   └── weather/
│       ├── LeftPanel.tsx        Current weather + stats grid
│       ├── WeeklyForecast.tsx   7-day top bar
│       ├── HourlyPanel.tsx      24h chart + scrollable cells
│       ├── BottomRow.tsx        Globe + metrics + AI
│       ├── AdvancedMetrics.tsx  AQI donut, rain bars, sun arc
│       ├── DetailDrawer.tsx     Temp chart, wind compass, 8-day
│       ├── AIInsights.tsx       Claude-powered recommendations
│       ├── AlertsBanner.tsx     Weather alerts
│       └── FavoritesPanel.tsx   Saved cities strip
├── hooks/              useWeather.ts, useGeolocation
├── services/           weatherApi.ts (Open-Meteo + OWM)
├── store/              useAppStore.ts (Zustand + persist)
├── types/              weather.ts (full TypeScript types)
└── utils/              weather.ts (formatters, converters)
```

## 🛰 Data Sources

| Source | Data | Cost |
|--------|------|------|
| [Open-Meteo](https://open-meteo.com) | Weather, forecasts, UV | Free, no key |
| [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api) | City search fallback | Free, no key |
| [OpenWeatherMap](https://openweathermap.org/api) | Geocoding, AQI, icons | Free tier (1000 req/day) |
| [Anthropic Claude](https://anthropic.com) | AI weather insights | Pay-per-use |

## 🚢 Deploy

```bash
# Vercel (recommended)
npm i -g vercel && vercel

# Netlify
npm run build && netlify deploy --dir dist --prod
```

## 🛠 Tech Stack

| Layer | Library |
|-------|---------|
| Framework | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| State | Zustand (with localStorage persistence) |
| Data fetching | TanStack Query v5 |
| HTTP | Axios |
| 3D Globe | react-globe.gl + Three.js |
| Charts | Recharts |
| Icons | Lucide React |
| PWA | vite-plugin-pwa + Workbox |
