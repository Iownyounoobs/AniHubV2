import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import type { Browser } from "puppeteer";

puppeteer.use(StealthPlugin());

const LAUNCH_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--ignore-certificate-errors",
];

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

const MAX_CONCURRENT = 2;
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

// --- browser singleton with launch lock ---
let browser: Browser | null = null;
let launchPromise: Promise<Browser> | null = null;

const getBrowser = async (): Promise<Browser> => {
  if (browser && browser.connected) return browser;
  if (launchPromise) return launchPromise;
  launchPromise = (async () => {
    const b = await (puppeteer as any).launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args: LAUNCH_ARGS,
    }) as Browser;
    b.on("disconnected", () => { browser = null; launchPromise = null; });
    browser = b;
    return b;
  })();
  return launchPromise;
};

// --- concurrency semaphore ---
let active = 0;
const waitQueue: Array<() => void> = [];

const acquire = (): Promise<void> =>
  new Promise((resolve) => {
    if (active < MAX_CONCURRENT) { active++; resolve(); }
    else waitQueue.push(resolve);
  });

const release = () => {
  const next = waitQueue.shift();
  if (next) { next(); }
  else { active--; }
};

// --- response cache ---
const cache = new Map<string, { html: string; expiry: number }>();

export const fetchHtml = async (url: string, referer?: string): Promise<string> => {
  const cached = cache.get(url);
  if (cached && Date.now() < cached.expiry) return cached.html;

  await acquire();
  let page = null;
  try {
    const b = await getBrowser();
    page = await b.newPage();
    await page.setUserAgent(UA);
    if (referer) await page.setExtraHTTPHeaders({ Referer: referer });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));
    const html = await page.content();
    cache.set(url, { html, expiry: Date.now() + CACHE_TTL_MS });
    return html;
  } finally {
    if (page) await page.close().catch(() => {});
    release();
  }
};
