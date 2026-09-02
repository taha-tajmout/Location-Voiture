import router from './router.js'

/**
 * Point d'entree de la fonction Neon.
 *
 * Neon attend un export par defaut exposant `fetch(request) -> Response`
 * (standard web). Cet adaptateur traduit ce format vers la signature
 * (req, res) du routeur, qui reste ainsi testable hors ligne et portable.
 *
 * DATABASE_URL est injectee automatiquement par Neon : aucun secret de base
 * de donnees n'a besoin d'etre configure sur l'hebergeur du site.
 */

/** L'API est publique et appelee depuis un autre domaine (Netlify, Vercel). */
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() })
    }

    const url = new URL(request.url)

    let parsedBody
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const text = await request.text()
      if (text) {
        try {
          parsedBody = JSON.parse(text)
        } catch {
          parsedBody = undefined
        }
      }
    }

    const req = {
      method: request.method,
      url: url.pathname + url.search,
      headers: Object.fromEntries(request.headers),
      query: Object.fromEntries(url.searchParams),
      body: parsedBody,
    }

    let status = 200
    const headers = { ...corsHeaders() }
    let payload = ''

    const res = {
      status(code) {
        status = code
        return res
      },
      setHeader(key, value) {
        headers[key] = value
        return res
      },
      end(data) {
        payload = data ?? ''
        return res
      },
    }

    await router(req, res)
    return new Response(payload, { status, headers })
  },
}
