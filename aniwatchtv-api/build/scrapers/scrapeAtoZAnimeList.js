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
exports.scrapeAtoZAnimeList = void 0;
const axios_1 = __importStar(require("axios"));
const cheerio_1 = require("cheerio");
const http_errors_1 = __importDefault(require("http-errors"));
const aniwatchtvRoutes_1 = require("../utils/aniwatchtvRoutes");
const headers_1 = require("../config/headers"); // ✅ fixed import
const extractors_1 = require("../extractors");
/**
 * Scrapes anime list from the A-Z page for a given pagination.
 */
const scrapeAtoZAnimeList = (page) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { BASE } = yield (0, aniwatchtvRoutes_1.getAniWatchTVUrls)();
        const pageUrl = new URL(`az-list/?page=${page}`, BASE).toString();
        const response = yield axios_1.default.get(pageUrl, {
            headers: headers_1.headers,
        });
        const $ = (0, cheerio_1.load)(response.data);
        const selector = ".film_list-wrap .flw-item";
        console.log("Elements matched:", $(selector).length);
        console.log("HTML preview:", response.data.slice(0, 500)); // optional
        return (0, extractors_1.extractAtoZAnimes)($, selector);
    }
    catch (err) {
        console.error("Error in scrapeAtoZAnimeList:", err);
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        throw http_errors_1.default.InternalServerError("Internal server error");
    }
});
exports.scrapeAtoZAnimeList = scrapeAtoZAnimeList;
