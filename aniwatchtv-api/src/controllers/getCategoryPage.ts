import type { RequestHandler } from "express";
import createHttpError from "http-errors";
import { scrapeAnimeCategories } from "../scrapers/scrapeAnimeCategories";

/**
 * GET /aniwatchtv/category/:category?page=1
 * Scrapes and returns anime category page results.
 */
const ALLOWED_CATEGORIES = new Set([
  "top-airing", "most-popular", "most-favorite", "latest-completed",
  "recently-added", "recently-updated", "top-upcoming", "tv", "movie",
  "ova", "ona", "special", "subbed-anime", "dubbed-anime",
]);

const getCategoryPageInfo: RequestHandler = async (req, res) => {
  try {
    const category = req.params.category?.toLowerCase().trim();
    const page = Math.max(1, Math.min(100, Number(req.query.page) || 1));

    if (!category) {
      throw createHttpError.BadRequest("Category parameter is required.");
    }

    if (!ALLOWED_CATEGORIES.has(category)) {
      throw createHttpError.BadRequest("Invalid category.");
    }

    const data = await scrapeAnimeCategories(category, page);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in getCategoryPageInfo:", error);
    if (createHttpError.isHttpError(error)) {
      res.status((error as any).status).json({ error: (error as any).message });
    } else {
      res.status(500).json({ error: "Failed to fetch category page" });
    }
  }
};

export { getCategoryPageInfo };
