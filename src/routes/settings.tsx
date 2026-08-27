import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DEFAULT_API_URL, DEFAULT_QUALITY, getSettings, saveSettings } from "@/lib/settings";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Sonic" },
      { name: "description", content: "Change the music API endpoint and default download quality." },
      { property: "og:title", content: "Settings — Sonic" },
      { property: "og:description", content: "Change the music API endpoint and download quality." },
    ],
  }),
  component: SettingsPage,
});

const QUALITIES = ["320kbps", "160kbps", "96kbps", "48kbps", "12kbps"];

function SettingsPage() {
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [quality, setQuality] = useState(DEFAULT_QUALITY);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = getSettings();
    setApiUrl(s.apiUrl);
    setQuality(s.quality);
  }, []);

  function persist(next: { apiUrl: string; quality: string }) {
    saveSettings(next);
    setApiUrl(getSettings().apiUrl);
    setQuality(getSettings().quality);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <section className="animate-in">
      <h1 className="mb-8 text-3xl font-extrabold tracking-tighter">System Configuration</h1>
      <div className="space-y-8">
        <div className="grid grid-cols-[1fr_2fr] items-center gap-4">
          <label htmlFor="api" className="font-mono text-xs uppercase text-muted-foreground">
            API Endpoint
          </label>
          <input
            id="api"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder={DEFAULT_API_URL}
            className="rounded border border-border bg-card px-3 py-2 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="grid grid-cols-[1fr_2fr] items-center gap-4">
          <label htmlFor="quality" className="font-mono text-xs uppercase text-muted-foreground">
            Download Quality
          </label>
          <select
            id="quality"
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className="appearance-none rounded border border-border bg-card px-3 py-2 text-sm"
          >
            {QUALITIES.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-4 pt-4">
          <button
            onClick={() => persist({ apiUrl: DEFAULT_API_URL, quality: DEFAULT_QUALITY })}
            className="rounded border border-border px-4 py-2 text-[10px] font-bold uppercase transition-colors hover:bg-secondary"
          >
            Reset Defaults
          </button>
          <button
            onClick={() => persist({ apiUrl, quality })}
            className="rounded bg-primary px-4 py-2 text-[10px] font-bold uppercase text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Save System State
          </button>
          {saved ? <span className="font-mono text-[10px] uppercase text-muted-foreground">Saved</span> : null}
        </div>
        <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
          Leave the endpoint empty to fall back to {DEFAULT_API_URL}.
        </p>
      </div>
    </section>
  );
}
