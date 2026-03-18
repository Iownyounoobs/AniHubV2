"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractFeaturedAnimes = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const axios_1 = require("axios");
const extractFeaturedAnimes = ($, selectors) => {
    var _a, _b;
    try {
        const animes = [];
        $(selectors).each((_index, element) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const animeID = ((_c = (_b = (_a = $(element)
                .find(".film-detail .film-name .dynamic-name")) === null || _a === void 0 ? void 0 : _a.attr("href")) === null || _b === void 0 ? void 0 : _b.slice(1)) === null || _c === void 0 ? void 0 : _c.trim()) || null;
            const animeNAME = (_f = (_e = (_d = $(element)
                .find(".film-detail .film-name .dynamic-name")) === null || _d === void 0 ? void 0 : _d.text()) === null || _e === void 0 ? void 0 : _e.trim()) !== null && _f !== void 0 ? _f : "UNKNOWN ANIME";
            const animeIMG = ((_h = (_g = $(element)
                .find(".film-poster a .film-poster-img")) === null || _g === void 0 ? void 0 : _g.attr("data-src")) === null || _h === void 0 ? void 0 : _h.trim()) || null;
            animes.push({
                id: animeID,
                name: animeNAME,
                img: animeIMG,
            });
        });
        return animes.slice(0, 5);
    }
    catch (err) {
        console.error("Error in extractFeaturedAnimes:", err);
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        else {
            throw http_errors_1.default.InternalServerError("Internal server error");
        }
    }
};
exports.extractFeaturedAnimes = extractFeaturedAnimes;
