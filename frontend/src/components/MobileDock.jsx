import { useEffect, useState } from 'react'
import { IconPhone, IconWhatsapp } from './Icons.jsx'
import { useSite } from '../context/SiteContext.jsx'
import { callLink, prettyPhone, whatsappLink } from '../utils/format.js'

/**
 * Barre d actions fixee en bas de l ecran, visible uniquement sur telephone
 * (voir .mobile-dock dans styles.css). Elle remplace le bouton flottant et
 * garde les deux actions de conversion toujours accessibles au pouce.
 * Si deux numeros sont configures, une feuille de choix s ouvre.
 */
export default function MobileDock() {
  const { settings } = useSite()
  const [sheet, setSheet] = useState(null) // 'call' | 'wa' | null

  const phones = [settings.phone1, settings.phone2].filter(Boolean)

  useEffect(() => {
    if (!sheet) return undefined
    const onEscape = (e) => e.key === 'Escape' && setSheet(null)
    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [sheet])

  if (phones.length === 0) return null

  const single = phones.length === 1
  const waHref = (phone) => whatsappLink(phone, settings.countryCode, settings.whatsappMessage)
  const isWa = sheet === 'wa'

  return (
    <>
      {sheet && (
        <>
          <button className="sheet-scrim" aria-label="Fermer" onClick={() => setSheet(null)} />
          <div className="sheet" role="dialog" aria-modal="true">
            <div className="sheet-handle" />
            <span className="sheet-title">
              {isWa ? 'Reserver par WhatsApp' : 'Appeler l agence'}
            </span>
            {phones.map((phone) => (
              <a
                key={phone}
                className="sheet-item"
                href={isWa ? waHref(phone) : callLink(phone)}
                target={isWa ? '_blank' : undefined}
                rel={isWa ? 'noreferrer' : undefined}
                onClick={() => setSheet(null)}
              >
                {isWa ? <IconWhatsapp width={19} height={19} /> : <IconPhone width={19} height={19} />}
                {prettyPhone(phone)}
              </a>
            ))}
            <button className="btn btn-dark btn-block" onClick={() => setSheet(null)}>
              Fermer
            </button>
          </div>
        </>
      )}

      <nav className="mobile-dock" aria-label="Contact rapide">
        {single ? (
          <a className="dock-btn call" href={callLink(phones[0])}>
            <IconPhone width={17} height={17} />
            Appeler
          </a>
        ) : (
          <button className="dock-btn call" onClick={() => setSheet('call')}>
            <IconPhone width={17} height={17} />
            Appeler
          </button>
        )}

        {single ? (
          <a className="dock-btn wa" href={waHref(phones[0])} target="_blank" rel="noreferrer">
            <IconWhatsapp width={18} height={18} />
            WhatsApp
          </a>
        ) : (
          <button className="dock-btn wa" onClick={() => setSheet('wa')}>
            <IconWhatsapp width={18} height={18} />
            WhatsApp
          </button>
        )}
      </nav>
    </>
  )
}
