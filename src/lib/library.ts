import type { Song } from "./music";

const KEY = "sonic-downloads";

export function getDownloads(): Song[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "[]") as Song[];
  } catch {
    return [];
  }
}

export function rememberDownload(song: Song) {
  const list = getDownloads().filter((s) => s.id !== song.id);
  list.unshift(song);
  window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, 100)));
}

export function clearDownloads() {
  window.localStorage.removeItem(KEY);
}
