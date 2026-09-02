import bcrypt from 'bcryptjs'
import { sql, toVehicle, toReservation, toSettings } from './_lib/db.js'
import { createToken, usernameFromRequest } from './_lib/auth.js'

/**
 * Routeur de l'API. Signature (req, res) volontairement proche de Node/Express :
 * elle est facile a tester hors ligne, et index.js l'adapte au format
 * Request/Response attendu par les fonctions Neon.
 *
 * Les chemins et les reponses sont identiques a l'ancienne API Spring Boot,
 * le frontend React n'a donc rien a changer.
 */
export default async function router(req, res) {
  // Les segments sont deduits de l'URL : ne dependre d'aucun parametre de
  // routage propre a une plateforme rend le routeur portable.
  const segments = (req.url || '')
    .split('?')[0]
    .replace(/^\/api\/?/, '')
    .split('/')
    .filter(Boolean)
    .map((part) => {
      try {
        return decodeURIComponent(part)
      } catch {
        return part
      }
    })
  const method = req.method.toUpperCase()

  try {
    if (segments[0] === 'admin') {
      const username = await usernameFromRequest(req)
      if (!username) {
        return send(res, 401, { error: 'Session expiree ou non autorisee' })
      }
      return await adminRoutes(req, res, method, segments.slice(1), username)
    }
    return await publicRoutes(req, res, method, segments)
  } catch (error) {
    console.error('[api]', segments.join('/'), error)
    return send(res, 500, { error: 'Erreur serveur' })
  }
}

/* ------------------------------------------------------------------ */
/* Routes publiques                                                    */
/* ------------------------------------------------------------------ */

async function publicRoutes(req, res, method, seg) {
  const db = sql()

  // GET /api/settings
  if (seg[0] === 'settings' && seg.length === 1 && method === 'GET') {
    return send(res, 200, await readSettings(db))
  }

  // POST /api/auth/login
  if (seg[0] === 'auth' && seg[1] === 'login' && method === 'POST') {
    const { username, password } = body(req)
    const rows = await db`
      SELECT username, password_hash, display_name
      FROM admin_users WHERE username = ${String(username || '').trim()}`
    const admin = rows[0]
    if (!admin || !bcrypt.compareSync(String(password || ''), admin.password_hash)) {
      return send(res, 401, { error: 'Identifiant ou mot de passe incorrect' })
    }
    return send(res, 200, {
      token: await createToken(admin.username),
      username: admin.username,
      displayName: admin.display_name,
    })
  }

  if (seg[0] === 'vehicles') {
    // GET /api/vehicles/featured
    if (seg[1] === 'featured' && method === 'GET') {
      const rows = await db`
        SELECT * FROM vehicles
        WHERE featured = TRUE AND available = TRUE
        ORDER BY position ASC, id DESC`
      return send(res, 200, rows.map(toVehicle))
    }

    // GET /api/vehicles/:id
    if (seg.length === 2 && method === 'GET') {
      const id = Number(seg[1])
      if (!Number.isInteger(id)) return send(res, 404, { error: 'Vehicule introuvable' })
      const rows = await db`SELECT * FROM vehicles WHERE id = ${id}`
      if (!rows[0]) return send(res, 404, { error: 'Vehicule introuvable' })
      return send(res, 200, toVehicle(rows[0]))
    }

    // GET /api/vehicles?type=CAR&includeUnavailable=false
    if (seg.length === 1 && method === 'GET') {
      const type = parseType(req.query.type)
      const includeUnavailable = req.query.includeUnavailable !== 'false'
      const rows = await db`
        SELECT * FROM vehicles
        WHERE (${type}::text IS NULL OR type = ${type}::text)
          AND (${includeUnavailable}::boolean OR available = TRUE)
        ORDER BY position ASC, id DESC`
      return send(res, 200, rows.map(toVehicle))
    }
  }

  // POST /api/reservations
  if (seg[0] === 'reservations' && seg.length === 1 && method === 'POST') {
    const b = body(req)
    if (blank(b.customerName) || blank(b.customerPhone)) {
      return send(res, 400, { error: 'Le nom et le telephone sont obligatoires' })
    }

    let vehicleName = b.vehicleName
    if (b.vehicleId && blank(vehicleName)) {
      const rows = await db`SELECT name FROM vehicles WHERE id = ${Number(b.vehicleId)}`
      vehicleName = rows[0]?.name ?? null
    }

    const rows = await db`
      INSERT INTO reservations
        (customer_name, customer_phone, customer_email, vehicle_id, vehicle_name,
         start_date, end_date, pickup_place, message, status)
      VALUES
        (${b.customerName}, ${b.customerPhone}, ${b.customerEmail || null},
         ${b.vehicleId ? Number(b.vehicleId) : null}, ${vehicleName || null},
         ${b.startDate || null}, ${b.endDate || null},
         ${b.pickupPlace || null}, ${b.message || null}, 'NEW')
      RETURNING id`
    return send(res, 200, { id: Number(rows[0].id), message: 'Demande enregistree' })
  }

  return send(res, 404, { error: 'Route inconnue' })
}

/* ------------------------------------------------------------------ */
/* Routes du tableau de bord (jeton deja verifie)                      */
/* ------------------------------------------------------------------ */

async function adminRoutes(req, res, method, seg, username) {
  const db = sql()

  // GET /api/admin/me
  if (seg[0] === 'me' && method === 'GET') {
    const rows = await db`SELECT username, display_name FROM admin_users WHERE username = ${username}`
    if (!rows[0]) return send(res, 401, { error: 'Session expiree' })
    return send(res, 200, { username: rows[0].username, displayName: rows[0].display_name })
  }

  // POST /api/admin/password
  if (seg[0] === 'password' && method === 'POST') {
    const { currentPassword, newPassword } = body(req)
    const rows = await db`SELECT password_hash FROM admin_users WHERE username = ${username}`
    if (!rows[0]) return send(res, 401, { error: 'Session expiree' })
    if (!bcrypt.compareSync(String(currentPassword || ''), rows[0].password_hash)) {
      return send(res, 400, { error: 'Mot de passe actuel incorrect' })
    }
    if (!newPassword || String(newPassword).length < 6) {
      return send(res, 400, { error: 'Le nouveau mot de passe doit contenir au moins 6 caracteres' })
    }
    const hash = bcrypt.hashSync(String(newPassword), 10)
    await db`UPDATE admin_users SET password_hash = ${hash} WHERE username = ${username}`
    return send(res, 200, { message: 'Mot de passe mis a jour' })
  }

  // GET /api/admin/stats
  if (seg[0] === 'stats' && method === 'GET') {
    const [v] = await db`
      SELECT COUNT(*) AS total,
             COUNT(*) FILTER (WHERE type = 'CAR')  AS cars,
             COUNT(*) FILTER (WHERE type = 'MOTO') AS motos,
             COUNT(*) FILTER (WHERE available)     AS available
      FROM vehicles`
    const [r] = await db`
      SELECT COUNT(*) AS total,
             COUNT(*) FILTER (WHERE status = 'NEW') AS fresh
      FROM reservations`
    return send(res, 200, {
      totalVehicles: Number(v.total),
      cars: Number(v.cars),
      motos: Number(v.motos),
      available: Number(v.available),
      totalReservations: Number(r.total),
      newReservations: Number(r.fresh),
    })
  }

  if (seg[0] === 'settings') {
    if (method === 'GET') return send(res, 200, await readSettings(db))
    if (method === 'PUT') {
      const b = body(req)
      const rows = await db`
        UPDATE site_settings SET
          site_name = ${b.siteName ?? null}, phone1 = ${b.phone1 ?? null}, phone2 = ${b.phone2 ?? null},
          country_code = ${b.countryCode ?? null}, email = ${b.email ?? null},
          address = ${b.address ?? null}, city = ${b.city ?? null},
          instagram = ${b.instagram ?? null}, tiktok = ${b.tiktok ?? null}, facebook = ${b.facebook ?? null},
          whatsapp_message = ${b.whatsappMessage ?? null},
          hero_title = ${b.heroTitle ?? null}, hero_subtitle = ${b.heroSubtitle ?? null},
          hero_image_url = ${b.heroImageUrl ?? null}, about_text = ${b.aboutText ?? null},
          opening_hours = ${b.openingHours ?? null}, announcement = ${b.announcement ?? null},
          announcement_active = ${Boolean(b.announcementActive)}
        WHERE id = 1
        RETURNING *`
      return send(res, 200, toSettings(rows[0]))
    }
  }

  if (seg[0] === 'vehicles') {
    // GET /api/admin/vehicles
    if (seg.length === 1 && method === 'GET') {
      const rows = await db`SELECT * FROM vehicles ORDER BY position ASC, id DESC`
      return send(res, 200, rows.map(toVehicle))
    }

    // POST /api/admin/vehicles
    if (seg.length === 1 && method === 'POST') {
      const v = vehicleFields(body(req))
      const rows = await db`
        INSERT INTO vehicles
          (name, brand, type, category, price_per_day, price_per_week, price_per_month, deposit,
           image_url, images, model_year, transmission, fuel, seats, doors, engine, description,
           available, featured, position)
        VALUES
          (${v.name}, ${v.brand}, ${v.type}, ${v.category}, ${v.pricePerDay}, ${v.pricePerWeek},
           ${v.pricePerMonth}, ${v.deposit}, ${v.imageUrl}, ${JSON.stringify(v.images)}::jsonb,
           ${v.year}, ${v.transmission}, ${v.fuel}, ${v.seats}, ${v.doors}, ${v.engine},
           ${v.description}, ${v.available}, ${v.featured}, ${v.position})
        RETURNING *`
      return send(res, 200, toVehicle(rows[0]))
    }

    const id = Number(seg[1])
    if (!Number.isInteger(id)) return send(res, 404, { error: 'Vehicule introuvable' })

    // PATCH /api/admin/vehicles/:id/availability
    if (seg[2] === 'availability' && method === 'PATCH') {
      const rows = await db`
        UPDATE vehicles SET available = ${Boolean(body(req).available)}
        WHERE id = ${id} RETURNING *`
      if (!rows[0]) return send(res, 404, { error: 'Vehicule introuvable' })
      return send(res, 200, toVehicle(rows[0]))
    }

    // PUT /api/admin/vehicles/:id
    if (seg.length === 2 && method === 'PUT') {
      const v = vehicleFields(body(req))
      const rows = await db`
        UPDATE vehicles SET
          name = ${v.name}, brand = ${v.brand}, type = ${v.type}, category = ${v.category},
          price_per_day = ${v.pricePerDay}, price_per_week = ${v.pricePerWeek},
          price_per_month = ${v.pricePerMonth}, deposit = ${v.deposit},
          image_url = ${v.imageUrl}, images = ${JSON.stringify(v.images)}::jsonb,
          model_year = ${v.year}, transmission = ${v.transmission}, fuel = ${v.fuel},
          seats = ${v.seats}, doors = ${v.doors}, engine = ${v.engine},
          description = ${v.description}, available = ${v.available},
          featured = ${v.featured}, position = ${v.position}
        WHERE id = ${id}
        RETURNING *`
      if (!rows[0]) return send(res, 404, { error: 'Vehicule introuvable' })
      return send(res, 200, toVehicle(rows[0]))
    }

    // DELETE /api/admin/vehicles/:id
    if (seg.length === 2 && method === 'DELETE') {
      const rows = await db`DELETE FROM vehicles WHERE id = ${id} RETURNING id`
      if (!rows[0]) return send(res, 404, { error: 'Vehicule introuvable' })
      return send(res, 200, { message: 'Vehicule supprime' })
    }
  }

  if (seg[0] === 'reservations') {
    // GET /api/admin/reservations
    if (seg.length === 1 && method === 'GET') {
      const rows = await db`SELECT * FROM reservations ORDER BY created_at DESC`
      return send(res, 200, rows.map(toReservation))
    }

    const id = Number(seg[1])
    if (!Number.isInteger(id)) return send(res, 404, { error: 'Reservation introuvable' })

    // PATCH /api/admin/reservations/:id
    if (method === 'PATCH') {
      const status = body(req).status
      if (!['NEW', 'CONFIRMED', 'DONE', 'CANCELLED'].includes(status)) {
        return send(res, 400, { error: 'Statut invalide' })
      }
      const rows = await db`
        UPDATE reservations SET status = ${status} WHERE id = ${id} RETURNING *`
      if (!rows[0]) return send(res, 404, { error: 'Reservation introuvable' })
      return send(res, 200, toReservation(rows[0]))
    }

    // DELETE /api/admin/reservations/:id
    if (method === 'DELETE') {
      const rows = await db`DELETE FROM reservations WHERE id = ${id} RETURNING id`
      if (!rows[0]) return send(res, 404, { error: 'Reservation introuvable' })
      return send(res, 200, { message: 'Reservation supprimee' })
    }
  }

  // POST /api/admin/upload
  if (seg[0] === 'upload' && method === 'POST') {
    return send(res, 501, {
      error:
        "Le televersement de fichiers demande un stockage objet, pas encore branche. "
        + "En attendant, collez l'adresse de l'image dans le champ \"Photo principale\".",
    })
  }

  return send(res, 404, { error: 'Route inconnue' })
}

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

async function readSettings(db) {
  const rows = await db`SELECT * FROM site_settings WHERE id = 1`
  return toSettings(rows[0])
}

function vehicleFields(b) {
  return {
    name: b.name ?? null,
    brand: b.brand ?? null,
    type: b.type === 'MOTO' ? 'MOTO' : 'CAR',
    category: b.category ?? null,
    pricePerDay: nullableNumber(b.pricePerDay) ?? 0,
    pricePerWeek: nullableNumber(b.pricePerWeek),
    pricePerMonth: nullableNumber(b.pricePerMonth),
    deposit: nullableNumber(b.deposit),
    imageUrl: b.imageUrl ?? null,
    images: Array.isArray(b.images) ? b.images.filter(Boolean) : [],
    year: nullableNumber(b.year),
    transmission: b.transmission ?? null,
    fuel: b.fuel ?? null,
    seats: nullableNumber(b.seats),
    doors: nullableNumber(b.doors),
    engine: b.engine ?? null,
    description: b.description ?? null,
    available: b.available !== false,
    featured: Boolean(b.featured),
    position: nullableNumber(b.position) ?? 0,
  }
}

function nullableNumber(value) {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function parseType(value) {
  const type = String(value || '').trim().toUpperCase()
  return type === 'CAR' || type === 'MOTO' ? type : null
}

function blank(value) {
  return !value || String(value).trim() === ''
}

function body(req) {
  if (!req.body) return {}
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      return {}
    }
  }
  return req.body
}

function send(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8')
  return res.end(JSON.stringify(payload))
}
