"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAniWatchTVUrls = exports.BASE_URL = void 0;
const isSiteReachable_1 = require("./isSiteReachable");
// Hardcoded base URL (you can adjust if needed)
const BASE_URL = "https://aniwatchtv.to";
exports.BASE_URL = BASE_URL;
// Constructs full AniWatch route paths
const buildAniWatchTVUrls = (baseUrl) => ({
    BASE: baseUrl,
    HOME: `${baseUrl}/home`, // IMPORTANT ROUTE DO NOT CHANGE OR YOU WILL GO CRAZY DEBUGGING!!!
    SEARCH: `${baseUrl}/search`,
    GENRE: `${baseUrl}/genre`,
    AJAX: `${baseUrl}/ajax`,
});
// Validates base URL reachability and returns full route set
const getAniWatchTVUrls = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reachable = yield (0, isSiteReachable_1.isSiteReachable)(BASE_URL);
        if (!reachable)
            throw new Error("AniWatch base URL is not reachable");
        return buildAniWatchTVUrls(BASE_URL);
    }
    catch (error) {
        console.error("Error reaching AniWatch site:", error);
        throw error;
    }
});
exports.getAniWatchTVUrls = getAniWatchTVUrls;
