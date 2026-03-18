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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHomePageInfo = void 0;
const axios_1 = __importDefault(require("axios"));
const scrapers_1 = require("../scrapers");
/**
 * GET /aniwatchtv/homepage
 *
 * Scrapes and returns homepage content from AniWatchTV.
 * Sections include:
 * - Spotlight / Featured anime
 * - Latest updates
 * - Popular or trending anime
 */
const getHomePageInfo = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, scrapers_1.scrapeHomePage)();
        if (!data || Object.keys(data).length === 0) {
            try {
                yield axios_1.default.get("https://aniwatchtv.to/");
                res.status(404).json({
                    error: "AniWatchTV is online, but no homepage data was found.",
                });
                return; // explicitly stop execution
            }
            catch (pingError) {
                res.status(503).json({
                    error: "AniWatchTV offline or unreachable.",
                });
                return;
            }
        }
        console.log("Homepage data:", data);
        res.status(200).json(data);
    }
    catch (error) {
        console.error("Error in getHomePageInfo:", error);
    }
});
exports.getHomePageInfo = getHomePageInfo;
