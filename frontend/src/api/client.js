// Petit client HTTP partage par tout le site.
// En developpement, Vite redirige /api vers http://localhost:8080 (voir vite.config.js).

const TOKEN_KEY = 'mlc_admin_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request(method, url, body, isForm = false) {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (!isForm && body !== undefined) headers['Content-Type'] = 'application/json'

  const response = await fetch(url, {
    method,
    headers,
    body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401 && url.startsWith('/api/admin')) {
    clearToken()
    if (!window.location.pathname.startsWith('/admin/login')) {
      window.location.href = '/admin/login'
    }
    throw new Error('Session expiree, veuillez vous reconnecter.')
  }

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(data?.error || `Erreur ${response.status}`)
  }
  return data
}

export const api = {
  get: (url) => request('GET', url),
  post: (url, body) => request('POST', url, body),
  put: (url, body) => request('PUT', url, body),
  patch: (url, body) => request('PATCH', url, body),
  del: (url) => request('DELETE', url),
  upload: (file) => {
    const form = new FormData()
    form.append('file', file)
    return request('POST', '/api/admin/upload', form, true)
  },
}
