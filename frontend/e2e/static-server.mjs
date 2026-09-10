/**
 * Minimal static file server for the Next.js `out/` export.
 *
 * `next build` with `output: 'export'` writes `/dashboard.html`, not
 * `/dashboard/index.html`, so a plain file server 404s on the app routes.
 * This maps an extension-less path to its `.html` counterpart, which is what
 * the production hosts (Netlify, Render static sites) do too.
 *
 * Usage: node e2e/static-server.mjs   (PORT env var, default 3000)
 */

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("../out/", import.meta.url)));
const PORT = Number(process.env.PORT || 3000);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
};

async function firstExistingFile(candidates) {
  for (const candidate of candidates) {
    try {
      const info = await stat(candidate);
      if (info.isFile()) return candidate;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  // Prevent escaping ROOT through encoded traversal sequences.
  const safePath = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  const target = join(ROOT, safePath);

  if (!target.startsWith(ROOT)) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  const file =
    (await firstExistingFile([target, `${target}.html`, join(target, "index.html")])) ??
    (await firstExistingFile([join(ROOT, "404.html")]));

  if (!file) {
    res.writeHead(404).end("Not found");
    return;
  }

  const body = await readFile(file);
  const isNotFound = file.endsWith("404.html") && !safePath.endsWith("404.html");
  res.writeHead(isNotFound ? 404 : 200, {
    "Content-Type": MIME[extname(file).toLowerCase()] ?? "application/octet-stream",
    "Cache-Control": "no-store",
  });
  res.end(body);
});

server.listen(PORT, () => {
  console.log(`[e2e] static export served from ${ROOT} on http://localhost:${PORT}`);
});
