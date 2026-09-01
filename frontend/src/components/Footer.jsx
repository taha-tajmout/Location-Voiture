import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'
import { IconFacebook, IconInstagram, IconMail, IconMapPin, IconPhone, IconTiktok } from './Icons.jsx'
import { useSite } from '../context/SiteContext.jsx'
import { callLink, prettyPhone } from '../utils/format.js'

export default function Footer() {
  const { settings } = useSite()
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand" style={{ marginBottom: 16 }}>
              <Logo height={54} />
            </div>
            <p>{settings.aboutText}</p>
            <div className="socials">
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
                  <IconInstagram />
                </a>
              )}
              {settings.tiktok && (
                <a href={settings.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok">
                  <IconTiktok />
                </a>
              )}
              {settings.facebook && (
                <a href={settings.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
                  <IconFacebook />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4>Navigation</h4>
            <ul>
              <li>
                <Link to="/">Accueil</Link>
              </li>
              <li>
                <Link to="/voitures">Nos voitures</Link>
              </li>
              <li>
                <Link to="/motos">Nos motos</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Reservation</h4>
            <ul>
              {settings.phone1 && (
                <li>
                  <a href={callLink(settings.phone1)} style={{ display: 'flex', gap: 9 }}>
                    <IconPhone width={17} height={17} /> {prettyPhone(settings.phone1)}
                  </a>
                </li>
              )}
              {settings.phone2 && (
                <li>
                  <a href={callLink(settings.phone2)} style={{ display: 'flex', gap: 9 }}>
                    <IconPhone width={17} height={17} /> {prettyPhone(settings.phone2)}
                  </a>
                </li>
              )}
              {settings.email && (
                <li>
                  <a href={`mailto:${settings.email}`} style={{ display: 'flex', gap: 9 }}>
                    <IconMail width={17} height={17} /> {settings.email}
                  </a>
                </li>
              )}
              {settings.address && (
                <li style={{ display: 'flex', gap: 9 }}>
                  <IconMapPin width={17} height={17} /> {settings.address}
                </li>
              )}
              {settings.openingHours && <li>{settings.openingHours}</li>}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {year} {settings.siteName}. Tous droits reserves.
          </span>
          <Link to="/admin/login">Espace administrateur</Link>
        </div>
      </div>
    </footer>
  )
}
