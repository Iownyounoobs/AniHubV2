import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import type { Browser, Page } from "puppeteer";

puppeteer.use(StealthPlugin());

let browser: Browser | null = null;

const LAUNCH_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--ignore-certificate-errors",
];

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

const getBrowser = async (): Promise<Browser> => {
  if (browser && browser.connected) return browser;
  const b = await (puppeteer as any).launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: LAUNCH_ARGS,
  }) as Browser;
  b.on("disconnected", () => { browser = null; });
  browser = b;
  return b;
};

export const fetchHtml = async (url: string, referer?: string): Promise<string> => {
  const b = await getBrowser();
  let page: Page | null = null;
  try {
    page = await b.newPage();
    await page.setUserAgent(UA);
    if (referer) {
      await page.setExtraHTTPHeaders({ Referer: referer });
    }
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    // Wait a moment for any JS rendering after DOMContentLoaded
    await new Promise((r) => setTimeout(r, 1500));
    return await page.content();
  } finally {
    if (page) await page.close().catch(() => {});
  }
};
