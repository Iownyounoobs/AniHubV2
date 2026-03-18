"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTrendingAnimes = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const axios_1 = require("axios");
const extractTrendingAnimes = ($, selector) => {
    var _a, _b;
    try {
        const animes = [];
        $(selector).each((_index, element) => {
            var _a, _b, _c;
            const $el = $(element); // scope this element
            const animeID = ((_a = $el.find(".film-poster").attr("href")) === null || _a === void 0 ? void 0 : _a.slice(1).trim()) || null;
            const animeNAME = ((_b = $el.find(".film-title.dynamic-name").text()) === null || _b === void 0 ? void 0 : _b.trim()) || "UNKNOWN ANIME";
            const animeIMG = ((_c = $el.find(".film-poster-img").attr("data-src")) === null || _c === void 0 ? void 0 : _c.trim()) || null;
            // Optional: debug
            // console.log("Trending anime parsed:", { animeID, animeNAME, animeIMG });
            animes.push({
                id: animeID,
                name: animeNAME,
                img: animeIMG,
            });
        });
        return animes;
    }
    catch (err) {
        console.error("Error in extractTrendingAnimes:", err);
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        throw http_errors_1.default.InternalServerError("Internal server error");
    }
};
exports.extractTrendingAnimes = extractTrendingAnimes;
