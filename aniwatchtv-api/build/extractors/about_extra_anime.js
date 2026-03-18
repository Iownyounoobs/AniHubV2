"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractExtraAboutInfo = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const axios_1 = require("axios");
const extractExtraAboutInfo = ($, selectors) => {
    var _a, _b;
    try {
        const moreInfo = {};
        const genres = [];
        const producers = [];
        $(selectors + " .item-title").each((_index, element) => {
            var _a, _b, _c, _d, _e, _f;
            const animeKEY = (_c = (_b = (_a = $(element).find(".item-head")) === null || _a === void 0 ? void 0 : _a.text()) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : "UNKNOWN";
            const animeVALUE = (_f = (_e = (_d = $(element).find(".name")) === null || _d === void 0 ? void 0 : _d.text()) === null || _e === void 0 ? void 0 : _e.trim()) !== null && _f !== void 0 ? _f : "UNKNOWN";
            if (animeKEY !== "Producers:" && animeKEY !== "Overview:") {
                moreInfo[animeKEY] = animeVALUE;
            }
            else if (animeKEY === "Producers:") {
                $(selectors + " .item-title a").each((_index, element) => {
                    var _a, _b, _c;
                    const animeProducers = (_c = (_b = (_a = $(element)) === null || _a === void 0 ? void 0 : _a.text()) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : "UNKNOWN";
                    producers.push(animeProducers);
                });
            }
        });
        $(selectors + " .item-list a").each((_index, element) => {
            var _a, _b, _c;
            const animeGENRES = (_c = (_b = (_a = $(element)) === null || _a === void 0 ? void 0 : _a.text()) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : "UNKNOWN";
            genres.push(animeGENRES);
        });
        moreInfo["Genres"] = genres;
        moreInfo["Producers"] = producers;
        return moreInfo;
    }
    catch (err) {
        console.error("Error in extract_extra_about_info :", err);
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        else {
            throw http_errors_1.default.InternalServerError("Internal server error");
        }
    }
};
exports.extractExtraAboutInfo = extractExtraAboutInfo;
