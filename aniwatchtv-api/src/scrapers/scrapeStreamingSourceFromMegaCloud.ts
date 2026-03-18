import { getAniWatchTVUrls } from "../utils/aniwatchtvRoutes";
import { headers } from "../config/headers";
import axios, { AxiosError } from "axios";
import { load, type CheerioAPI } from "cheerio";
import createHttpError, { type HttpError } from "http-errors";
import { extractServerId } from "../extractors";
import MegaCloud from "../utils/megacloud";
import { extractM3U8WithPuppeteer } from "../utils/puppeteerExtractor";
import { type ScrapedAnimeEpisodesSources } from "../types/animeTypes";

export const scrapeStreamingSourceFromMegaCloud = async (
  episodeIdOrUrl: string,
  category: "sub" | "dub" | "raw" = "sub"
): Promise<ScrapedAnimeEpisodesSources | HttpError> => {
  const aniwatchUrls = await getAniWatchTVUrls();

  // If it's a direct link, resolve using MegaCloud and return
  if (episodeIdOrUrl.startsWith("http")) {
    const directUrl = new URL(episodeIdOrUrl);
    return await new MegaCloud().extract2(directUrl);
  }

  const episodeWatchUrl = new URL(`/watch/${episodeIdOrUrl}`, aniwatchUrls.BASE).href;
  console.log("Episode Page URL:", episodeWatchUrl);

  try {
    // Step 1: Get episode servers HTML
    const episodeId = episodeWatchUrl.split("?ep=")[1];
    const { data } = await axios.get(
      `${aniwatchUrls.AJAX}/v2/episode/servers?episodeId=${episodeId}`,
      {
        headers: {
          ...headers, 
          Referer: episodeWatchUrl,
          "X-Requested-With": "XMLHttpRequest",
        },
      }
    );

    const $: CheerioAPI = load(data.html);

    // Step 2: Extract server ID
    const serverId = extractServerId($, 1, category);
    if (!serverId) {
      throw createHttpError.NotFound("Couldn't find streaming server for this episode.");
    }

    console.log("Server ID:", serverId);

    // Step 3: Get streaming URL using the server ID
    const {
      data: { link: streamingUrl },
    } = await axios.get(`${aniwatchUrls.AJAX}/v2/episode/sources?id=${serverId}`);

    console.log("Streaming Link:", streamingUrl);

    // Try axios-based extraction first, then WASM, then Puppeteer interception
    let extracted: any = { sources: [], subtitles: [] };
    let needsPuppeteer = false;

    try {
      extracted = await new MegaCloud().extract(new URL(streamingUrl));
      if (!extracted?.sources?.length) needsPuppeteer = true;
    } catch (extractErr) {
      console.warn("MegaCloud extract failed, trying extract2:", (extractErr as any)?.message);
      needsPuppeteer = true;
    }

    if (needsPuppeteer) {
      needsPuppeteer = false;
      try {
        extracted = await new MegaCloud().extract2(new URL(streamingUrl));
        if (!extracted?.sources?.length) needsPuppeteer = true;
      } catch (megaErr) {
        console.warn("MegaCloud extract2 threw:", (megaErr as any)?.message);
        needsPuppeteer = true;
      }
    }

    if (needsPuppeteer) {
      console.log("Both MegaCloud methods failed — returning embedUrl fallback");
    }

    return { ...extracted, embedUrl: streamingUrl };
  } catch (err: any) {
    console.error("Error in scrapeStreamingSourceFromMegaCloud:", err);

    if (err instanceof AxiosError) {
      throw createHttpError(
        err.response?.status || 500,
        err.response?.statusText || "Something went wrong while fetching sources"
      );
    } else {
      throw createHttpError.InternalServerError("Internal server error");
    }
  }
};
