/**
 * Verifie l'API sans deployer : appelle directement le routeur avec de
 * fausses requetes, contre la vraie base Neon.
 *
 *   npm test
 */
import { readFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

if (!process.env.DATABASE_URL) {
  for (const candidate of ['../../../.env.local', '../../.env.local', '../.env.local']) {
    const file = resolve(here, candidate)
    if (!existsSync(file)) continue
    const match = readFileSync(file, 'utf8').match(/^DATABASE_URL=(.*)$/m)
    if (match) {
      process.env.DATABASE_URL = match[1].trim().replace(/^["']|["']$/g, '')
      break
    }
  }
}
process.env.APP_AUTH_SECRET ||= 'smoke-test-secret'

const { default: router } = await import('../router.js')

async function call(method, path, { body, query = {}, token } = {}) {
  const search = new URLSearchParams(query).toString()
  const state = { code: 200, body: '' }
  const res = {
    status(code) {
      state.code = code
      return res
    },
    setHeader() {
      return res
    },
    end(payload) {
      state.body = payload
      return res
    },
  }
  await router(
    {
      method,
      body,
      url: `${path}${search ? `?${search}` : ''}`,
      headers: token ? { authorization: `Bearer ${token}` } : {},
      query,
    },
    res,
  )
  let parsed
  try {
    parsed = JSON.parse(state.body)
  } catch {
    parsed = state.body
  }
  return { status: state.code, body: parsed }
}

let passed = 0
let failed = 0
function check(label, ok, detail) {
  if (ok) {
    passed += 1
    console.log(`  OK    ${label}`)
  } else {
    failed += 1
    console.log(`  ECHEC ${label}${detail ? ` -> ${detail}` : ''}`)
  }
}

console.log('Routes publiques')
const settings = await call('GET', '/api/settings')
check('GET /api/settings', settings.status === 200 && settings.body.siteName === 'Nouali Car',
  JSON.stringify(settings.body).slice(0, 120))

const all = await call('GET', '/api/vehicles')
check('GET /api/vehicles', all.status === 200 && all.body.length === 10, `${all.body.length} resultats`)

const cars = await call('GET', '/api/vehicles', { query: { type: 'CAR' } })
check('GET /api/vehicles?type=CAR', cars.status === 200 && cars.body.length === 6, `${cars.body.length}`)

const motos = await call('GET', '/api/vehicles', { query: { type: 'MOTO' } })
check('GET /api/vehicles?type=MOTO', motos.status === 200 && motos.body.length === 4, `${motos.body.length}`)

const dispo = await call('GET', '/api/vehicles', { query: { includeUnavailable: 'false' } })
check('GET /api/vehicles (disponibles)', dispo.status === 200 && dispo.body.every((v) => v.available))

const featured = await call('GET', '/api/vehicles/featured')
check('GET /api/vehicles/featured', featured.status === 200 && featured.body.length > 0
  && featured.body.every((v) => v.featured && v.available), `${featured.body.length}`)

const one = await call('GET', `/api/vehicles/${all.body[0].id}`)
check('GET /api/vehicles/:id', one.status === 200 && one.body.id === all.body[0].id)
check('  forme du vehicule', one.body.pricePerDay !== undefined && Array.isArray(one.body.images)
  && one.body.year !== undefined)

check('GET /api/vehicles/:id inconnu -> 404', (await call('GET', '/api/vehicles/999999')).status === 404)
check('POST /api/reservations sans nom -> 400',
  (await call('POST', '/api/reservations', { body: { customerName: '' } })).status === 400)

const reservation = await call('POST', '/api/reservations', {
  body: {
    customerName: 'Test Automatique', customerPhone: '0600000000', vehicleId: all.body[0].id,
    startDate: '2026-10-01', endDate: '2026-10-04', message: 'Test, a supprimer.',
  },
})
check('POST /api/reservations', reservation.status === 200 && reservation.body.id > 0)

console.log('\nAuthentification')
check('login mot de passe invalide -> 401',
  (await call('POST', '/api/auth/login', { body: { username: 'admin', password: 'faux' } })).status === 401)

const login = await call('POST', '/api/auth/login', {
  body: { username: 'admin', password: process.env.APP_ADMIN_PASSWORD || 'MehdiLuxury2026' },
})
check('login valide', login.status === 200 && typeof login.body.token === 'string')
const token = login.body.token

check('admin sans jeton -> 401', (await call('GET', '/api/admin/vehicles')).status === 401)
check('admin jeton invalide -> 401',
  (await call('GET', '/api/admin/vehicles', { token: 'nimporte.quoi' })).status === 401)

console.log('\nRoutes admin')
const me = await call('GET', '/api/admin/me', { token })
check('GET /api/admin/me', me.status === 200 && me.body.username === 'admin')

const stats = await call('GET', '/api/admin/stats', { token })
check('GET /api/admin/stats', stats.status === 200 && stats.body.totalVehicles === 10
  && stats.body.cars === 6 && stats.body.motos === 4, JSON.stringify(stats.body))

check('GET /api/admin/vehicles', (await call('GET', '/api/admin/vehicles', { token })).body.length === 10)

const created = await call('POST', '/api/admin/vehicles', {
  token,
  body: {
    name: 'Vehicule de test', brand: 'Test', type: 'CAR', category: 'Berline',
    pricePerDay: 123, images: ['https://exemple.test/a.jpg'], year: 2025, seats: 5,
  },
})
check('POST /api/admin/vehicles', created.status === 200 && created.body.pricePerDay === 123,
  JSON.stringify(created.body).slice(0, 140))
check('  liste images conservee', Array.isArray(created.body.images) && created.body.images.length === 1)

const updated = await call('PUT', `/api/admin/vehicles/${created.body.id}`, {
  token, body: { ...created.body, name: 'Modifie', pricePerDay: 456 },
})
check('PUT /api/admin/vehicles/:id', updated.status === 200 && updated.body.pricePerDay === 456)

const toggled = await call('PATCH', `/api/admin/vehicles/${created.body.id}/availability`, {
  token, body: { available: false },
})
check('PATCH .../availability', toggled.status === 200 && toggled.body.available === false)

const reservations = await call('GET', '/api/admin/reservations', { token })
check('GET /api/admin/reservations', reservations.status === 200 && reservations.body.length > 0)
const mine = reservations.body.find((r) => r.id === reservation.body.id)
check('  dates au format AAAA-MM-JJ', mine?.startDate === '2026-10-01', String(mine?.startDate))

check('PATCH /api/admin/reservations/:id',
  (await call('PATCH', `/api/admin/reservations/${reservation.body.id}`,
    { token, body: { status: 'CONFIRMED' } })).body.status === 'CONFIRMED')
check('statut invalide -> 400',
  (await call('PATCH', `/api/admin/reservations/${reservation.body.id}`,
    { token, body: { status: 'INVENTE' } })).status === 400)

const saved = await call('PUT', '/api/admin/settings', { token, body: settings.body })
check('PUT /api/admin/settings', saved.status === 200 && saved.body.siteName === 'Nouali Car')
check('POST /api/admin/upload -> 501 explicite',
  (await call('POST', '/api/admin/upload', { token })).status === 501)
check('route inconnue -> 404', (await call('GET', '/api/nimportequoi')).status === 404)

console.log('\nNettoyage')
check('DELETE /api/admin/vehicles/:id',
  (await call('DELETE', `/api/admin/vehicles/${created.body.id}`, { token })).status === 200)
check('DELETE /api/admin/reservations/:id',
  (await call('DELETE', `/api/admin/reservations/${reservation.body.id}`, { token })).status === 200)

console.log(`\n${passed} test(s) reussi(s), ${failed} echec(s)`)
process.exit(failed === 0 ? 0 : 1)
