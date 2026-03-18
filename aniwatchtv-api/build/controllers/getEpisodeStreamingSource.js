"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEpisodeStreamingSourceInfo = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = require("cheerio");
const http_errors_1 = __importDefault(require("http-errors"));
const scrapeStreamingSourceFromMegaCloud_1 = require("../scrapers/scrapeStreamingSourceFromMegaCloud");
const aniwatchtvRoutes_1 = require("../utils/aniwatchtvRoutes");
const headers_1 = require("../config/headers");
/**
 * GET /aniwatchtv/episode/source?id=...&category=sub
 * Fetches the video streaming sources from MegaCloud for a specific episode,
 * and extracts associated anime metadata including AniList and MyAnimeList (MAL) IDs
 * by parsing the main anime page.
*/
const getEpisodeStreamingSourceInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the episode ID from query parameters, decode if URL-encoded
        // and the category (sub, dub, raw) from query parameters, default to "sub"
        const episodeId = req.query.id
            ? decodeURIComponent(req.query.id)
            : null;
        const category = (req.query.category
            ? decodeURIComponent(req.query.category)
            : "sub");
        if (!episodeId) {
            throw http_errors_1.default.BadRequest("Episode ID is required");
        }
        const aniwatchUrls = yield (0, aniwatchtvRoutes_1.getAniWatchTVUrls)();
        // Get stream info from MegaCloud for this episode (non-fatal)
        let streamingData = { sources: [], subtitles: [] };
        try {
            streamingData = yield (0, scrapeStreamingSourceFromMegaCloud_1.scrapeStreamingSourceFromMegaCloud)(episodeId, category);
        }
        catch (streamErr) {
            console.warn("MegaCloud unavailable, returning metadata only:", streamErr.message);
        }
        // To fetch AniList and MAL IDs, we need to parse the parent anime page
        // These IDs let us connect this anime to official external APIs like AniList or MAL
        // Useful for pulling more data like synopsis, ratings, characters, etc.
        // Get the base anime page URL (without ?ep= query)
        const animePageUrl = new URL(episodeId.split("?ep=")[0], aniwatchUrls.BASE).href;
        // Fetch the anime page HTML
        // Use the same headers as the streaming source request to avoid CORS issues
        const animePage = yield axios_1.default.get(animePageUrl, {
            headers: Object.assign(Object.assign({}, headers_1.headers), { Referer: aniwatchUrls.BASE, "X-Requested-With": "XMLHttpRequest" }),
        });
        // load the HTML into Cheerio for parsing
        // CheerioAPI is a type from the cheerio library that represents the loaded HTML document
        const $ = (0, cheerio_1.load)(animePage.data);
        // Extract the streaming data from the HTML using Cheerio
        // The data is stored in a script tag with the ID "syncData"
        // This data contains the AniList and MAL IDs in JSON format
        const syncDataText = $("#syncData").text();
        // default to null if parsing fails
        // This is a fallback in case the syncDataText is not valid JSON ahhh very smart 
        let malID = null;
        let anilistID = null;
        try {
            const syncData = JSON.parse(syncDataText);
            malID = Number(syncData === null || syncData === void 0 ? void 0 : syncData.mal_id) || null;
            anilistID = Number(syncData === null || syncData === void 0 ? void 0 : syncData.anilist_id) || null;
        }
        catch (_a) {
            // fallback to null
        }
        // Log the IDs for debugging purposes
        console.log("AniList ID:", anilistID, "MAL ID:", malID);
        // Return the streaming data along with the extracted IDs
        // This allows the client to access both the streaming sources and the anime metadata in one response
        res.status(200).json(Object.assign(Object.assign({}, streamingData), { anilistID,
            malID }));
    }
    catch (err) {
        console.error("Error in getEpisodeStreamingSourceInfo:", err);
        res.status(500).json({ error: "Failed to fetch episode source data" });
    }
});
exports.getEpisodeStreamingSourceInfo = getEpisodeStreamingSourceInfo;
