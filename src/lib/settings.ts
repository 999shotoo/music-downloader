export const DEFAULT_API_URL = "https://jiosaavn-api.sharmaofficial.workers.dev";
export const DEFAULT_QUALITY = "320kbps";

export type Settings = {
  apiUrl: string;
  quality: string;
};

const KEY = "sonic-settings";

export function getSettings(): Settings {
  if (typeof window === "undefined") {
    return { apiUrl: DEFAULT_API_URL, quality: DEFAULT_QUALITY };
  }
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { apiUrl: DEFAULT_API_URL, quality: DEFAULT_QUALITY };
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      apiUrl: (parsed.apiUrl || DEFAULT_API_URL).replace(/\/+$/, ""),
      quality: parsed.quality || DEFAULT_QUALITY,
    };
  } catch {
    return { apiUrl: DEFAULT_API_URL, quality: DEFAULT_QUALITY };
  }
}

export function saveSettings(s: Settings) {
  window.localStorage.setItem(
    KEY,
    JSON.stringify({ apiUrl: s.apiUrl.trim().replace(/\/+$/, "") || DEFAULT_API_URL, quality: s.quality }),
  );
}
