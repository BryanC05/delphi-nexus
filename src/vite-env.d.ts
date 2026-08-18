/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENWEATHER_API_KEY?: string;
  readonly VITE_GROQ_API_KEY?: string;
  readonly VITE_NEWSAPI_API_KEY?: string;
  readonly VITE_MEDIASTACK_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
