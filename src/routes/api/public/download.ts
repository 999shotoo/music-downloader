import { createFileRoute } from "@tanstack/react-router";

const ALLOWED_HOSTS = [/\.saavncdn\.com$/, /\.jiosaavn\.com$/];

export const Route = createFileRoute("/api/public/download")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const params = new URL(request.url).searchParams;
        const target = params.get("url");
        const name = (params.get("name") || "track").replace(/["\r\n]/g, "");
        if (!target) return new Response("Missing url", { status: 400 });

        let parsed: URL;
        try {
          parsed = new URL(target);
        } catch {
          return new Response("Invalid url", { status: 400 });
        }
        if (parsed.protocol !== "https:" || !ALLOWED_HOSTS.some((re) => re.test(parsed.hostname))) {
          return new Response("Host not allowed", { status: 403 });
        }

        const upstream = await fetch(parsed.toString());
        if (!upstream.ok || !upstream.body) {
          return new Response("Upstream fetch failed", { status: 502 });
        }

        return new Response(upstream.body, {
          headers: {
            "Content-Type": "audio/mp4",
            "Content-Disposition": `attachment; filename="${name}.m4a"`,
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
