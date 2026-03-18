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
exports.getCategoryPageInfo = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const scrapeAnimeCategories_1 = require("../scrapers/scrapeAnimeCategories");
/**
 * GET /aniwatchtv/category/:category?page=1
 * Scrapes and returns anime category page results.
 */
const getCategoryPageInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = req.params.category;
        const page = req.query.page
            ? Number(decodeURIComponent(req.query.page))
            : 1;
        if (!category) {
            throw http_errors_1.default.BadRequest("Category parameter is required.");
        }
        const data = yield (0, scrapeAnimeCategories_1.scrapeAnimeCategories)(category, page);
        res.status(200).json(data);
    }
    catch (error) {
        console.error("Error in getCategoryPageInfo:", error);
        res.status(500).json({ error: "Failed to fetch category page" });
    }
});
exports.getCategoryPageInfo = getCategoryPageInfo;
