"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractAnimeSeasonsInfo = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const axios_1 = require("axios");
const extractAnimeSeasonsInfo = ($, selectors) => {
    var _a, _b;
    try {
        const seasons = [];
        $(selectors).each((_index, element) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
            const animeID = ((_c = (_b = (_a = $(element)) === null || _a === void 0 ? void 0 : _a.attr("href")) === null || _b === void 0 ? void 0 : _b.slice(1)) === null || _c === void 0 ? void 0 : _c.trim()) || null;
            const animeNAME = (_f = (_e = (_d = $(element)) === null || _d === void 0 ? void 0 : _d.attr("title")) === null || _e === void 0 ? void 0 : _e.trim()) !== null && _f !== void 0 ? _f : "UNKNOWN ANIME";
            const animeTITLE = ((_j = (_h = (_g = $(element)) === null || _g === void 0 ? void 0 : _g.find(".title")) === null || _h === void 0 ? void 0 : _h.text()) === null || _j === void 0 ? void 0 : _j.trim()) || null;
            const animeIMG = ((_r = (_q = (_p = (_o = (_m = (_l = (_k = $(element)) === null || _k === void 0 ? void 0 : _k.find(".season-poster")) === null || _l === void 0 ? void 0 : _l.attr("style")) === null || _m === void 0 ? void 0 : _m.split(" ")) === null || _o === void 0 ? void 0 : _o.pop()) === null || _p === void 0 ? void 0 : _p.split("(")) === null || _q === void 0 ? void 0 : _q.pop()) === null || _r === void 0 ? void 0 : _r.split(")")[0]) || null;
            seasons.push({
                id: animeID,
                name: animeNAME,
                seasonTitle: animeTITLE,
                img: animeIMG,
                isCurrent: (_s = $(element)) === null || _s === void 0 ? void 0 : _s.hasClass("active"),
            });
        });
        return seasons;
    }
    catch (err) {
        console.error("Error in extract_anime_seasons_info :", err);
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        else {
            throw http_errors_1.default.InternalServerError("Internal server error");
        }
    }
};
exports.extractAnimeSeasonsInfo = extractAnimeSeasonsInfo;
