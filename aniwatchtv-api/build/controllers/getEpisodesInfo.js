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
exports.getEpisodesInfo = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const scrapers_1 = require("../scrapers");
/**
 * GET /aniwatchtv/anime/:id/episodes
 * fetch all episodes for a specific anime
 */
const getEpisodesInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract anime ID from route parameter and decode URI
        const anime_id = req.params.id ? decodeURIComponent(req.params.id) : null;
        if (!anime_id) {
            throw http_errors_1.default.BadRequest("Anime Id Required");
        }
        // call scraper to fetch all episodes for the anime
        const data = yield (0, scrapers_1.scrapeAnimeEpisodes)(anime_id);
        res.status(200).json(data);
    }
    catch (err) {
        console.error("Error in getEpisodesInfo:", err);
        res.status(500).json({ error: "Failed to fetch episode info" });
    }
});
exports.getEpisodesInfo = getEpisodesInfo;
