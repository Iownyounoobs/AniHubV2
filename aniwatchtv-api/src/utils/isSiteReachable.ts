/**
 * Checks if a site is reachable via a HEAD request.
 * Returns `true` if the status code is 2xx, otherwise `false`.
 */
export const isSiteReachable = async (url: string): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout
  
      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
      });
  
      clearTimeout(timeout);
      return response.ok;
    } catch (error) {
      console.warn(`Site unreachable: ${url}`);
      return false;
    }
  };
  