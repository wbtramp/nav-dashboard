export function b64ToUtf8(b64) {
  const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function utf8ToB64(str) {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  bytes.forEach(b => (bin += String.fromCharCode(b)))
  return btoa(bin)
}
