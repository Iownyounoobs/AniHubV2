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
exports.scrapeAnimeCategories = void 0;
const axios_1 = __importStar(require("axios"));
const cheerio_1 = require("cheerio");
const http_errors_1 = __importDefault(require("http-errors"));
const aniwatchtvRoutes_1 = require("../utils/aniwatchtvRoutes");
const headers_1 = require("../config/headers");
const extractors_1 = require("../extractors");
const scrapeAnimeCategories = (category, page) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const result = {
        animes: [],
        top10Animes: {
            day: [],
            week: [],
            month: [],
        },
        category,
        genres: [],
        currentPage: Number(page),
        hasNextPage: false,
        totalPages: 1,
    };
    try {
        const { BASE } = yield (0, aniwatchtvRoutes_1.getAniWatchTVUrls)();
        const isFirstPage = page === 1;
        const fixedCategory = category === "latest" ? "recently-updated" : category;
        const url = isFirstPage
            ? `${BASE}/${fixedCategory}`
            : `${BASE}/${fixedCategory}?page=${page}`;
        console.log(`Fetching URL: ${url}`);
        const response = yield axios_1.default.get(url, {
            headers: headers_1.headers,
        });
        // Debugging the raw HTML response
        console.log("HTML Preview:", response.data.slice(0, 500));
        const $ = (0, cheerio_1.load)(response.data);
        const animeSelector = category === "latest"
            ? ".film_list-wrap .flw-item"
            : "#main-content .tab-content .film_list-wrap .flw-item";
        console.log("Found anime count:", $(animeSelector).length); // This will show how many anime items are found by the selector
        const categorySelector = "#main-content .block_area .block_area-header .cat-heading";
        const top10Selector = '#main-sidebar .block_area-realtime [id^="top-viewed-"]';
        const genreSelector = "#main-sidebar .block_area.block_area_sidebar.block_area-genres .sb-genre-list li";
        result.category = ((_b = (_a = $(categorySelector)) === null || _a === void 0 ? void 0 : _a.text()) === null || _b === void 0 ? void 0 : _b.trim()) || category;
        result.animes = (0, extractors_1.extractCategoryAnimes)($, animeSelector);
        console.log("Extracted Animes:", result.animes); // Log the animes extracted
        result.genres = (0, extractors_1.extractGenreList)($, genreSelector);
        const $pagination = $(".pagination > li");
        if ($pagination.length > 0) {
            const isLastActive = $(".pagination > li").last().hasClass("active");
            result.hasNextPage = !isLastActive;
            const lastPageNumber = (_h = (_e = (_d = (_c = $('.pagination > .page-item a[title="Last"]').attr("href")) === null || _c === void 0 ? void 0 : _c.split("=")) === null || _d === void 0 ? void 0 : _d.pop()) !== null && _e !== void 0 ? _e : (_g = (_f = $('.pagination > .page-item a[title="Next"]').attr("href")) === null || _f === void 0 ? void 0 : _f.split("=")) === null || _g === void 0 ? void 0 : _g.pop()) !== null && _h !== void 0 ? _h : (_j = $(".pagination > .page-item.active a").text()) === null || _j === void 0 ? void 0 : _j.trim();
            result.totalPages = Number(lastPageNumber) || 1;
        }
        if (result.animes.length === 0 && !result.hasNextPage) {
            result.totalPages = 0;
        }
        $(top10Selector).each((_i, el) => {
            var _a, _b, _c;
            const type = (_c = (_b = (_a = $(el).attr("id")) === null || _a === void 0 ? void 0 : _a.split("-")) === null || _b === void 0 ? void 0 : _b.pop()) === null || _c === void 0 ? void 0 : _c.trim();
            if (!type)
                return;
            if (type === "day")
                result.top10Animes.day = (0, extractors_1.extractTop10Animes)($, type);
            if (type === "week")
                result.top10Animes.week = (0, extractors_1.extractTop10Animes)($, type);
            if (type === "month")
                result.top10Animes.month = (0, extractors_1.extractTop10Animes)($, type);
        });
        return result;
    }
    catch (err) {
        console.error("scrapeAnimeCategories error:", err);
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_k = err.response) === null || _k === void 0 ? void 0 : _k.status) || 500, ((_l = err.response) === null || _l === void 0 ? void 0 : _l.statusText) || "Something went wrong");
        }
        throw http_errors_1.default.InternalServerError("Internal server error");
    }
});
exports.scrapeAnimeCategories = scrapeAnimeCategories;
exports.default = exports.scrapeAnimeCategories;
