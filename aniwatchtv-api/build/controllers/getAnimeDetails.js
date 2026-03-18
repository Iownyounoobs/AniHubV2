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
exports.getAnimeDetails = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const scrapeAnimeDetails_1 = require("../scrapers/scrapeAnimeDetails");
/**
 * Handles GET /aniwatchtv/anime/:id
 * Ex: This controller runs when someone visits /aniwatch/anime/jujutsu-kaisen-2nd-season-18413
 * It fetches detailed anime info using the ID from the URL.
 */
const getAnimeDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const animeId = (_a = req.params.id) === null || _a === void 0 ? void 0 : _a.trim(); // Remove leading/trailing spaces
        // Check Missing or empty
        if (!animeId) {
            throw http_errors_1.default.BadRequest("Anime ID is required.");
        }
        // Check Must match full valid format — lowercase, dashes, ends in number
        if (!/^[a-z0-9]+(-[a-z0-9]+)*-\d+$/.test(animeId)) {
            throw http_errors_1.default.BadRequest("Invalid Anime ID format. Must be lowercase, use dashes, and end with a numeric ID.");
        }
        // ex scrapeAnimeDetails("jujutsu-kaisen-2nd-season-18413");
        const data = yield (0, scrapeAnimeDetails_1.scrapeAnimeDetails)(animeId);
        res.status(200).json(data);
    }
    catch (err) {
        console.error("Error in getAnimeDetails:", err);
        if (http_errors_1.default.isHttpError(err)) {
            res.status(err.status).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: "Failed to fetch anime details." });
        }
    }
});
exports.getAnimeDetails = getAnimeDetails;
