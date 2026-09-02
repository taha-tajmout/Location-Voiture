/**
 * Cree le schema Postgres (Neon) et les donnees de depart.
 *
 *   npm run db:setup
 *
 * Idempotent : les tables ne sont creees que si elles manquent, et les donnees
 * de depart ne sont inserees que si les tables sont vides. Rien n'est supprime.
 */
import { readFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'

const here = dirname(fileURLToPath(import.meta.url))

function databaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL
  for (const candidate of ['../../../.env.local', '../../.env.local', '../.env.local']) {
    const file = resolve(here, candidate)
    if (!existsSync(file)) continue
    const match = readFileSync(file, 'utf8').match(/^DATABASE_URL=(.*)$/m)
    if (match) return match[1].trim().replace(/^["']|["']$/g, '')
  }
  throw new Error('DATABASE_URL introuvable (ni dans l environnement, ni dans .env.local)')
}

const sql = neon(databaseUrl())
const ADMIN_USERNAME = process.env.APP_ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.APP_ADMIN_PASSWORD || 'MehdiLuxury2026'
const photo = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`

async function createSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS vehicles (
      id BIGSERIAL PRIMARY KEY, name TEXT, brand TEXT,
      type TEXT NOT NULL DEFAULT 'CAR', category TEXT,
      price_per_day DOUBLE PRECISION DEFAULT 0, price_per_week DOUBLE PRECISION,
      price_per_month DOUBLE PRECISION, deposit DOUBLE PRECISION,
      image_url TEXT, images JSONB NOT NULL DEFAULT '[]'::jsonb,
      model_year INTEGER, transmission TEXT, fuel TEXT, seats INTEGER, doors INTEGER,
      engine TEXT, description TEXT,
      available BOOLEAN NOT NULL DEFAULT TRUE, featured BOOLEAN NOT NULL DEFAULT FALSE,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`

  await sql`
    CREATE TABLE IF NOT EXISTS reservations (
      id BIGSERIAL PRIMARY KEY, customer_name TEXT, customer_phone TEXT, customer_email TEXT,
      vehicle_id BIGINT, vehicle_name TEXT, start_date DATE, end_date DATE,
      pickup_place TEXT, message TEXT, status TEXT NOT NULL DEFAULT 'NEW',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`

  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY, site_name TEXT, phone1 TEXT, phone2 TEXT, country_code TEXT,
      email TEXT, address TEXT, city TEXT, instagram TEXT, tiktok TEXT, facebook TEXT,
      whatsapp_message TEXT, hero_title TEXT, hero_subtitle TEXT, hero_image_url TEXT,
      about_text TEXT, opening_hours TEXT, announcement TEXT,
      announcement_active BOOLEAN NOT NULL DEFAULT FALSE)`

  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id BIGSERIAL PRIMARY KEY, username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL, display_name TEXT DEFAULT 'Administrateur')`

  // Cle de signature des jetons admin : generee par l'API au premier besoin,
  // ce qui evite d'avoir un secret a configurer sur l'hebergeur.
  await sql`
    CREATE TABLE IF NOT EXISTS app_secrets (
      key TEXT PRIMARY KEY, value TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`

  await sql`CREATE INDEX IF NOT EXISTS vehicles_listing_idx ON vehicles (position, id DESC)`
  await sql`CREATE INDEX IF NOT EXISTS reservations_recent_idx ON reservations (created_at DESC)`
}

async function seedAdmin() {
  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM admin_users`
  if (count > 0) return 'compte admin deja present'
  await sql`
    INSERT INTO admin_users (username, password_hash, display_name)
    VALUES (${ADMIN_USERNAME}, ${bcrypt.hashSync(ADMIN_PASSWORD, 10)}, 'Nouali Car S.A.R.L')`
  return `compte admin cree (${ADMIN_USERNAME})`
}

async function seedSettings() {
  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM site_settings`
  if (count > 0) return 'parametres deja presents'
  await sql`
    INSERT INTO site_settings (id, site_name, phone1, phone2, country_code, email, address, city,
      instagram, tiktok, facebook, whatsapp_message, hero_title, hero_subtitle, hero_image_url,
      about_text, opening_hours, announcement, announcement_active)
    VALUES (1, 'Nouali Car', '0681142747', '', '212', NULL, 'Taourirt, Maroc', 'Taourirt',
      'https://www.instagram.com/nouali_car', NULL, NULL,
      'Bonjour Nouali Car, je souhaite reserver une voiture.',
      'Votre voiture a Taourirt',
      'Location de voitures a Taourirt, 24h/24. Reservation immediate par WhatsApp.',
      ${photo('1503376780353-7e6692767b70')},
      'Nouali Car S.A.R.L, agence de location de voitures a Taourirt. Vehicules entretenus, tarifs clairs et reservation immediate par WhatsApp, 24h/24.',
      'Ouvert 24h/24', NULL, FALSE)`
  return 'parametres du site crees'
}

const CARS = [
  ['Mercedes Classe A', 'Mercedes', 'Berline', 800, 4900, 17000, 10000, '1618843479313-40f8afb4b4d8', 2023, 'Automatique', 'Diesel', 5, 5, true, 'Berline compacte premium, ideale pour la ville comme pour les longs trajets.'],
  ['Golf 8 GTI', 'Volkswagen', 'Sportive', 700, 4200, 15000, 8000, '1617814076367-b759c7d7e738', 2022, 'Automatique', 'Essence', 5, 5, true, 'La reference des compactes sportives, confort et sensations.'],
  ['Range Rover Evoque', 'Land Rover', 'SUV', 1200, 7500, 26000, 15000, '1606664515524-ed2f786a0bd6', 2023, 'Automatique', 'Diesel', 5, 5, true, 'SUV de luxe au design marquant, parfait pour vos deplacements.'],
  ['Porsche 911 Carrera', 'Porsche', 'Sport', 3500, 21000, 70000, 40000, '1503376780353-7e6692767b70', 2022, 'Automatique', 'Essence', 4, 2, true, 'Une legende. Location a la journee pour occasions speciales et shootings.'],
  ['Dacia Duster', 'Dacia', 'SUV', 350, 2100, 7000, 4000, '1568605117036-5fe5e7bab0b7', 2023, 'Manuelle', 'Diesel', 5, 5, false, 'Le meilleur rapport qualite-prix de la flotte, robuste et economique.'],
  ['BMW Serie 3', 'BMW', 'Berline', 900, 5500, 19000, 12000, '1555215695-3004980ad54e', 2023, 'Automatique', 'Diesel', 5, 4, false, 'Berline dynamique, finition haut de gamme et boite automatique.'],
]

const MOTOS = [
  ['Yamaha MT-07', 'Yamaha', 'Roadster', 450, 2700, 9000, 6000, '1558981806-ec527fa84c39', 2023, '689 cc', true, 'Roadster nerveux et facile a prendre en main. Casques fournis.'],
  ['Honda PCX 125', 'Honda', 'Scooter', 200, 1200, 3800, 2500, '1568772585407-9361f9bf3a87', 2024, '125 cc', true, 'Scooter urbain economique, permis A1 ou equivalent.'],
  ['Kawasaki Z900', 'Kawasaki', 'Roadster', 600, 3600, 12000, 8000, '1449426468159-d96dbf08f19f', 2023, '948 cc', false, 'Pour les pilotes experimentes : puissance et style agressif.'],
  ['SYM Jet 14', 'SYM', 'Scooter', 150, 900, 3000, 2000, '1571068316344-75bc76f77890', 2024, '125 cc', false, 'Solution simple et economique pour circuler en ville.'],
]

async function seedVehicles() {
  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM vehicles`
  if (count > 0) return `${count} vehicule(s) deja presents`

  for (const [name, brand, category, day, week, month, deposit, img, year, transmission, fuel, seats, doors, featured, description] of CARS) {
    await sql`
      INSERT INTO vehicles (name, brand, type, category, price_per_day, price_per_week,
        price_per_month, deposit, image_url, model_year, transmission, fuel, seats, doors,
        featured, description)
      VALUES (${name}, ${brand}, 'CAR', ${category}, ${day}, ${week}, ${month}, ${deposit},
        ${photo(img)}, ${year}, ${transmission}, ${fuel}, ${seats}, ${doors}, ${featured}, ${description})`
  }
  for (const [name, brand, category, day, week, month, deposit, img, year, engine, featured, description] of MOTOS) {
    await sql`
      INSERT INTO vehicles (name, brand, type, category, price_per_day, price_per_week,
        price_per_month, deposit, image_url, model_year, engine, featured, description)
      VALUES (${name}, ${brand}, 'MOTO', ${category}, ${day}, ${week}, ${month}, ${deposit},
        ${photo(img)}, ${year}, ${engine}, ${featured}, ${description})`
  }
  return `${CARS.length + MOTOS.length} vehicules de demonstration crees`
}

console.log('Connexion a Neon...')
await createSchema()
console.log('  schema pret')
console.log(' ', await seedAdmin())
console.log(' ', await seedSettings())
console.log(' ', await seedVehicles())
console.log('Termine.')
