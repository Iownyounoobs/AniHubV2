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
exports.getAtoZAnimeList = void 0;
const scrapeAtoZAnimeList_1 = require("../scrapers/scrapeAtoZAnimeList");
/**
 * GET /aniwatchtv/atoz?page=1
 * Returns paginated list of anime (A-Z).
 */
const getAtoZAnimeList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = req.query.page
            ? Number(decodeURIComponent(req.query.page))
            : 1;
        const data = yield (0, scrapeAtoZAnimeList_1.scrapeAtoZAnimeList)(page);
        res.status(200).json(data);
    }
    catch (error) {
        console.error("Error in getAtoZAnimeList:", error);
        res.status(500).json({ error: "Failed to load A-Z anime list" });
    }
});
exports.getAtoZAnimeList = getAtoZAnimeList;
