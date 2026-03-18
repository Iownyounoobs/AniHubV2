"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractMostPopularAnimes = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const axios_1 = require("axios");
const extractMostPopularAnimes = ($, selector) => {
    var _a, _b;
    try {
        const animes = [];
        $(selector).each((_index, element) => {
            var _a, _b, _c, _d, _e, _f, _g;
            const $el = $(element);
            const detailEl = $el.find(".film-detail .dynamic-name");
            const posterEl = $el.find(".film-poster .film-poster-img");
            const infoEl = $el.find(".fd-infor");
            const animeID = ((_a = detailEl.attr("href")) === null || _a === void 0 ? void 0 : _a.slice(1).trim()) || null;
            const animeNAME = ((_b = detailEl.text()) === null || _b === void 0 ? void 0 : _b.trim()) || "UNKNOWN ANIME";
            const animeIMG = ((_c = posterEl.attr("data-src")) === null || _c === void 0 ? void 0 : _c.trim()) || null;
            const epSUB = Number(infoEl.find(".tick-item.tick-sub").text().trim()) || null;
            const epDUB = Number(infoEl.find(".tick-item.tick-dub").text().trim()) || null;
            const total_eps = Number(infoEl.find(".tick-item.tick-eps").text().trim()) || null;
            const animeTYPE = ((_g = (_f = (_e = (_d = infoEl
                .find(".tick")
                .text()) === null || _d === void 0 ? void 0 : _d.replace(/[\s\n]+/g, " ")) === null || _e === void 0 ? void 0 : _e.trim()) === null || _f === void 0 ? void 0 : _f.split(" ")) === null || _g === void 0 ? void 0 : _g.pop()) || null;
            animes.push({
                id: animeID,
                name: animeNAME,
                category: animeTYPE,
                img: animeIMG,
                episodes: {
                    eps: total_eps,
                    sub: epSUB,
                    dub: epDUB,
                },
            });
        });
        return animes;
    }
    catch (err) {
        console.error("Error in extractMostPopularAnimes:", err);
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        throw http_errors_1.default.InternalServerError("Internal server error");
    }
};
exports.extractMostPopularAnimes = extractMostPopularAnimes;
