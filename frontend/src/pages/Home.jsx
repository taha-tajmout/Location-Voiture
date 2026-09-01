import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'
import { useSite } from '../context/SiteContext.jsx'
import VehicleCard from '../components/VehicleCard.jsx'
import { Loader, Empty } from '../components/Loader.jsx'
import {
  IconArrowRight,
  IconCar,
  IconClock,
  IconKey,
  IconMoto,
  IconPhone,
  IconShield,
  IconWhatsapp,
} from '../components/Icons.jsx'
import { callLink, prettyPhone, whatsappLink } from '../utils/format.js'

const FEATURES = [
  {
    icon: <IconShield />,
    title: 'Vehicules verifies',
    text: 'Entretien regulier, controle avant chaque location et assurance a jour.',
  },
  {
    icon: <IconClock />,
    title: 'Reservation rapide',
    text: 'Un message WhatsApp suffit. Reponse et confirmation en quelques minutes.',
  },
  {
    icon: <IconKey />,
    title: 'Livraison possible',
    text: 'Nous vous livrons le vehicule a l adresse de votre choix selon la zone.',
  },
  {
    icon: <IconCar />,
    title: 'Tarifs transparents',
    text: 'Prix a la journee, a la semaine et au mois affiches, sans frais caches.',
  },
]

export default function Home() {
  const { settings } = useSite()
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/api/vehicles/featured')
      .then(setFeatured)
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false))
  }, [])

  const phones = [settings.phone1, settings.phone2].filter(Boolean)
  const heroBg =
    settings.heroImageUrl ||
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1800&q=80'

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="hero">
        <div className="hero-bg" style={{ backgroundImage: `url(${heroBg})` }} />
        <div className="container hero-content">
          <span className="hero-badge">Location de voitures et motos</span>
          <h1>
            {settings.heroTitle?.split(' ').slice(0, -1).join(' ')}{' '}
            <span className="gold-text">{settings.heroTitle?.split(' ').slice(-1)}</span>
          </h1>
          <p>{settings.heroSubtitle}</p>

          <div className="hero-actions">
            <Link to="/voitures" className="btn btn-gold">
              <IconCar width={17} height={17} />
              Nos voitures
            </Link>
            <Link to="/motos" className="btn btn-ghost">
              <IconMoto width={17} height={17} />
              Nos motos
            </Link>
            {phones[0] && (
              <a
                href={whatsappLink(phones[0], settings.countryCode, settings.whatsappMessage)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-whatsapp"
              >
                <IconWhatsapp width={17} height={17} />
                Reserver
              </a>
            )}
          </div>

          <div className="hero-stats">
            <div>
              <strong className="gold-text">24/7</strong>
              <span>Disponibilite</span>
            </div>
            <div>
              <strong className="gold-text">0 DH</strong>
              <span>Frais de dossier</span>
            </div>
            <div>
              <strong className="gold-text">100%</strong>
              <span>Vehicules assures</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Selection ---------------- */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="divider" />
            <span className="eyebrow">Notre selection</span>
            <h2>
              A la <span className="gold-text">une</span>
            </h2>
            <p>Les vehicules les plus demandes de notre flotte, disponibles a la reservation.</p>
          </div>

          {loading ? (
            <Loader />
          ) : featured.length === 0 ? (
            <Empty label="Aucun vehicule en vedette pour le moment." />
          ) : (
            <div className="grid">
              {featured.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/vehicules" className="btn btn-ghost">
              Voir toute la flotte
              <IconArrowRight width={17} height={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- Atouts ---------------- */}
      <section className="section" style={{ background: 'var(--black-soft)', borderTop: '1px solid var(--line)' }}>
        <div className="container">
          <div className="section-head">
            <div className="divider" />
            <span className="eyebrow">Pourquoi nous</span>
            <h2>
              Le service <span className="gold-text">Mehdi</span>
            </h2>
          </div>

          <div className="features">
            {FEATURES.map((feature) => (
              <div className="feature" key={feature.title}>
                <div className="icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Appel a l action ---------------- */}
      <section className="cta-band">
        <div className="container">
          <h2>
            Reservez <span className="gold-text">maintenant</span>
          </h2>
          <p>Contactez-nous directement sur WhatsApp, nous vous repondons rapidement.</p>

          <div className="phone-cards">
            {phones.map((phone, index) => (
              <div className="phone-card" key={phone}>
                <small>Numero de reservation {index + 1}</small>
                <strong className="gold-text">{prettyPhone(phone)}</strong>
                <div className="row">
                  <a
                    href={whatsappLink(phone, settings.countryCode, settings.whatsappMessage)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-whatsapp btn-sm"
                  >
                    <IconWhatsapp width={16} height={16} />
                    WhatsApp
                  </a>
                  <a href={callLink(phone)} className="btn btn-ghost btn-sm">
                    <IconPhone width={16} height={16} />
                    Appeler
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
