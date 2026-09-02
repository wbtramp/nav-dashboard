export function normalize(str) {
  return str.toLowerCase().trim()
}

export function matchesQuery(bookmark, query) {
  if (!query) return true
  const q = normalize(query)
  return (
    normalize(bookmark.title).includes(q) ||
    normalize(bookmark.url).includes(q) ||
    normalize(bookmark.description || '').includes(q) ||
    bookmark.tags.some(t => normalize(t).includes(q))
  )
}

export function matchesTags(bookmark, activeTags) {
  if (!activeTags.length) return true
  return activeTags.some(tag => bookmark.tags.includes(tag))
}
