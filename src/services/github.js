import { GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH, DATA_PATH, PRIVATE_REPO } from '../config.js'
import { b64ToUtf8, utf8ToB64 } from './codec.js'

const API_BASE = 'https://api.github.com'

function headers(pat) {
  const h = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (pat) h.Authorization = `Bearer ${pat}`
  return h
}

export async function fetchBookmarks(pat) {
  const url = `${API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${DATA_PATH}?ref=${GITHUB_BRANCH}`
  const res = await fetch(url, { headers: headers(pat) })

  if (res.ok) {
    const json = await res.json()
    const content = b64ToUtf8(json.content)
    return { data: JSON.parse(content), sha: json.sha }
  }

  if (res.status === 403 || res.status === 429) {
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${DATA_PATH}?t=${Date.now()}`
    const rawRes = await fetch(rawUrl)
    if (rawRes.ok) {
      const text = await rawRes.text()
      return { data: JSON.parse(text), sha: null }
    }
  }

  throw new Error(`Failed to fetch bookmarks: ${res.status} ${res.statusText}`)
}

export async function saveBookmarks(pat, data, sha) {
  const content = utf8ToB64(JSON.stringify(data, null, 2))
  const body = {
    message: 'chore: update bookmarks',
    content,
    sha,
    branch: GITHUB_BRANCH,
  }

  const url = `${API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${DATA_PATH}`
  const res = await fetch(url, {
    method: 'PUT',
    headers: headers(pat),
    body: JSON.stringify(body),
  })

  if (res.status === 409) {
    throw new Error('CONFLICT')
  }

  if (!res.ok) {
    throw new Error(`Failed to save: ${res.status} ${res.statusText}`)
  }

  const json = await res.json()
  return { sha: json.content.sha }
}

export async function verifyToken(pat) {
  const res = await fetch(`${API_BASE}/user`, { headers: headers(pat) })
  if (!res.ok) throw new Error(`Invalid token: ${res.status}`)
  const user = await res.json()
  return user.login
}

export async function fetchPrivateContent(pat, path) {
  const url = `${API_BASE}/repos/${GITHUB_OWNER}/${PRIVATE_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`
  const res = await fetch(url, { headers: headers(pat) })
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status} ${res.statusText}`)
  const json = await res.json()
  return { data: json, sha: json.sha }
}

export async function savePrivateContent(pat, path, content, sha, message) {
  const body = {
    message: message || `chore: update ${path}`,
    content: utf8ToB64(content),
    sha,
    branch: GITHUB_BRANCH,
  }
  const url = `${API_BASE}/repos/${GITHUB_OWNER}/${PRIVATE_REPO}/contents/${path}`
  const res = await fetch(url, {
    method: 'PUT',
    headers: headers(pat),
    body: JSON.stringify(body),
  })
  if (res.status === 409) throw new Error('CONFLICT')
  if (!res.ok) throw new Error(`Failed to save ${path}: ${res.status} ${res.statusText}`)
  const json = await res.json()
  return { sha: json.content.sha }
}

export async function fetchPrivateJson(pat, path) {
  const { data, sha } = await fetchPrivateContent(pat, path)
  const content = b64ToUtf8(data.content)
  return { data: JSON.parse(content), sha }
}

export async function savePrivateJson(pat, path, jsonData, sha) {
  return savePrivateContent(pat, path, JSON.stringify(jsonData, null, 2), sha)
}

export async function deletePrivateContent(pat, path, sha) {
  const url = `${API_BASE}/repos/${GITHUB_OWNER}/${PRIVATE_REPO}/contents/${path}`
  const res = await fetch(url, {
    method: 'DELETE',
    headers: headers(pat),
    body: JSON.stringify({ message: `chore: delete ${path}`, sha, branch: GITHUB_BRANCH }),
  })
  if (!res.ok) throw new Error(`Failed to delete ${path}: ${res.status} ${res.statusText}`)
}

export async function fetchPrivateFile(pat, path) {
  const url = `${API_BASE}/repos/${GITHUB_OWNER}/${PRIVATE_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`
  const res = await fetch(url, { headers: headers(pat) })
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status} ${res.statusText}`)
  const json = await res.json()
  return { content: b64ToUtf8(json.content), sha: json.sha }
}

export async function savePrivateFile(pat, path, content, sha, message) {
  const body = {
    message: message || `chore: update ${path}`,
    content: utf8ToB64(content),
    sha,
    branch: GITHUB_BRANCH,
  }
  const url = `${API_BASE}/repos/${GITHUB_OWNER}/${PRIVATE_REPO}/contents/${path}`
  const res = await fetch(url, {
    method: 'PUT',
    headers: headers(pat),
    body: JSON.stringify(body),
  })
  if (res.status === 409) throw new Error('CONFLICT')
  if (!res.ok) throw new Error(`Failed to save ${path}: ${res.status} ${res.statusText}`)
  const json = await res.json()
  return { sha: json.content.sha }
}
