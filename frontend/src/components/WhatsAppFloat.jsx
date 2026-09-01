import { useState } from 'react'
import { IconWhatsapp } from './Icons.jsx'
import { useSite } from '../context/SiteContext.jsx'
import { prettyPhone, whatsappLink } from '../utils/format.js'

/** Bouton flottant : ouvre le choix entre les deux numeros de reservation. */
export default function WhatsAppFloat() {
  const { settings } = useSite()
  const [open, setOpen] = useState(false)

  const phones = [settings.phone1, settings.phone2].filter(Boolean)
  if (phones.length === 0) return null

  return (
    <div className="wa-float">
      <button
        className="wa-main"
        onClick={() => setOpen((v) => !v)}
        aria-label="Reserver par WhatsApp"
        title="Reserver par WhatsApp"
      >
        {open ? <span style={{ fontSize: 22, fontWeight: 700 }}>✕</span> : <IconWhatsapp width={28} height={28} />}
      </button>

      {open && (
        <div className="wa-list">
          <small>Reserver par WhatsApp</small>
          {phones.map((phone) => (
            <a
              key={phone}
              href={whatsappLink(phone, settings.countryCode, settings.whatsappMessage)}
              target="_blank"
              rel="noreferrer"
            >
              <IconWhatsapp width={18} height={18} />
              {prettyPhone(phone)}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
