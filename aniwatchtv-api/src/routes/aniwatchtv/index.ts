import { Router, Request, Response } from "express";

import {
  getHomePageInfo,
  getAtoZAnimeList,
  getSearchPageInfo,
  getAnimeDetails,
  getCategoryPageInfo,
  getEpisodesInfo,
  getEpisodeServersInfo,
  getEpisodeStreamingSourceInfo,
  getLatestEpisodes,
} from "../../controllers";
import { m3u8ProxyHandler } from "../../utils/m3u8Proxy";
import { imgProxyHandler } from "../../utils/imgProxy";
import { scrapeAnimeCategories } from "../../scrapers/scrapeAnimeCategories";
import { scrapeChineseDonghua } from "../../scrapers/scrapeChineseDonghua";


// create a new router just for /aniwatchtv so it’s cleaner
const aniwatchRouter = Router();

/**
 * This router handles everything under /aniwatchtv.
 * By the time a request reaches here, the base path "/aniwatchtv" is already removed.
 * For example:
 * - A request to GET /aniwatchtv/search will match .get("/search")
 * - A request to GET /aniwatchtv/anime/123 will match .get("/anime/:id")
 * Each route here is connected to a controller function that handles the logic and response.
 */

aniwatchRouter.get("/", getHomePageInfo);

aniwatchRouter.get("/az-list", getAtoZAnimeList);

aniwatchRouter.get("/search", getSearchPageInfo);

aniwatchRouter.get("/anime/:id", getAnimeDetails);

aniwatchRouter.get("/episodes/:id", getEpisodesInfo);

aniwatchRouter.get("/servers", getEpisodeServersInfo);

aniwatchRouter.get("/episode-srcs", getEpisodeStreamingSourceInfo);

aniwatchRouter.get("/latest", getLatestEpisodes);

aniwatchRouter.get("/proxy", m3u8ProxyHandler);
aniwatchRouter.get("/img", imgProxyHandler);

// Chinese donghua — studio-filtered list
aniwatchRouter.get("/donghua", async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const data = await scrapeChineseDonghua(page);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Chinese donghua" });
  }
});

// Genre pages like /genre/action
aniwatchRouter.get("/genre/:genre", async (req: Request, res: Response) => {
  try {
    const category = `genre/${req.params.genre.toLowerCase()}`;
    const page = req.query.page ? Number(req.query.page) : 1;
    const data = await scrapeAnimeCategories(category, page);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch genre" });
  }
});

// Two-segment category paths like /subtype/chinese
aniwatchRouter.get("/subtype/:subtype", async (req: Request, res: Response) => {
  try {
    const category = `subtype/${req.params.subtype}`;
    const page = req.query.page ? Number(req.query.page) : 1;
    const data = await scrapeAnimeCategories(category, page);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subtype category" });
  }
});

aniwatchRouter.get("/:category", getCategoryPageInfo);


export default aniwatchRouter;
