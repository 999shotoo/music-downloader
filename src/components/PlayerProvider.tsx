import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { artistNames, coverUrl, decodeText, formatTime, pickUrl, type Song } from "@/lib/music";
import { getSettings } from "@/lib/settings";

type PlayerState = {
  current: Song | null;
  isPlaying: boolean;
  play: (song: Song, queue?: Song[]) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
};

const Ctx = createContext<PlayerState | null>(null);

export function usePlayer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [index, setIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const current = index >= 0 ? (queue[index] ?? null) : null;

  useEffect(() => {
    if (!current) return;
    const audio = audioRef.current;
    if (!audio) return;
    const url = pickUrl(current, getSettings().quality);
    if (!url) return;
    audio.src = url;
    audio.play().then(
      () => setIsPlaying(true),
      () => setIsPlaying(false),
    );
  }, [current]);

  const value = useMemo<PlayerState>(
    () => ({
      current,
      isPlaying,
      play: (song, list) => {
        const nextQueue = list && list.length ? list : [song];
        const i = Math.max(
          0,
          nextQueue.findIndex((s) => s.id === song.id),
        );
        setQueue(nextQueue);
        setIndex(i);
      },
      toggle: () => {
        const audio = audioRef.current;
        if (!audio || !current) return;
        if (audio.paused) {
          audio.play().then(() => setIsPlaying(true));
        } else {
          audio.pause();
          setIsPlaying(false);
        }
      },
      next: () => setIndex((i) => (i + 1 < queue.length ? i + 1 : i)),
      prev: () => setIndex((i) => (i > 0 ? i - 1 : i)),
    }),
    [current, isPlaying, queue],
  );

  const progress = duration ? (time / duration) * 100 : 0;

  return (
    <Ctx.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => value.next()}
      />
      <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card px-4 py-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-2">
          <div
            className="relative h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-secondary"
            onClick={(e) => {
              const audio = audioRef.current;
              if (!audio || !duration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              audio.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
            }}
          >
            <div
              className="absolute left-0 top-0 h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex w-1/3 items-center gap-3">
              <div className="size-10 shrink-0 overflow-hidden rounded bg-secondary outline outline-1 outline-border">
                {current && coverUrl(current) ? (
                  <img src={coverUrl(current)} alt={current.name} className="size-full object-cover" />
                ) : null}
              </div>
              <div className="hidden min-w-0 sm:block">
                <div className="truncate text-xs font-bold">
                  {current ? decodeText(current.name) : "Nothing playing"}
                </div>
                <div className="truncate text-[10px] text-muted-foreground">
                  {current ? artistNames(current) : "Search a track to start"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={value.prev}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                PREV
              </button>
              <button
                onClick={value.toggle}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
              >
                {isPlaying ? (
                  <span className="flex gap-[3px]">
                    <span className="block h-3 w-[3px] bg-current" />
                    <span className="block h-3 w-[3px] bg-current" />
                  </span>
                ) : (
                  <span className="ml-0.5 size-3 border-b-[5px] border-l-[8px] border-t-[5px] border-b-transparent border-l-current border-t-transparent" />
                )}
              </button>
              <button
                onClick={value.next}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                NEXT
              </button>
            </div>

            <div className="flex w-1/3 items-center justify-end gap-4">
              <div className="font-mono text-[10px] tracking-tighter text-muted-foreground">
                {formatTime(time)} / {formatTime(duration || current?.duration || 0)}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </Ctx.Provider>
  );
}
