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
exports.getEpisodeServersInfo = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const scrapers_1 = require("../scrapers"); // Import from index.ts
/**
 * GET /aniwatchtv/episode/servers
 * Retrieves available streaming servers for a specific episode
 */
const getEpisodeServersInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the episode ID from query parameters, decode if URL-encoded
        const episodeId = req.query.id
            ? decodeURIComponent(req.query.id)
            : null;
        if (!episodeId) {
            throw http_errors_1.default.BadRequest("Episode ID is required"); // 404 if no episode provided
        }
        // Call scraper to fetch all available server options for the episode but only scrape megacloud servers as I removed the other sources
        const serverData = yield (0, scrapers_1.scrapeEpisodeServerList)(episodeId);
        res.status(200).json(serverData);
    }
    catch (err) {
        console.error("Error in getEpisodeServersInfo:", err);
        res.status(500).json({ error: "Failed to fetch episode server data" });
    }
});
exports.getEpisodeServersInfo = getEpisodeServersInfo;
