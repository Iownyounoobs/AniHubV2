"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTop10Animes = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const axios_1 = require("axios");
const extractTop10Animes = ($, periodType) => {
    var _a, _b;
    try {
        const animes = [];
        const selectors = `#top-viewed-${periodType} ul li`;
        $(selectors).each((_index, element) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            const animeID = ((_b = (_a = $(element)
                .find(".film-detail .film-name .dynamic-name")) === null || _a === void 0 ? void 0 : _a.attr("href")) === null || _b === void 0 ? void 0 : _b.slice(1)) || null;
            const animeNAME = (_e = (_d = (_c = $(element)
                .find(".film-detail .film-name .dynamic-name")) === null || _c === void 0 ? void 0 : _c.text()) === null || _d === void 0 ? void 0 : _d.trim()) !== null && _e !== void 0 ? _e : "UNKNOWN ANIME";
            const animeRANK = Number((_g = (_f = $(element).find(".film-number span")) === null || _f === void 0 ? void 0 : _f.text()) === null || _g === void 0 ? void 0 : _g.trim()) || null;
            const noOfSubEps = Number((_h = $(element).find(".film-detail .fd-infor .tick-item.tick-sub")) === null || _h === void 0 ? void 0 : _h.text()) || null;
            const noOfDubEps = Number((_j = $(element).find(".film-detail .fd-infor .tick-item.tick-dub")) === null || _j === void 0 ? void 0 : _j.text()) || null;
            const totalNoOfEps = Number((_k = $(element).find(".film-detail .fd-infor .tick-item.tick-eps")) === null || _k === void 0 ? void 0 : _k.text()) || null;
            const animeIMG = ((_m = (_l = $(element)
                .find(".film-poster .film-poster-img")) === null || _l === void 0 ? void 0 : _l.attr("data-src")) === null || _m === void 0 ? void 0 : _m.trim()) || null;
            animes.push({
                id: animeID,
                name: animeNAME,
                rank: animeRANK,
                img: animeIMG,
                episodes: {
                    eps: totalNoOfEps,
                    sub: noOfSubEps,
                    dub: noOfDubEps,
                },
            });
        });
        return animes;
    }
    catch (err) {
        console.error("Error in extract_top10_animes :", err);
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        else {
            throw http_errors_1.default.InternalServerError("Internal server error");
        }
    }
};
exports.extractTop10Animes = extractTop10Animes;
