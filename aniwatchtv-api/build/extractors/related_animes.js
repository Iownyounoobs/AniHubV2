"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractRelatedAnimes = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const axios_1 = require("axios");
const extractRelatedAnimes = ($, selectors) => {
    var _a, _b;
    try {
        const animes = [];
        $(selectors).each((_index, element) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
            const animeID = ((_b = (_a = $(element)
                .find(".film-detail .dynamic-name")) === null || _a === void 0 ? void 0 : _a.attr("href")) === null || _b === void 0 ? void 0 : _b.slice(1).trim()) || null;
            const animeNAME = (_e = (_d = (_c = $(element).find(".film-detail .dynamic-name")) === null || _c === void 0 ? void 0 : _c.text()) === null || _d === void 0 ? void 0 : _d.trim()) !== null && _e !== void 0 ? _e : "UNKNOWN ANIME";
            const animeIMG = ((_g = (_f = $(element)
                .find(".film-poster .film-poster-img")) === null || _f === void 0 ? void 0 : _f.attr("data-src")) === null || _g === void 0 ? void 0 : _g.trim()) || null;
            const epSUB = Number((_j = (_h = $(selectors)
                .find(".fd-infor .tick .tick-item.tick-sub")) === null || _h === void 0 ? void 0 : _h.text()) === null || _j === void 0 ? void 0 : _j.trim()) || null;
            const epDUB = Number((_l = (_k = $(selectors)
                .find(".fd-infor .tick .tick-item.tick-dub")) === null || _k === void 0 ? void 0 : _k.text()) === null || _l === void 0 ? void 0 : _l.trim()) || null;
            const total_eps = Number((_o = (_m = $(selectors)
                .find(".fd-infor .tick .tick-item.tick-eps")) === null || _m === void 0 ? void 0 : _m.text()) === null || _o === void 0 ? void 0 : _o.trim()) || null;
            const animeTYPE = ((_u = (_t = (_s = (_r = (_q = (_p = $(selectors)) === null || _p === void 0 ? void 0 : _p.find(".fd-infor .tick")) === null || _q === void 0 ? void 0 : _q.text()) === null || _r === void 0 ? void 0 : _r.trim()) === null || _s === void 0 ? void 0 : _s.replace(/[\s\n]+/g, " ")) === null || _t === void 0 ? void 0 : _t.split(" ")) === null || _u === void 0 ? void 0 : _u.pop()) || null;
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
        console.error("Error in extract_related_animes :", err);
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        else {
            throw http_errors_1.default.InternalServerError("Internal server error");
        }
    }
};
exports.extractRelatedAnimes = extractRelatedAnimes;
