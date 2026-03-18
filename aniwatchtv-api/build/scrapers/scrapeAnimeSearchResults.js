"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.scrapeAnimeSearchResults = void 0;
const axios_1 = __importStar(require("axios"));
const cheerio_1 = require("cheerio");
const http_errors_1 = __importDefault(require("http-errors"));
const aniwatchtvRoutes_1 = require("../utils/aniwatchtvRoutes");
const headers_1 = require("../config/headers");
const extractors_1 = require("../extractors");
/**
 * Scrapes search results from AniWatchTV by keyword and page number.
 */
const scrapeAnimeSearchResults = (query, page) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const result = {
        animes: [],
        mostPopularAnimes: [],
        currentPage: page,
        hasNextPage: false,
        totalPages: 1,
        genres: [],
    };
    try {
        const { SEARCH } = yield (0, aniwatchtvRoutes_1.getAniWatchTVUrls)();
        const response = yield axios_1.default.get(`${SEARCH}?keyword=${query}&page=${page}`, {
            headers: headers_1.headers,
        });
        const $ = (0, cheerio_1.load)(response.data);
        const animeSelector = "#main-content .tab-content .film_list-wrap .flw-item";
        const popularSelector = "#main-sidebar .block_area.block_area_sidebar.block_area-realtime .anif-block-ul ul li";
        const genreSelector = "#main-sidebar .block_area.block_area_sidebar.block_area-genres .sb-genre-list li";
        // Clean and deduplicate animes
        const rawAnimes = (0, extractors_1.extractSearchedAnimes)($, animeSelector);
        const seen = new Set();
        result.animes = rawAnimes.filter((anime) => {
            if (!anime.id)
                return false;
            anime.id = anime.id.split("?")[0];
            if (seen.has(anime.id))
                return false;
            seen.add(anime.id);
            return true;
        });
        if (page === 1) {
            result.mostPopularAnimes = (0, extractors_1.extractMostPopularAnimes)($, popularSelector);
        }
        result.genres = (0, extractors_1.extractGenreList)($, genreSelector);
        const totalPages = (_b = (_a = $('.pagination > .page-item a[title="Last"]')) === null || _a === void 0 ? void 0 : _a.attr("href")) === null || _b === void 0 ? void 0 : _b.split("=").pop();
        const fallbackPages = (_d = (_c = $('.pagination > .page-item a[title="Next"]')) === null || _c === void 0 ? void 0 : _c.attr("href")) === null || _d === void 0 ? void 0 : _d.split("=").pop();
        const currentPageText = (_f = (_e = $(".pagination > .page-item.active a")) === null || _e === void 0 ? void 0 : _e.text()) === null || _f === void 0 ? void 0 : _f.trim();
        result.totalPages =
            Number((_g = totalPages !== null && totalPages !== void 0 ? totalPages : fallbackPages) !== null && _g !== void 0 ? _g : currentPageText) || 1;
        result.hasNextPage =
            $(".pagination li.active").length > 0 &&
                !$(".pagination li").last().hasClass("active");
        if (!result.hasNextPage && result.animes.length === 0) {
            result.totalPages = 0;
        }
        return result;
    }
    catch (err) {
        console.error("Error in scrapeAnimeSearchResults:", err);
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_h = err === null || err === void 0 ? void 0 : err.response) === null || _h === void 0 ? void 0 : _h.status) || 500, ((_j = err === null || err === void 0 ? void 0 : err.response) === null || _j === void 0 ? void 0 : _j.statusText) || "Something went wrong");
        }
        throw http_errors_1.default.InternalServerError("Internal server error");
    }
});
exports.scrapeAnimeSearchResults = scrapeAnimeSearchResults;
