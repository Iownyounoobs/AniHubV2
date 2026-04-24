import { load, type CheerioAPI, type SelectorType } from "cheerio";
import createHttpError, { type HttpError } from "http-errors";

import { getAniWatchTVUrls } from "../utils/aniwatchtvRoutes";
import { fetchHtml } from "../utils/browser";
import {
  extractSearchedAnimes,
  extractMostPopularAnimes,
  extractGenreList,
} from "../extractors";
import { ScrapedSearchPage } from "../types/animeTypes";

export const scrapeAnimeSearchResults = async (
  query: string,
  page: number
): Promise<ScrapedSearchPage | HttpError> => {
  const result: ScrapedSearchPage = {
    animes: [],
    mostPopularAnimes: [],
    currentPage: page,
    hasNextPage: false,
    totalPages: 1,
    genres: [],
  };

  try {
    const { SEARCH, BASE } = await getAniWatchTVUrls();
    const url = `${SEARCH}?keyword=${encodeURIComponent(query)}&page=${page}`;

    const html = await fetchHtml(url, BASE);
    const $: CheerioAPI = load(html);

    const animeSelector: SelectorType = "#main-content .tab-content .film_list-wrap .flw-item";
    const popularSelector: SelectorType = "#main-sidebar .block_area.block_area_sidebar.block_area-realtime .anif-block-ul ul li";
    const genreSelector: SelectorType = "#main-sidebar .block_area.block_area_sidebar.block_area-genres .sb-genre-list li";

    const rawAnimes = extractSearchedAnimes($, animeSelector);
    const seen = new Set<string>();
    result.animes = rawAnimes.filter((anime) => {
      if (!anime.id) return false;
      anime.id = anime.id.split("?")[0];
      if (seen.has(anime.id)) return false;
      seen.add(anime.id);
      return true;
    });

    if (page === 1) result.mostPopularAnimes = extractMostPopularAnimes($, popularSelector);
    result.genres = extractGenreList($, genreSelector);

    const totalPages = $('.pagination > .page-item a[title="Last"]')?.attr("href")?.split("=").pop();
    const fallbackPages = $('.pagination > .page-item a[title="Next"]')?.attr("href")?.split("=").pop();
    const currentPageText = $(".pagination > .page-item.active a")?.text()?.trim();

    result.totalPages = Number(totalPages ?? fallbackPages ?? currentPageText) || 1;
    result.hasNextPage =
      $(".pagination li.active").length > 0 &&
      !$(".pagination li").last().hasClass("active");

    if (!result.hasNextPage && result.animes.length === 0) result.totalPages = 0;

    return result;
  } catch (err) {
    console.error("Error in scrapeAnimeSearchResults:", err);
    throw createHttpError.InternalServerError("Internal server error");
  }
};
