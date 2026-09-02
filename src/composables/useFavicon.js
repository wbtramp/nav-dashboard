export function useFavicon() {
  function getFaviconUrl(url) {
    try {
      const domain = new URL(url).hostname
      return `https://icons.duckduckgo.com/ip3/${domain}.ico`
    } catch {
      return null
    }
  }

  return { getFaviconUrl }
}
