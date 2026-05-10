const BASE = 'https://api.github.com'

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

export async function listDir(token, owner, repo, path, branch) {
  const url = `${BASE}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
  const res = await fetch(url, { headers: headers(token) })
  if (res.status === 404) return []
  if (!res.ok) throw new Error(`GitHub LIST ${path} failed: ${res.status}`)
  const items = await res.json()
  return Array.isArray(items) ? items.map(i => i.name) : []
}

export async function getFile(token, owner, repo, path, branch) {
  const url = `${BASE}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
  const res = await fetch(url, { headers: headers(token) })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GitHub GET ${path} failed: ${res.status}`)
  return res.json()
}

export async function putFile(token, owner, repo, path, branch, content, sha) {
  const url = `${BASE}/repos/${owner}/${repo}/contents/${path}`
  const body = {
    message: `chore: update ${path}`,
    content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
    branch,
    ...(sha ? { sha } : {}),
  }
  const res = await fetch(url, { method: 'PUT', headers: headers(token), body: JSON.stringify(body) })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GitHub PUT ${path} failed: ${res.status} ${err}`)
  }
  return res.json()
}
