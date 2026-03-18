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
exports.scrapeAnimeDetails = void 0;
const aniwatchtvRoutes_1 = require("../utils/aniwatchtvRoutes");
const headers_1 = require("../config/headers");
const axios_1 = __importStar(require("axios"));
const cheerio_1 = require("cheerio");
const http_errors_1 = __importDefault(require("http-errors"));
const extractors_1 = require("../extractors");
const detectCountry_1 = require("../utils/detectCountry");
const scrapeAnimeDetails = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const defaultInfo = {
        id: null,
        mal_id: null,
        al_id: null,
        anime_id: null,
        name: "UNKNOWN ANIME",
        img: null,
        rating: null,
        episodes: {
            eps: null,
            sub: null,
            dub: null,
        },
        category: null,
        quality: null,
        duration: null,
        description: "UNKNOWN ANIME DESCRIPTION",
    };
    const result = {
        info: defaultInfo,
        moreInfo: {},
        seasons: [],
        relatedAnimes: [],
        recommendedAnimes: [],
        mostPopularAnimes: [],
    };
    try {
        const { BASE } = yield (0, aniwatchtvRoutes_1.getAniWatchTVUrls)();
        const url = new URL(id, BASE).toString();
        const response = yield axios_1.default.get(url, {
            headers: headers_1.headers,
        });
        const $ = (0, cheerio_1.load)(response.data);
        result.info = (0, extractors_1.extractAnimeDetails)($, "#ani_detail .container .anis-content");
        result.moreInfo = (0, extractors_1.extractExtraAboutInfo)($, "#ani_detail .container .anis-content .anisc-info");
        result.seasons = (0, extractors_1.extractAnimeSeasonsInfo)($, ".os-list a.os-item");
        result.relatedAnimes = (0, extractors_1.extractRelatedAnimes)($, "#main-sidebar .block_area.block_area_sidebar.block_area-realtime:nth-of-type(1) .anif-block-ul ul li");
        result.recommendedAnimes = (0, extractors_1.extractRecommendedAnimes)($, "#main-content .block_area.block_area_category .tab-content .flw-item");
        result.mostPopularAnimes = (0, extractors_1.extractMostPopularAnimes)($, "#main-sidebar .block_area.block_area_sidebar.block_area-realtime:nth-of-type(2) .anif-block-ul ul li");
        const studiosRaw = result.moreInfo["Studios:"];
        const studios = typeof studiosRaw === "string"
            ? studiosRaw.split(",").map((s) => s.trim())
            : [];
        result.origin = (0, detectCountry_1.detectCountry)(studios);
        console.log("Studios:", studios);
        console.log("Detected Origin:", result.origin);
        return result;
    }
    catch (err) {
        console.error("Error in scrapeAnimeDetails:", err);
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        throw http_errors_1.default.InternalServerError("Internal server error");
    }
});
exports.scrapeAnimeDetails = scrapeAnimeDetails;
