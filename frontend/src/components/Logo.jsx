import { useEffect, useState } from 'react'

const CUSTOM_LOGO = '/logo.png'
const FALLBACK_LOGO = '/logo-mark.svg'

// Resultat du test partage par tous les composants (une seule verification).
let cachedLogo = null
let probe = null

function probeCustomLogo() {
  if (cachedLogo) return Promise.resolve(cachedLogo)
  if (probe) return probe
  probe = new Promise((resolve) => {
    const image = new Image()
    image.onload = () => resolve((cachedLogo = image.naturalWidth > 0 ? CUSTOM_LOGO : FALLBACK_LOGO))
    image.onerror = () => resolve((cachedLogo = FALLBACK_LOGO))
    image.src = CUSTOM_LOGO
  })
  return probe
}

/**
 * Affiche le logo officiel s'il est present dans frontend/public/logo.png,
 * sinon un logo vectoriel de secours aux memes couleurs.
 */
export default function Logo({ height = 46, withText = true }) {
  const [src, setSrc] = useState(cachedLogo || FALLBACK_LOGO)

  useEffect(() => {
    let active = true
    probeCustomLogo().then((result) => active && setSrc(result))
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <img src={src} alt="Nouali Car S.A.R.L" style={{ height, width: 'auto' }} />
      {withText && (
        <span className="brand-text">
          <strong className="gold-text">NOUALI</strong>
          <span>Car S.A.R.L</span>
        </span>
      )}
    </>
  )
}
