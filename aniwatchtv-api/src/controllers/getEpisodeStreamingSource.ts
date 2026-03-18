import type { RequestHandler } from "express";
import axios from "axios";
import { load, type CheerioAPI } from "cheerio";
import createHttpError from "http-errors";
import { scrapeStreamingSourceFromMegaCloud } from "../scrapers/scrapeStreamingSourceFromMegaCloud";
import { getAniWatchTVUrls } from "../utils/aniwatchtvRoutes";
import { headers } from "../config/headers"; 

type AnilistID = number | null;
type MalID = number | null;

/**
 * GET /aniwatchtv/episode/source?id=...&category=sub
 * Fetches the video streaming sources from MegaCloud for a specific episode,
 * and extracts associated anime metadata including AniList and MyAnimeList (MAL) IDs
 * by parsing the main anime page.
*/

const getEpisodeStreamingSourceInfo: RequestHandler = async (req, res) => {
  try {
    // Get the episode ID from query parameters, decode if URL-encoded
    // and the category (sub, dub, raw) from query parameters, default to "sub"
    const episodeId = req.query.id
      ? decodeURIComponent(req.query.id as string)
      : null;

    const category = (req.query.category
      ? decodeURIComponent(req.query.category as string)
      : "sub") as "sub" | "dub" | "raw";

    if (!episodeId) {
      throw createHttpError.BadRequest("Episode ID is required");
    }

    const aniwatchUrls = await getAniWatchTVUrls();

    // Get stream info from MegaCloud for this episode (non-fatal)
    let streamingData: any = { sources: [], subtitles: [] };
    try {
      streamingData = await scrapeStreamingSourceFromMegaCloud(episodeId, category);
    } catch (streamErr: any) {
      console.warn("MegaCloud unavailable, returning metadata only:", streamErr.message);
    }

    // To fetch AniList and MAL IDs, we need to parse the parent anime page
    // These IDs let us connect this anime to official external APIs like AniList or MAL
    // Useful for pulling more data like synopsis, ratings, characters, etc.

    // Get the base anime page URL (without ?ep= query)
    const animePageUrl = new URL(episodeId.split("?ep=")[0], aniwatchUrls.BASE).href;
    // Fetch the anime page HTML
    // Use the same headers as the streaming source request to avoid CORS issues
    const animePage = await axios.get(animePageUrl, {
      headers: {
        ...headers, 
        Referer: aniwatchUrls.BASE,
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    // load the HTML into Cheerio for parsing
    // CheerioAPI is a type from the cheerio library that represents the loaded HTML document
    const $: CheerioAPI = load(animePage.data);
    // Extract the streaming data from the HTML using Cheerio
    // The data is stored in a script tag with the ID "syncData"
    // This data contains the AniList and MAL IDs in JSON format
    const syncDataText = $("#syncData").text();

    // default to null if parsing fails
    // This is a fallback in case the syncDataText is not valid JSON ahhh very smart 
    let malID: MalID = null;
    let anilistID: AnilistID = null;

    try {
      const syncData = JSON.parse(syncDataText);
      malID = Number(syncData?.mal_id) || null;
      anilistID = Number(syncData?.anilist_id) || null;
    } catch {
      // fallback to null
    }
    // Log the IDs for debugging purposes
    console.log("AniList ID:", anilistID, "MAL ID:", malID);
    
    // Return the streaming data along with the extracted IDs
    // This allows the client to access both the streaming sources and the anime metadata in one response
    res.status(200).json({
      ...streamingData,
      anilistID,
      malID,
    });
  } catch (err) {
    console.error("Error in getEpisodeStreamingSourceInfo:", err);
    res.status(500).json({ error: "Failed to fetch episode source data" });
  }
};

export { getEpisodeStreamingSourceInfo };
