"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTopUpcomingAnimes = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const axios_1 = require("axios");
const extractTopUpcomingAnimes = ($, selectors) => {
    var _a, _b;
    try {
        const animes = [];
        $(selectors).each((_index, element) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
            const animeID = ((_b = (_a = $(element)
                .find(".film-detail .film-name .dynamic-name")) === null || _a === void 0 ? void 0 : _a.attr("href")) === null || _b === void 0 ? void 0 : _b.slice(1)) || null;
            const animeNAME = (_e = (_d = (_c = $(element)
                .find(".film-detail .film-name .dynamic-name")) === null || _c === void 0 ? void 0 : _c.text()) === null || _d === void 0 ? void 0 : _d.trim()) !== null && _e !== void 0 ? _e : "UNKNOWN ANIME";
            const noOfSubEps = Number((_f = $(element).find(".film-poster .tick .tick-sub")) === null || _f === void 0 ? void 0 : _f.text()) || null;
            const noOfDubEps = Number((_g = $(element).find(".film-poster .tick .tick-dub")) === null || _g === void 0 ? void 0 : _g.text()) || null;
            const totalNoOfEps = Number((_h = $(element).find(".film-poster .tick .tick-eps")) === null || _h === void 0 ? void 0 : _h.text()) || null;
            const epLengthTime = (_l = (_k = (_j = $(element)
                .find(".film-detail .fd-infor .fdi-duration")) === null || _j === void 0 ? void 0 : _j.text()) === null || _k === void 0 ? void 0 : _k.trim()) !== null && _l !== void 0 ? _l : "UNKNOWN";
            const adultRated = ((_o = (_m = $(element).find(".film-poster .tick-rate")) === null || _m === void 0 ? void 0 : _m.text()) === null || _o === void 0 ? void 0 : _o.trim()) || null;
            const animeIMG = $(element).find(".film-poster .film-poster-img").attr("data-src") ||
                null;
            animes.push({
                id: animeID,
                name: animeNAME,
                img: animeIMG,
                episodes: {
                    eps: totalNoOfEps,
                    sub: noOfSubEps,
                    dub: noOfDubEps,
                },
                duration: epLengthTime,
                rated: adultRated === "18+",
            });
        });
        return animes;
    }
    catch (err) {
        console.error("Error in extract_top_upcoming_animes :", err);
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        else {
            throw http_errors_1.default.InternalServerError("Internal server error");
        }
    }
};
exports.extractTopUpcomingAnimes = extractTopUpcomingAnimes;
