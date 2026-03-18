"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractEpisodeList = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const axios_1 = require("axios");
const extractEpisodeList = ($, selectors) => {
    var _a, _b;
    try {
        const episodes = [];
        $(`${selectors}`).each((_index, element) => {
            var _a, _b, _c, _d, _e;
            episodes.push({
                name: ((_b = (_a = $(element)) === null || _a === void 0 ? void 0 : _a.attr("title")) === null || _b === void 0 ? void 0 : _b.trim()) || null,
                episodeNo: Number($(element).attr("data-number")),
                episodeId: ((_e = (_d = (_c = $(element)) === null || _c === void 0 ? void 0 : _c.attr("href")) === null || _d === void 0 ? void 0 : _d.split("/")) === null || _e === void 0 ? void 0 : _e.pop()) || null,
                filler: $(element).hasClass("ssl-item-filler"),
            });
        });
        return episodes;
    }
    catch (err) {
        console.error("Error in extract_episodes_info :", err);
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        else {
            throw http_errors_1.default.InternalServerError("Internal server error");
        }
    }
};
exports.extractEpisodeList = extractEpisodeList;
