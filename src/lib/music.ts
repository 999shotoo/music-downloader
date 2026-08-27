import { getSettings } from "./settings";

export type Media = { quality: string; url: string };

export type Song = {
  id: string;
  name: string;
  duration: number | null;
  album?: { name?: string | null } | null;
  artists?: { primary?: { name: string }[] } | null;
  image?: Media[];
  downloadUrl?: Media[];
};

export function decodeText(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

export function artistNames(song: Song) {
  const raw = song.artists?.primary?.map((a) => a.name).join(", ") || song.album?.name || "Unknown artist";
  return decodeText(raw);
}

export function coverUrl(song: Song) {
  const imgs = song.image || [];
  return imgs[imgs.length - 1]?.url || imgs[0]?.url || "";
}

export function pickUrl(song: Song, preferred: string) {
  const list = song.downloadUrl || [];
  if (!list.length) return "";
  const match = list.find((m) => m.quality === preferred) ?? list[list.length - 1];
  return match?.url ?? "";
}

export function formatTime(seconds: number | null | undefined) {
  if (!seconds || Number.isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export async function searchSongs(query: string, limit = 20): Promise<Song[]> {
  const { apiUrl } = getSettings();
  const res = await fetch(
    `${apiUrl}/api/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`,
  );
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  const json = (await res.json()) as { data?: { results?: Song[] } };
  return json.data?.results ?? [];
}

export function downloadSong(song: Song) {
  const { quality } = getSettings();
  const url = pickUrl(song, quality);
  if (!url) throw new Error("No downloadable audio for this track");
  const filename = `${song.name} - ${artistNames(song)}`.replace(/[\\/:*?"<>|]/g, "_");
  const a = document.createElement("a");
  a.href = `/api/public/download?url=${encodeURIComponent(url)}&name=${encodeURIComponent(filename)}`;
  a.download = `${filename}.m4a`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
