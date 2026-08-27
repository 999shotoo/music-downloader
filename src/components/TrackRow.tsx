import { useState } from "react";
import { artistNames, coverUrl, decodeText, downloadSong, formatTime, type Song } from "@/lib/music";
import { usePlayer } from "./PlayerProvider";
import { rememberDownload } from "@/lib/library";

export function TrackRow({ song, queue, delay = 0 }: { song: Song; queue?: Song[]; delay?: number }) {
  const { play } = usePlayer();
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");

  return (
    <div
      className="group -mx-2 flex animate-in items-center gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-secondary/60"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded bg-secondary">
        {coverUrl(song) ? (
          <img src={coverUrl(song)} alt={song.name} loading="lazy" className="size-full object-cover" />
        ) : (
          <span className="font-mono text-[8px] text-muted-foreground">IMG</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold">{decodeText(song.name)}</h3>
        <p className="truncate text-xs text-muted-foreground">{artistNames(song)}</p>
      </div>
      <div className="mr-4 font-mono text-[11px] tabular-nums text-muted-foreground">
        {formatTime(song.duration)}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            try {
              setState("working");
              downloadSong(song);
              rememberDownload(song);
              setState("done");
            } catch {
              setState("error");
            }
          }}
          className="cursor-pointer rounded-md bg-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {state === "done" ? "Saved" : state === "error" ? "Failed" : "Download"}
        </button>
        <button
          onClick={() => play(song, queue)}
          aria-label="Play"
          className="rounded-md p-2 transition-colors hover:bg-secondary"
        >
          <span className="ml-0.5 block size-3 border-b-[6px] border-l-[9px] border-t-[6px] border-b-transparent border-l-primary border-t-transparent" />
        </button>
      </div>
    </div>
  );
}
