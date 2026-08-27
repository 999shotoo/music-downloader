import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { searchSongs, type Song } from "@/lib/music";
import { TrackRow } from "@/components/TrackRow";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sonic — Search and download music" },
      {
        name: "description",
        content: "Search any song and download it instantly, with a built-in player and a configurable API endpoint.",
      },
      { property: "og:title", content: "Sonic — Search and download music" },
      {
        property: "og:description",
        content: "Search any song and download it instantly, with a built-in player.",
      },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Song[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      setResults(await searchSongs(query.trim()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="animate-in">
        <h1 className="mb-6 text-balance text-3xl font-extrabold tracking-tighter">Explore Archive</h1>
        <form onSubmit={run} className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search artist, track, or album..."
            className="w-full rounded-xl border border-border bg-card px-4 py-4 text-lg transition-all placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-primary px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-primary-foreground"
          >
            {loading ? "..." : "Search"}
          </button>
        </form>
      </section>

      <section className="mt-12 space-y-px">
        {error ? <p className="font-mono text-xs text-destructive">{error}</p> : null}

        {results ? (
          <>
            <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Search Results ({results.length})
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Action
              </span>
            </div>
            {results.map((song, i) => (
              <TrackRow key={song.id} song={song} queue={results} delay={i * 30} />
            ))}
            {!results.length && !loading ? (
              <p className="py-6 text-sm text-muted-foreground">No tracks found.</p>
            ) : null}
          </>
        ) : (
          <p className="py-6 text-sm text-muted-foreground">
            Type a song or artist above to start. Every result can be played or downloaded.
          </p>
        )}
      </section>
    </>
  );
}
