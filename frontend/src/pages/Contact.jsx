import { useSite } from '../context/SiteContext.jsx'
import {
  IconClock,
  IconFacebook,
  IconInstagram,
  IconMail,
  IconMapPin,
  IconPhone,
  IconTiktok,
  IconWhatsapp,
} from '../components/Icons.jsx'
import { callLink, prettyPhone, whatsappLink } from '../utils/format.js'

export default function Contact() {
  const { settings } = useSite()
  const phones = [settings.phone1, settings.phone2].filter(Boolean)

  const socials = [
    { key: 'instagram', label: 'Instagram', url: settings.instagram, icon: <IconInstagram /> },
    { key: 'tiktok', label: 'TikTok', url: settings.tiktok, icon: <IconTiktok /> },
    { key: 'facebook', label: 'Facebook', url: settings.facebook, icon: <IconFacebook /> },
  ].filter((s) => s.url)

  return (
    <>
      <div className="page-head">
        <div className="container">
          <h1>
            Nous <span className="gold-text">contacter</span>
          </h1>
          <p>Reservation par WhatsApp ou par telephone, 7 jours sur 7.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="phone-cards" style={{ maxWidth: 900, marginBottom: 44 }}>
            {phones.map((phone, index) => (
              <div className="phone-card" key={phone}>
                <small>Reservation {index + 1}</small>
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

          <div className="features">
            {settings.address && (
              <div className="feature">
                <div className="icon">
                  <IconMapPin />
                </div>
                <h3>Adresse</h3>
                <p>{settings.address}</p>
              </div>
            )}
            {settings.openingHours && (
              <div className="feature">
                <div className="icon">
                  <IconClock />
                </div>
                <h3>Horaires</h3>
                <p>{settings.openingHours}</p>
              </div>
            )}
            {settings.email && (
              <div className="feature">
                <div className="icon">
                  <IconMail />
                </div>
                <h3>Email</h3>
                <p>
                  <a href={`mailto:${settings.email}`}>{settings.email}</a>
                </p>
              </div>
            )}
          </div>

          {socials.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: 54 }}>
              <div className="divider" />
              <h2 style={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 800, marginBottom: 20 }}>
                Suivez-nous
              </h2>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
                {socials.map((social) => (
                  <a
                    key={social.key}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-ghost"
                  >
                    {social.icon}
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
