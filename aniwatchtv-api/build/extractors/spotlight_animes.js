"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractSpotlightAnimes = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const axios_1 = require("axios");
const extractSpotlightAnimes = ($, selectors) => {
    var _a, _b;
    try {
        const animes = [];
        $(selectors).each((_index, element) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
            const animeID = ((_d = (_c = (_b = (_a = $(element)
                .find(".deslide-item-content .desi-buttons a")) === null || _a === void 0 ? void 0 : _a.last()) === null || _b === void 0 ? void 0 : _b.attr("href")) === null || _c === void 0 ? void 0 : _c.slice(1)) === null || _d === void 0 ? void 0 : _d.trim()) || null;
            const animeNAME = (_g = (_f = (_e = $(element)
                .find(".deslide-item-content .desi-head-title.dynamic-name")) === null || _e === void 0 ? void 0 : _e.text()) === null || _f === void 0 ? void 0 : _f.trim()) !== null && _g !== void 0 ? _g : "UNKNOWN ANIME";
            const animeRANK = Number((_l = (_k = (_j = (_h = $(element)
                .find(".deslide-item-content .desi-sub-text")) === null || _h === void 0 ? void 0 : _h.text()) === null || _j === void 0 ? void 0 : _j.trim()) === null || _k === void 0 ? void 0 : _k.split(" ")[0]) === null || _l === void 0 ? void 0 : _l.slice(1)) || null;
            const animeIMG = ((_o = (_m = $(element)
                .find(".deslide-cover .deslide-cover-img .film-poster-img")) === null || _m === void 0 ? void 0 : _m.attr("data-src")) === null || _o === void 0 ? void 0 : _o.trim()) || null;
            const animeDESCRIPTION = (_t = (_s = (_r = (_q = (_p = $(element)
                .find(".deslide-item-content .desi-description")) === null || _p === void 0 ? void 0 : _p.text()) === null || _q === void 0 ? void 0 : _q.split("[")) === null || _r === void 0 ? void 0 : _r.shift()) === null || _s === void 0 ? void 0 : _s.trim()) !== null && _t !== void 0 ? _t : "UNKNOW ANIME DESCRIPTION";
            const animeEXTRA = $(element)
                .find(".deslide-item-content .sc-detail .scd-item")
                .map((_i, el) => $(el).text().trim())
                .get();
            const episodeDetails = animeEXTRA[4].split(/\s+/).map(Number) || null;
            animes.push({
                id: animeID,
                name: animeNAME,
                rank: animeRANK,
                img: animeIMG,
                episodes: {
                    eps: episodeDetails[2],
                    sub: episodeDetails[0],
                    dub: episodeDetails[1],
                },
                duration: animeEXTRA[1],
                quality: animeEXTRA[3],
                category: animeEXTRA[0],
                releasedDay: animeEXTRA[2],
                description: animeDESCRIPTION,
            });
        });
        return animes;
    }
    catch (err) {
        console.error("Error in extract_spotlight_animes :", err);
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        else {
            throw http_errors_1.default.InternalServerError("Internal server error");
        }
    }
};
exports.extractSpotlightAnimes = extractSpotlightAnimes;
