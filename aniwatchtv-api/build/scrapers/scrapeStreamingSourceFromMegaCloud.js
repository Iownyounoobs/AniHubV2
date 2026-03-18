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
exports.scrapeStreamingSourceFromMegaCloud = void 0;
const aniwatchtvRoutes_1 = require("../utils/aniwatchtvRoutes");
const headers_1 = require("../config/headers");
const axios_1 = __importStar(require("axios"));
const cheerio_1 = require("cheerio");
const http_errors_1 = __importDefault(require("http-errors"));
const extractors_1 = require("../extractors");
const megacloud_1 = __importDefault(require("../utils/megacloud"));
const scrapeStreamingSourceFromMegaCloud = (episodeIdOrUrl_1, ...args_1) => __awaiter(void 0, [episodeIdOrUrl_1, ...args_1], void 0, function* (episodeIdOrUrl, category = "sub") {
    var _a, _b, _c, _d;
    const aniwatchUrls = yield (0, aniwatchtvRoutes_1.getAniWatchTVUrls)();
    // If it's a direct link, resolve using MegaCloud and return
    if (episodeIdOrUrl.startsWith("http")) {
        const directUrl = new URL(episodeIdOrUrl);
        return yield new megacloud_1.default().extract2(directUrl);
    }
    const episodeWatchUrl = new URL(`/watch/${episodeIdOrUrl}`, aniwatchUrls.BASE).href;
    console.log("Episode Page URL:", episodeWatchUrl);
    try {
        // Step 1: Get episode servers HTML
        const episodeId = episodeWatchUrl.split("?ep=")[1];
        const { data } = yield axios_1.default.get(`${aniwatchUrls.AJAX}/v2/episode/servers?episodeId=${episodeId}`, {
            headers: Object.assign(Object.assign({}, headers_1.headers), { Referer: episodeWatchUrl, "X-Requested-With": "XMLHttpRequest" }),
        });
        const $ = (0, cheerio_1.load)(data.html);
        // Step 2: Extract server ID
        const serverId = (0, extractors_1.extractServerId)($, 1, category);
        if (!serverId) {
            throw http_errors_1.default.NotFound("Couldn't find streaming server for this episode.");
        }
        console.log("Server ID:", serverId);
        // Step 3: Get streaming URL using the server ID
        const { data: { link: streamingUrl }, } = yield axios_1.default.get(`${aniwatchUrls.AJAX}/v2/episode/sources?id=${serverId}`);
        console.log("Streaming Link:", streamingUrl);
        // Try axios-based extraction first, then WASM, then Puppeteer interception
        let extracted = { sources: [], subtitles: [] };
        let needsPuppeteer = false;
        try {
            extracted = yield new megacloud_1.default().extract(new URL(streamingUrl));
            if (!((_a = extracted === null || extracted === void 0 ? void 0 : extracted.sources) === null || _a === void 0 ? void 0 : _a.length))
                needsPuppeteer = true;
        }
        catch (extractErr) {
            console.warn("MegaCloud extract failed, trying extract2:", extractErr === null || extractErr === void 0 ? void 0 : extractErr.message);
            needsPuppeteer = true;
        }
        if (needsPuppeteer) {
            needsPuppeteer = false;
            try {
                extracted = yield new megacloud_1.default().extract2(new URL(streamingUrl));
                if (!((_b = extracted === null || extracted === void 0 ? void 0 : extracted.sources) === null || _b === void 0 ? void 0 : _b.length))
                    needsPuppeteer = true;
            }
            catch (megaErr) {
                console.warn("MegaCloud extract2 threw:", megaErr === null || megaErr === void 0 ? void 0 : megaErr.message);
                needsPuppeteer = true;
            }
        }
        if (needsPuppeteer) {
            console.log("Both MegaCloud methods failed — returning embedUrl fallback");
        }
        return Object.assign(Object.assign({}, extracted), { embedUrl: streamingUrl });
    }
    catch (err) {
        console.error("Error in scrapeStreamingSourceFromMegaCloud:", err);
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_c = err.response) === null || _c === void 0 ? void 0 : _c.status) || 500, ((_d = err.response) === null || _d === void 0 ? void 0 : _d.statusText) || "Something went wrong while fetching sources");
        }
        else {
            throw http_errors_1.default.InternalServerError("Internal server error");
        }
    }
});
exports.scrapeStreamingSourceFromMegaCloud = scrapeStreamingSourceFromMegaCloud;
