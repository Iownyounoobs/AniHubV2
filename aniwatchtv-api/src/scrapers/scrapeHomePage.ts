import { load, type CheerioAPI, type SelectorType } from "cheerio";
import createHttpError, { type HttpError } from "http-errors";

import { fetchHtml } from "../utils/browser";
import {
  extractTrendingAnimes,
  extractLatestEpisodes,
  extractFeaturedAnimes,
  extractTopUpcomingAnimes,
  extractSpotlightAnimes,
  extractGenreList,
  extractTop10Animes,
} from "../extractors";

import { ScrapedHomePage, Top10AnimeTimePeriod } from "../types/animeTypes";
import { getAniWatchTVUrls } from "../utils/aniwatchtvRoutes";

export const scrapeHomePage = async (): Promise<ScrapedHomePage | HttpError> => {
  const result: ScrapedHomePage = {
    spotLightAnimes: [],
    trendingAnimes: [],
    latestEpisodes: [],
    top10Animes: { day: [], week: [], month: [] },
    featuredAnimes: {
      topAiringAnimes: [],
      mostPopularAnimes: [],
      mostFavoriteAnimes: [],
      latestCompletedAnimes: [],
    },
    topUpcomingAnimes: [],
    genres: [],
  };

  try {
    const URLs = await getAniWatchTVUrls();
    const html = await fetchHtml(URLs.HOME, URLs.BASE);
    const $: CheerioAPI = load(html);

    const trendingAnimeSelectors: SelectorType = "#anime-trending #trending-home .swiper-wrapper .swiper-slide";
    const latestEpisodesSelectors: SelectorType = "#main-content .block_area_home:nth-of-type(1) .tab-content .film_list-wrap .flw-item";
    const topAiringSelectors: SelectorType = "#anime-featured .row div:nth-of-type(1) .anif-block-ul ul li";
    const mostPopularSelectors: SelectorType = "#anime-featured .row div:nth-of-type(2) .anif-block-ul ul li";
    const mostFavoriteSelectors: SelectorType = "#anime-featured .row div:nth-of-type(3) .anif-block-ul ul li";
    const latestCompletedSelectors: SelectorType = "#anime-featured .row div:nth-of-type(4) .anif-block-ul ul li";
    const topUpcomingSelectors: SelectorType = "#main-content .block_area_home:nth-of-type(3) .tab-content .film_list-wrap .flw-item";
    const spotLightSelectors: SelectorType = "#slider .swiper-wrapper .swiper-slide";
    const genresSelectors: SelectorType = "#main-sidebar .block_area.block_area_sidebar.block_area-genres .sb-genre-list li";
    const top10Selectors: SelectorType = '#main-sidebar .block_area-realtime [id^="top-viewed-"]';

    result.trendingAnimes = extractTrendingAnimes($, trendingAnimeSelectors);
    result.latestEpisodes = extractLatestEpisodes($, latestEpisodesSelectors);
    result.featuredAnimes.topAiringAnimes = extractFeaturedAnimes($, topAiringSelectors);
    result.featuredAnimes.mostPopularAnimes = extractFeaturedAnimes($, mostPopularSelectors);
    result.featuredAnimes.mostFavoriteAnimes = extractFeaturedAnimes($, mostFavoriteSelectors);
    result.featuredAnimes.latestCompletedAnimes = extractFeaturedAnimes($, latestCompletedSelectors);
    result.topUpcomingAnimes = extractTopUpcomingAnimes($, topUpcomingSelectors);
    result.spotLightAnimes = extractSpotlightAnimes($, spotLightSelectors);
    result.genres = extractGenreList($, genresSelectors);

    $(top10Selectors).each((_i, el) => {
      const type = $(el).attr("id")?.split("-").pop()?.trim() as Top10AnimeTimePeriod;
      if (["day", "week", "month"].includes(type)) {
        result.top10Animes[type] = extractTop10Animes($, type);
      }
    });

    return result;
  } catch (err) {
    console.error("Error in scrapeHomePage:", err);
    throw createHttpError.InternalServerError("Internal server error");
  }
};
