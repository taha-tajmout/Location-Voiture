import crypto from 'node:crypto'
import { sql } from './db.js'

/**
 * Jetons signes HMAC-SHA256, au meme format que l'ancienne API Java :
 *   base64url(payload) + "." + base64url(signature)
 *   payload = username|expirationEnMillis
 */

const VALIDITY_HOURS = Number(process.env.APP_AUTH_TOKEN_VALIDITY_HOURS || 12)

/**
 * La cle de signature est conservee dans la base, pas dans une variable
 * d'environnement : la fonction Neon recoit deja DATABASE_URL automatiquement,
 * il n'y a donc aucun secret a configurer sur l'hebergeur. Elle est generee
 * au premier besoin, puis mise en cache pour la duree de l'isolat.
 */
let cachedSecret = null

async function secret() {
  if (cachedSecret) return cachedSecret
  if (process.env.APP_AUTH_SECRET) {
    cachedSecret = process.env.APP_AUTH_SECRET
    return cachedSecret
  }
  const db = sql()
  const generated = crypto.randomBytes(48).toString('base64url')
  await db`
    INSERT INTO app_secrets (key, value) VALUES ('auth', ${generated})
    ON CONFLICT (key) DO NOTHING`
  const rows = await db`SELECT value FROM app_secrets WHERE key = 'auth'`
  cachedSecret = rows[0].value
  return cachedSecret
}

async function sign(payload) {
  const key = await secret()
  return crypto.createHmac('sha256', key).update(payload, 'utf8').digest()
}

const b64 = (buf) => Buffer.from(buf).toString('base64url')

export async function createToken(username) {
  const payload = `${username}|${Date.now() + VALIDITY_HOURS * 3600_000}`
  return `${b64(Buffer.from(payload, 'utf8'))}.${b64(await sign(payload))}`
}

/** Retourne le nom d'utilisateur si le jeton est valide, sinon null. */
export async function verifyToken(token) {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 2) return null

  let payload
  let provided
  try {
    payload = Buffer.from(parts[0], 'base64url').toString('utf8')
    provided = Buffer.from(parts[1], 'base64url')
  } catch {
    return null
  }

  const expected = await sign(payload)
  if (provided.length !== expected.length) return null
  if (!crypto.timingSafeEqual(provided, expected)) return null

  const separator = payload.lastIndexOf('|')
  if (separator < 0) return null

  const expiresAt = Number(payload.slice(separator + 1))
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return null

  return payload.slice(0, separator)
}

/** Lit l'entete "Authorization: Bearer <token>". */
export async function usernameFromRequest(req) {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) return null
  return verifyToken(header.slice(7))
}
