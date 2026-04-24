export type AniWatchUrls = {
  BASE: string;
  HOME: string;
  SEARCH: string;
  GENRE: string;
  AJAX: string;
};

// Mirror sites sharing the same HTML structure as hianime/aniwatchtv.
// Add new mirrors here — they must have identical HTML to work with existing scrapers.
const FALLBACK_URLS: string[] = (process.env.ANIWATCH_BASE_URL
  ? [process.env.ANIWATCH_BASE_URL]
  : [
      "https://hianime.to",
      "https://aniwatchtv.to",
      "https://aniwatch.to",
    ]
);

const buildAniWatchTVUrls = (baseUrl: string): AniWatchUrls => ({
  BASE: baseUrl,
  HOME: `${baseUrl}/home`, // IMPORTANT ROUTE DO NOT CHANGE OR YOU WILL GO CRAZY DEBUGGING!!!
  SEARCH: `${baseUrl}/search`,
  GENRE: `${baseUrl}/genre`,
  AJAX: `${baseUrl}/ajax`,
});

// Cache the last known working URL so we don't probe on every request.
// Re-probe after 5 minutes in case a previously dead mirror comes back.
let cachedBase: string | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

const probeUrl = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { method: "HEAD", signal: controller.signal });
    clearTimeout(timer);
    // Accept any response — even a Cloudflare 403 means the server is up
    return res.status < 500;
  } catch {
    return false;
  }
};

export const getAniWatchTVUrls = async (): Promise<AniWatchUrls> => {
  if (cachedBase && Date.now() < cacheExpiry) {
    return buildAniWatchTVUrls(cachedBase);
  }

  for (const url of FALLBACK_URLS) {
    const alive = await probeUrl(url);
    if (alive) {
      cachedBase = url;
      cacheExpiry = Date.now() + CACHE_TTL_MS;
      console.log(`[source] using ${url}`);
      return buildAniWatchTVUrls(url);
    }
    console.warn(`[source] ${url} unreachable, trying next...`);
  }

  // All mirrors failed — fall back to first entry and let the scraper try anyway
  console.error("[source] all mirrors unreachable, falling back to primary");
  cachedBase = FALLBACK_URLS[0];
  cacheExpiry = Date.now() + CACHE_TTL_MS;
  return buildAniWatchTVUrls(FALLBACK_URLS[0]);
};

export const BASE_URL = FALLBACK_URLS[0];
