import type { RequestHandler } from "express";
import axios from "axios";

/**
 * Proxy endpoint: GET /aniwatchtv/proxy?url=<encoded_url>
 *
 * Fetches any CDN URL server-side (no CORS issues) and streams it back.
 * For m3u8 playlist files, rewrites all segment/sub-playlist URLs so
 * they also route through this proxy — letting hls.js load everything
 * from localhost without hitting CDN CORS restrictions.
 */
export const m3u8ProxyHandler: RequestHandler = async (req, res) => {
  const targetUrl = req.query.url as string;

  if (!targetUrl) {
    res.status(400).json({ error: "Missing url parameter" });
    return;
  }

  try {
    const response = await axios.get(targetUrl, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        Referer: "https://megacloud.blog/",
        Origin: "https://megacloud.blog",
      },
      httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
    });

    const contentType: string =
      (response.headers["content-type"] as string) || "application/octet-stream";

    // For m3u8 playlists, rewrite internal URLs to also go through this proxy
    if (
      contentType.includes("mpegurl") ||
      contentType.includes("x-mpegURL") ||
      targetUrl.includes(".m3u8")
    ) {
      const text = Buffer.from(response.data).toString("utf-8");
      const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf("/") + 1);

      // Rewrite each non-comment line (segment URLs, sub-playlist URLs)
      const rewritten = text
        .split("\n")
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) return line;

          // Build absolute URL for this segment
          let absoluteUrl: string;
          if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            absoluteUrl = trimmed;
          } else if (trimmed.startsWith("/")) {
            const parsed = new URL(targetUrl);
            absoluteUrl = `${parsed.protocol}//${parsed.host}${trimmed}`;
          } else {
            absoluteUrl = baseUrl + trimmed;
          }

          // Route through our proxy
          return `http://localhost:3001/aniwatchtv/proxy?url=${encodeURIComponent(absoluteUrl)}`;
        })
        .join("\n");

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.send(rewritten);
      return;
    }

    // For all other content (ts segments, keys, etc.) — stream raw bytes
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", contentType);
    res.send(Buffer.from(response.data));
  } catch (err: any) {
    console.error("Proxy error for", targetUrl, err.message);
    res.status(502).json({ error: "Failed to proxy URL", details: err.message });
  }
};
