import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

export async function extractM3U8WithPuppeteer(embedUrl: string): Promise<string | null> {
  let browser: any = null;
  try {
    console.log("Puppeteer: launching for", embedUrl);
    browser = await (puppeteer as any).launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--ignore-certificate-errors",
        "--autoplay-policy=no-user-gesture-required",
        "--disable-web-security",
      ],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    );

    await page.setExtraHTTPHeaders({
      Referer: "https://aniwatchtv.to/",
      Origin: "https://aniwatchtv.to",
    });

    let m3u8Url: string | null = null;

    // Intercept ALL requests to catch m3u8
    await page.setRequestInterception(true);
    page.on("request", (req: any) => {
      const url: string = req.url();
      if (!m3u8Url && url.includes(".m3u8")) {
        m3u8Url = url;
        console.log("Puppeteer: intercepted m3u8:", url);
      }
      req.continue();
    });

    // Navigate from aniwatchtv.to first so document.referrer is set correctly
    // The player script checks document.referrer to validate the embedding site
    await page.goto("https://aniwatchtv.to/", { waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {});
    await page.goto(embedUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Wait for JWPlayer script to finish executing
    await page.waitForFunction(
      () => typeof (window as any).jwplayer !== "undefined",
      { timeout: 15000 }
    ).catch(() => console.log("Puppeteer: jwplayer not found"));

    // Give it a moment to set up
    await new Promise((r) => setTimeout(r, 1000));

    // Force play via JWPlayer API — this triggers the getSources API call
    await page.evaluate(() => {
      try {
        const jw = (window as any).jwplayer;
        if (jw && jw()) {
          jw().play();
        }
      } catch (e) {}
    }).catch(() => {});

    // Also try clicking the play button
    await page.evaluate(() => {
      const el =
        document.querySelector(".jw-display-icon-container") ||
        document.querySelector(".jw-icon-display") ||
        document.querySelector("video");
      if (el) (el as HTMLElement).click();
    }).catch(() => {});

    // Wait for the m3u8 to be requested (up to 20 seconds)
    for (let i = 0; i < 20; i++) {
      if (m3u8Url) break;
      await new Promise((r) => setTimeout(r, 1000));

      // Every 5 seconds, try to poke the player again
      if (i % 5 === 4) {
        await page.evaluate(() => {
          try { (window as any).jwplayer()?.play(); } catch (e) {}
        }).catch(() => {});
      }
    }

    // If still no m3u8, try reading it from JWPlayer's playlist
    if (!m3u8Url) {
      m3u8Url = await page.evaluate(() => {
        try {
          const jw = (window as any).jwplayer;
          if (!jw || !jw()) return null;
          const item = jw().getPlaylistItem();
          return (
            item?.file ||
            item?.sources?.[0]?.file ||
            null
          );
        } catch (e) {
          return null;
        }
      }).catch(() => null);

      if (m3u8Url) console.log("Puppeteer: got URL from JWPlayer playlist:", m3u8Url);
    }

    // Last resort: read from video element
    if (!m3u8Url) {
      m3u8Url = await page.evaluate(() => {
        const video = document.querySelector("video");
        return video?.src || video?.currentSrc || null;
      }).catch(() => null);

      if (m3u8Url) console.log("Puppeteer: got URL from video element:", m3u8Url);
    }

    console.log("Puppeteer: final result:", m3u8Url);
    return m3u8Url;
  } catch (err) {
    console.error("Puppeteer extraction error:", err);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}
