# Delphi Nexus

Delphi Nexus is a futuristic, cyberpunk-themed monitoring dashboard designed for real-time intelligence gathering. It provides a centralized hub for tracking everything from global news and cybersecurity threats to aerospace launches and solar weather.

## 🚀 Features & Widgets

The dashboard consists of several specialized widgets, each focused on a specific data stream:

*   **AI Terminal**: Interactive LLM interface for rapid querying and analysis.
*   **Bio Hazard**: Real-time air quality and pollution monitoring.
*   **Crypto Tracker**: Live cryptocurrency price updates and market trends.
*   **Cyber Pulse**: High-speed tech news feed from Hacker News.
*   **Exchange**: Currency conversion and historical forex data.
*   **Intel**: Daily space intelligence (NASA APOD) and obscure facts.
*   **Launch Tracker**: Real-time tracking of upcoming rocket launches.
*   **Media Radar**: Monitoring for upcoming anime, movies, and TV show releases.
*   **News Feed**: Aggregated global headlines from multiple major news sources.
*   **Radar**: Geographic point-of-interest search and mapping.
*   **Solar Weather**: Tracking planetary K-index and solar activity.
*   **Threat Monitor**: Real-time feed of the latest cybersecurity vulnerabilities (CVEs).
*   **Weather**: Hyper-local weather conditions and 5-day forecasts.
*   **World Clock**: Global time zone monitoring.

## 🛠️ Tech Stack

*   **Frontend**: [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: Custom CSS (Futuristic/Cyberpunk theme)
*   **Charts**: [Recharts](https://recharts.org/)
*   **Maps**: [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)
*   **Backend Services**: [Firebase](https://firebase.google.com/) (Auth, Firestore, Analytics)
*   **Data Fetching**: [Axios](https://axios-http.com/)

## 📡 APIs Integrated

Delphi Nexus aggregates data from a wide array of professional APIs:

| Category | API Source |
| :--- | :--- |
| **Artificial Intelligence** | [Groq (OpenAI Compatible)](https://groq.com/) |
| **Weather & Environment** | [OpenWeatherMap](https://openweathermap.org/) |
| **Finance & Crypto** | [CoinGecko](https://www.coingecko.com/), [Frankfurter](https://www.frankfurter.app/), [Polygon.io](https://polygon.io/) |
| **News** | [Hacker News](https://news.ycombinator.com/), [NewsAPI](https://newsapi.org/), [Mediastack](https://mediastack.com/) |
| **Space & Aerospace** | [NASA](https://api.nasa.gov/), [TheSpaceDevs](https://thespacedevs.com/llapi), [NOAA](https://www.swpc.noaa.gov/) |
| **Entertainment** | [TMDB](https://www.themoviedb.org/), [Jikan (MyAnimeList)](https://jikan.moe/) |
| **Geospatial** | [Overpass API (OSM)](https://wiki.openstreetmap.org/wiki/Overpass_API), [BigDataCloud](https://www.bigdatacloud.com/) |
| **Cybersecurity** | [NIST NVD (CVE)](https://nvd.nist.gov/developers/v2) |

## ⚙️ Setup & Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-repo/delphi-nexus.git
    cd delphi-nexus
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the root directory and add your API keys:
    ```env
    REACT_APP_OPENWEATHER_API_KEY=your_key
    REACT_APP_GROQ_API_KEY=your_key
    REACT_APP_TMDB_API_KEY=your_key
    REACT_APP_NEWS_API_KEY=your_key
    # Add other API keys as required by widgets
    ```

4.  **Start the development server**:
    ```bash
    npm start
    ```

## 📄 License

This project is licensed under the ISC License.
