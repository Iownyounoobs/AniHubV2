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
exports.scrapeHomePage = void 0;
const axios_1 = __importStar(require("axios"));
const cheerio_1 = require("cheerio");
const http_errors_1 = __importDefault(require("http-errors"));
const headers_1 = require("../config/headers");
const extractors_1 = require("../extractors");
const aniwatchtvRoutes_1 = require("../utils/aniwatchtvRoutes");
const scrapeHomePage = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const result = {
        spotLightAnimes: [],
        trendingAnimes: [],
        latestEpisodes: [],
        top10Animes: {
            day: [],
            week: [],
            month: [],
        },
        featuredAnimes: {
            topAiringAnimes: [],
            mostPopularAnimes: [],
            mostFavoriteAnimes: [],
            latestCompletedAnimes: [],
        },
        topUpcomingAnimes: [],
        genres: [],
    };
    const URLs = yield (0, aniwatchtvRoutes_1.getAniWatchTVUrls)();
    try {
        const mainPage = yield axios_1.default.get(URLs.HOME, {
            headers: {
                "User-Agent": headers_1.headers.USER_AGENT_HEADER,
                Accept: headers_1.headers.ACCEPT_HEADER,
                "Accept-Encoding": headers_1.headers.ACCEPT_ENCODEING_HEADER,
            },
        });
        const $ = (0, cheerio_1.load)(mainPage.data);
        const trendingAnimeSelectors = "#anime-trending #trending-home .swiper-wrapper .swiper-slide";
        const latestEpisodesSelectors = "#main-content .block_area_home:nth-of-type(1) .tab-content .film_list-wrap .flw-item";
        const topAiringSelectors = "#anime-featured .row div:nth-of-type(1) .anif-block-ul ul li";
        const mostPopularSelectors = "#anime-featured .row div:nth-of-type(2) .anif-block-ul ul li";
        const mostFavoriteSelectors = "#anime-featured .row div:nth-of-type(3) .anif-block-ul ul li";
        const latestCompletedSelectors = "#anime-featured .row div:nth-of-type(4) .anif-block-ul ul li";
        const topUpcomingSelectors = "#main-content .block_area_home:nth-of-type(3) .tab-content .film_list-wrap .flw-item";
        const spotLightSelectors = "#slider .swiper-wrapper .swiper-slide";
        const genresSelectors = "#main-sidebar .block_area.block_area_sidebar.block_area-genres .sb-genre-list li";
        const top10Selectors = '#main-sidebar .block_area-realtime [id^="top-viewed-"]';
        result.trendingAnimes = (0, extractors_1.extractTrendingAnimes)($, trendingAnimeSelectors);
        result.latestEpisodes = (0, extractors_1.extractLatestEpisodes)($, latestEpisodesSelectors);
        result.featuredAnimes.topAiringAnimes = (0, extractors_1.extractFeaturedAnimes)($, topAiringSelectors);
        result.featuredAnimes.mostPopularAnimes = (0, extractors_1.extractFeaturedAnimes)($, mostPopularSelectors);
        result.featuredAnimes.mostFavoriteAnimes = (0, extractors_1.extractFeaturedAnimes)($, mostFavoriteSelectors);
        result.featuredAnimes.latestCompletedAnimes = (0, extractors_1.extractFeaturedAnimes)($, latestCompletedSelectors);
        result.topUpcomingAnimes = (0, extractors_1.extractTopUpcomingAnimes)($, topUpcomingSelectors);
        result.spotLightAnimes = (0, extractors_1.extractSpotlightAnimes)($, spotLightSelectors);
        result.genres = (0, extractors_1.extractGenreList)($, genresSelectors);
        $(top10Selectors).each((_i, el) => {
            var _a, _b;
            const type = (_b = (_a = $(el).attr("id")) === null || _a === void 0 ? void 0 : _a.split("-").pop()) === null || _b === void 0 ? void 0 : _b.trim();
            if (["day", "week", "month"].includes(type)) {
                result.top10Animes[type] = (0, extractors_1.extractTop10Animes)($, type);
            }
        });
        return result;
    }
    catch (err) {
        console.error("Error in scrapeHomePage:", err);
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        else {
            throw http_errors_1.default.InternalServerError("Internal server error");
        }
    }
});
exports.scrapeHomePage = scrapeHomePage;
