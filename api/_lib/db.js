import { neon } from '@neondatabase/serverless'

/**
 * Connexion Postgres. Sur une fonction Neon, DATABASE_URL est injectee
 * automatiquement par la plateforme : aucun secret a configurer.
 */
let cached = null

export function sql() {
  if (!cached) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL manquante')
    cached = neon(url)
  }
  return cached
}

/* ------------------------------------------------------------------ */
/* Conversion base -> JSON attendu par le frontend (memes cles que     */
/* l'ancienne API Spring Boot, pour ne rien changer cote React).       */
/* ------------------------------------------------------------------ */

export function toVehicle(row) {
  if (!row) return null
  return {
    id: Number(row.id),
    name: row.name,
    brand: row.brand,
    type: row.type,
    category: row.category,
    pricePerDay: num(row.price_per_day),
    pricePerWeek: num(row.price_per_week),
    pricePerMonth: num(row.price_per_month),
    deposit: num(row.deposit),
    imageUrl: row.image_url,
    images: row.images || [],
    year: row.model_year,
    transmission: row.transmission,
    fuel: row.fuel,
    seats: row.seats,
    doors: row.doors,
    engine: row.engine,
    description: row.description,
    available: row.available,
    featured: row.featured,
    position: row.position,
    createdAt: row.created_at,
  }
}

export function toReservation(row) {
  if (!row) return null
  return {
    id: Number(row.id),
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    vehicleId: row.vehicle_id === null ? null : Number(row.vehicle_id),
    vehicleName: row.vehicle_name,
    startDate: isoDate(row.start_date),
    endDate: isoDate(row.end_date),
    pickupPlace: row.pickup_place,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  }
}

export function toSettings(row) {
  if (!row) return null
  return {
    id: 1,
    siteName: row.site_name,
    phone1: row.phone1,
    phone2: row.phone2,
    countryCode: row.country_code,
    email: row.email,
    address: row.address,
    city: row.city,
    instagram: row.instagram,
    tiktok: row.tiktok,
    facebook: row.facebook,
    whatsappMessage: row.whatsapp_message,
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
    heroImageUrl: row.hero_image_url,
    aboutText: row.about_text,
    openingHours: row.opening_hours,
    announcement: row.announcement,
    announcementActive: row.announcement_active,
  }
}

function num(value) {
  return value === null || value === undefined ? null : Number(value)
}

/**
 * DATE Postgres -> "AAAA-MM-JJ".
 *
 * Le pilote construit un Date a minuit *locale*. Passer par toISOString()
 * reculerait d'un jour sur tout fuseau a l'est de Greenwich : on lit donc les
 * composantes locales.
 */
function isoDate(value) {
  if (!value) return null
  if (!(value instanceof Date)) return String(value).slice(0, 10)
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${value.getFullYear()}-${month}-${day}`
}
