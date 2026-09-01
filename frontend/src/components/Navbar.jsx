import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Logo from './Logo.jsx'
import { IconWhatsapp } from './Icons.jsx'
import { useSite } from '../context/SiteContext.jsx'
import { whatsappLink } from '../utils/format.js'

export default function Navbar() {
  const { settings } = useSite()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const wa = whatsappLink(settings.phone1, settings.countryCode, settings.whatsappMessage)

  return (
    <>
      {settings.announcementActive && settings.announcement && (
        <div className="announcement">{settings.announcement}</div>
      )}

      <header className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="container inner">
          <Link to="/" className="brand">
            <Logo height={46} />
          </Link>

          <nav className={`nav-links${open ? ' open' : ''}`}>
            <NavLink to="/" end>
              Accueil
            </NavLink>
            <NavLink to="/voitures">Voitures</NavLink>
            <NavLink to="/motos">Motos</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </nav>

          <div className="nav-actions">
            <a href={wa} target="_blank" rel="noreferrer" className="btn btn-gold btn-sm">
              <IconWhatsapp width={16} height={16} />
              Reserver
            </a>
            <button
              className="burger"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={open}
            >
              {open ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
