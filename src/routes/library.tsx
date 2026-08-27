import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { clearDownloads, getDownloads } from "@/lib/library";
import type { Song } from "@/lib/music";
import { TrackRow } from "@/components/TrackRow";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Library — Sonic" },
      { name: "description", content: "Every track you have downloaded, ready to play or download again." },
      { property: "og:title", content: "Library — Sonic" },
      { property: "og:description", content: "Every track you have downloaded with Sonic." },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => setSongs(getDownloads()), []);

  return (
    <section className="animate-in">
      <div className="mb-8 flex items-baseline justify-between">
        <h1 className="text-3xl font-extrabold tracking-tighter">Library</h1>
        {songs.length ? (
          <button
            onClick={() => {
              clearDownloads();
              setSongs([]);
            }}
            className="rounded border border-border px-4 py-2 text-[10px] font-bold uppercase transition-colors hover:bg-secondary"
          >
            Clear
          </button>
        ) : null}
      </div>

      {songs.length ? (
        songs.map((song, i) => <TrackRow key={song.id} song={song} queue={songs} delay={i * 30} />)
      ) : (
        <p className="text-sm text-muted-foreground">Tracks you download will be listed here.</p>
      )}
    </section>
  );
}
