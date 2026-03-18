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
exports.getSearchPageInfo = void 0;
const scrapers_1 = require("../scrapers");
const http_errors_1 = __importDefault(require("http-errors"));
/**
 * GET /aniwatchtv/search?keyword=naruto&page=1
 *
 * Scrapes and returns anime search results from AniWatchTV.
 * Accepts:
 * - `keyword`: the search term (required)
 * - `page`: optional, defaults to 1
 */
const getSearchPageInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract search keyword and page number from query parameters
        // Decode URI to handle any special characters in the keyword and page number
        const page = req.query.page
            ? Number(decodeURIComponent(req.query.page))
            : 1;
        // Decode the keyword from the query parameter
        // If the keyword is not provided, throw a BadRequest error
        const keyword = req.query.keyword
            ? decodeURIComponent(req.query.keyword)
            : null;
        if (!keyword) {
            throw http_errors_1.default.BadRequest("Search keyword required");
        }
        // Call the scraper to fetch search results based on the keyword and page number
        // The scraper function should handle the logic of scraping the search results
        const data = yield (0, scrapers_1.scrapeAnimeSearchResults)(keyword, page);
        // debugging log to see the structure of the data returned
        // log how many results were scraped
        if ("results" in data && Array.isArray(data.results)) {
            if (data.results.length === 0) {
                console.log(`No anime found for "${keyword}"`);
            }
            else {
                console.log(`Found ${data.results.length} results for "${keyword}"`);
            }
        }
        res.status(200).json(data);
    }
    catch (err) {
        console.error("Error in getSearchPageInfo:", err);
        res.status(500).json({ error: "Failed to fetch search results" });
    }
});
exports.getSearchPageInfo = getSearchPageInfo;
