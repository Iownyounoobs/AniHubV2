import axios from "axios";
import { load } from "cheerio";
import { getAniWatchTVUrls } from "../utils/aniwatchtvRoutes";
import { headers } from "../config/headers";
import { extractSearchedAnimes, extractExtraAboutInfo } from "../extractors";
import { detectCountry } from "../utils/detectCountry";

// ── Cache ─────────────────────────────────────────────────────────────────────
let cachedAnimes: any[] | null = null;
let cacheTime = 0;
const CACHE_TTL_MS = 30 * 60 * 1000;
const PAGE_SIZE = 24;

// These terms are exclusive to Chinese animation — no studio validation needed
const EXCLUSIVE_KEYWORDS = [
  "douluo",    // Douluo Dalu / Soul Land series
  "xianxia",   // Chinese fantasy genre
  "wuxia",     // Chinese martial arts genre
  "cultivation",
  "donghua",
];

// These may also match Japanese anime — validate studio before including
const MIXED_KEYWORDS = [
  "immortal",
  "heaven",
  "martial",
  "stellar",
  "spirit",
  "soul land",
  "divine",
  "battle",
  "legend",
  "peak",
  "sword",
  "clan",
  "sect",
  "dao",
];

async function searchKeyword(
  SEARCH: string,
  kw: string,
  pages: number
): Promise<any[]> {
  const tasks = Array.from({ length: pages }, (_, i) =>
    axios
      .get(`${SEARCH}?keyword=${encodeURIComponent(kw)}&page=${i + 1}`, {
        headers,
        timeout: 10000,
      })
      .then((res) => {
        const $ = load(res.data);
        return extractSearchedAnimes(
          $,
          "#main-content .tab-content .film_list-wrap .flw-item"
        );
      })
      .catch(() => [] as any[])
  );
  const pages_data = await Promise.all(tasks);
  return pages_data.flat();
}

async function fetchStudioOrigin(
  id: string,
  BASE: string
): Promise<"Japan" | "China" | "Unknown"> {
  try {
    const url = new URL(id, BASE).toString();
    const res = await axios.get(url, { headers, timeout: 8000 });
    const $ = load(res.data);
    const moreInfo = extractExtraAboutInfo(
      $,
      "#ani_detail .container .anis-content .anisc-info"
    );
    const parse = (field: string): string[] => {
      const raw = moreInfo[field];
      return typeof raw === "string" ? raw.split(",").map((s) => s.trim()) : [];
    };
    const all = [...parse("Studios:"), ...parse("Producers:")];
    return detectCountry(all);
  } catch {
    return "Unknown";
  }
}

async function batchAll<T>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<any>
): Promise<any[]> {
  const results: any[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const settled = await Promise.allSettled(batch.map(fn));
    for (const s of settled) {
      results.push(s.status === "fulfilled" ? s.value : "Unknown");
    }
  }
  return results;
}

function dedupe(animes: any[]): any[] {
  const seen = new Set<string>();
  const out: any[] = [];
  for (const a of animes) {
    const id = (a.id || "").split("?")[0];
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push({ ...a, id });
  }
  return out;
}

export async function scrapeChineseDonghua(page: number = 1): Promise<{
  animes: any[];
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
}> {
  const now = Date.now();

  if (!cachedAnimes || now - cacheTime > CACHE_TTL_MS) {
    const { BASE, SEARCH } = await getAniWatchTVUrls();

    // ── 1. Exclusive keywords — all results are Chinese, no validation ────────
    const exclusiveResults = await Promise.all(
      EXCLUSIVE_KEYWORDS.map((kw) => searchKeyword(SEARCH, kw, 3))
    );
    const exclusiveAnimes = dedupe(exclusiveResults.flat());

    // ── 2. Mixed keywords — collect candidates, then studio-validate ──────────
    const mixedResults = await Promise.all(
      MIXED_KEYWORDS.map((kw) => searchKeyword(SEARCH, kw, 2))
    );
    // Remove any already captured by exclusive pass
    const exclusiveIds = new Set(exclusiveAnimes.map((a) => a.id));
    const mixedCandidates = dedupe(
      mixedResults.flat().filter((a) => {
        const id = (a.id || "").split("?")[0];
        return !exclusiveIds.has(id);
      })
    );

    // Batch-fetch studio origin for mixed candidates (8 at a time)
    const origins = await batchAll(mixedCandidates, 8, (anime) =>
      fetchStudioOrigin(anime.id, BASE)
    );

    const mixedConfirmed = mixedCandidates.filter(
      (_, i) => origins[i] === "China"
    );

    // ── 3. Merge, dedupe once more ────────────────────────────────────────────
    cachedAnimes = dedupe([...exclusiveAnimes, ...mixedConfirmed]);
    cacheTime = now;

    console.log(
      `[donghua] cache built: ${exclusiveAnimes.length} exclusive + ${mixedConfirmed.length} mixed = ${cachedAnimes.length} total`
    );
  }

  const totalPages = Math.max(1, Math.ceil(cachedAnimes.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;

  return {
    animes: cachedAnimes.slice(start, start + PAGE_SIZE),
    currentPage: safePage,
    totalPages,
    hasNextPage: safePage < totalPages,
  };
}
