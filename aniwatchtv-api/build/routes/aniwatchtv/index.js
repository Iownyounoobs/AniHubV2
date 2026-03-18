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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../../controllers");
const m3u8Proxy_1 = require("../../utils/m3u8Proxy");
const imgProxy_1 = require("../../utils/imgProxy");
const scrapeAnimeCategories_1 = require("../../scrapers/scrapeAnimeCategories");
const scrapeChineseDonghua_1 = require("../../scrapers/scrapeChineseDonghua");
// create a new router just for /aniwatchtv so it’s cleaner
const aniwatchRouter = (0, express_1.Router)();
/**
 * This router handles everything under /aniwatchtv.
 * By the time a request reaches here, the base path "/aniwatchtv" is already removed.
 * For example:
 * - A request to GET /aniwatchtv/search will match .get("/search")
 * - A request to GET /aniwatchtv/anime/123 will match .get("/anime/:id")
 * Each route here is connected to a controller function that handles the logic and response.
 */
aniwatchRouter.get("/", controllers_1.getHomePageInfo);
aniwatchRouter.get("/az-list", controllers_1.getAtoZAnimeList);
aniwatchRouter.get("/search", controllers_1.getSearchPageInfo);
aniwatchRouter.get("/anime/:id", controllers_1.getAnimeDetails);
aniwatchRouter.get("/episodes/:id", controllers_1.getEpisodesInfo);
aniwatchRouter.get("/servers", controllers_1.getEpisodeServersInfo);
aniwatchRouter.get("/episode-srcs", controllers_1.getEpisodeStreamingSourceInfo);
aniwatchRouter.get("/latest", controllers_1.getLatestEpisodes);
aniwatchRouter.get("/proxy", m3u8Proxy_1.m3u8ProxyHandler);
aniwatchRouter.get("/img", imgProxy_1.imgProxyHandler);
// Chinese donghua — studio-filtered list
aniwatchRouter.get("/donghua", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = req.query.page ? Number(req.query.page) : 1;
        const data = yield (0, scrapeChineseDonghua_1.scrapeChineseDonghua)(page);
        res.status(200).json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch Chinese donghua" });
    }
}));
// Genre pages like /genre/action
aniwatchRouter.get("/genre/:genre", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = `genre/${req.params.genre.toLowerCase()}`;
        const page = req.query.page ? Number(req.query.page) : 1;
        const data = yield (0, scrapeAnimeCategories_1.scrapeAnimeCategories)(category, page);
        res.status(200).json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch genre" });
    }
}));
// Two-segment category paths like /subtype/chinese
aniwatchRouter.get("/subtype/:subtype", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = `subtype/${req.params.subtype}`;
        const page = req.query.page ? Number(req.query.page) : 1;
        const data = yield (0, scrapeAnimeCategories_1.scrapeAnimeCategories)(category, page);
        res.status(200).json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch subtype category" });
    }
}));
aniwatchRouter.get("/:category", controllers_1.getCategoryPageInfo);
exports.default = aniwatchRouter;
