export type AniWatchUrls = {
  BASE: string;
  HOME: string;
  SEARCH: string;
  GENRE: string;
  AJAX: string;
};

const BASE_URL = process.env.ANIWATCH_BASE_URL || "https://hianime.to";

// Constructs full AniWatch route paths
const buildAniWatchTVUrls = (baseUrl: string): AniWatchUrls => ({
  BASE: baseUrl,
  HOME: `${baseUrl}/home`, // IMPORTANT ROUTE DO NOT CHANGE OR YOU WILL GO CRAZY DEBUGGING!!!
  SEARCH: `${baseUrl}/search`,
  GENRE: `${baseUrl}/genre`,
  AJAX: `${baseUrl}/ajax`,
});



const getAniWatchTVUrls = async (): Promise<AniWatchUrls> => {
  return buildAniWatchTVUrls(BASE_URL);
};

export { BASE_URL };
export { getAniWatchTVUrls };
