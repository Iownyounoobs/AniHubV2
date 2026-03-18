"use strict";
/**
 * This script scrapes all anime data from AniWatch's A-Z pages,
 * fetches detailed info (like description, rating, origin),
 * and writes a JSON file to disk.
 */
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
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const scrapeAtoZAnimeList_1 = require("./scrapeAtoZAnimeList");
const scrapeAnimeDetails_1 = require("./scrapeAnimeDetails");
const detectCountry_1 = require("../utils/detectCountry");
const runBackgroundScraper = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    const maxPages = 100;
    const allAnimes = [];
    for (let page = 1; page <= maxPages; page++) {
        console.log(`Fetching A-Z page ${page}...`);
        const animes = yield (0, scrapeAtoZAnimeList_1.scrapeAtoZAnimeList)(page);
        if (!Array.isArray(animes) || animes.length === 0) {
            console.log("No more animes found. Stopping.");
            break;
        }
        for (const anime of animes) {
            if (!anime.id) {
                console.warn("Skipping anime with null ID.");
                continue;
            }
            try {
                const about = yield (0, scrapeAnimeDetails_1.scrapeAnimeDetails)(anime.id);
                if ("info" in about) {
                    const studiosRaw = about.moreInfo["Studios:"];
                    const studios = typeof studiosRaw === "string"
                        ? studiosRaw.split(",").map((s) => s.trim())
                        : [];
                    const origin = (0, detectCountry_1.detectCountry)(studios);
                    allAnimes.push({
                        id: anime.id,
                        name: (_a = about.info.name) !== null && _a !== void 0 ? _a : "Unknown Anime",
                        img: (_c = (_b = about.info.img) !== null && _b !== void 0 ? _b : anime.img) !== null && _c !== void 0 ? _c : undefined,
                        description: (_d = about.info.description) !== null && _d !== void 0 ? _d : undefined,
                        rating: (_e = about.info.rating) !== null && _e !== void 0 ? _e : undefined,
                        category: (_f = about.info.category) !== null && _f !== void 0 ? _f : undefined,
                        eps: (_h = (_g = about.info.episodes) === null || _g === void 0 ? void 0 : _g.eps) !== null && _h !== void 0 ? _h : null,
                        sub: (_k = (_j = about.info.episodes) === null || _j === void 0 ? void 0 : _j.sub) !== null && _k !== void 0 ? _k : null,
                        dub: (_m = (_l = about.info.episodes) === null || _l === void 0 ? void 0 : _l.dub) !== null && _m !== void 0 ? _m : null,
                        origin,
                    });
                    console.log(`Scraped: ${(_o = about.info.name) !== null && _o !== void 0 ? _o : anime.id} (${origin})`);
                }
            }
            catch (err) {
                console.error(`Failed scraping ${anime.name || anime.id}:`, err);
            }
        }
    }
    const outputPath = path_1.default.join(__dirname, "anime-origin-data.json");
    yield promises_1.default.writeFile(outputPath, JSON.stringify(allAnimes, null, 2), "utf-8");
    console.log(`🎉 Done! Saved ${allAnimes.length} anime entries to ${outputPath}`);
});
runBackgroundScraper();
