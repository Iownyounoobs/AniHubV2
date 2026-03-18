"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractRecommendedAnimes = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const axios_1 = require("axios");
const top_upcoming_animes_1 = require("./top_upcoming_animes");
const extractRecommendedAnimes = ($, selectors) => {
    var _a, _b;
    try {
        const animes = (0, top_upcoming_animes_1.extractTopUpcomingAnimes)($, selectors);
        return animes;
    }
    catch (err) {
        console.error("Error in extract_recommended_animes :", err);
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        else {
            throw http_errors_1.default.InternalServerError("Internal server error");
        }
    }
};
exports.extractRecommendedAnimes = extractRecommendedAnimes;
