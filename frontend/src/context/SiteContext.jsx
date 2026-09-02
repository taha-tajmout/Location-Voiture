import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client.js'

const SiteContext = createContext(null)

const FALLBACK = {
  siteName: 'Nouali Car',
  phone1: '0681142747',
  phone2: '',
  countryCode: '212',
  whatsappMessage: 'Bonjour Nouali Car, je souhaite reserver une voiture.',
  heroTitle: 'Votre voiture a Taourirt',
  heroSubtitle: 'Location de voitures a Taourirt, 24h/24. Reservation immediate par WhatsApp.',
}

/** Rend les parametres du site (numeros, reseaux, textes) disponibles partout. */
export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACK)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const data = await api.get('/api/settings')
      setSettings({ ...FALLBACK, ...data })
    } catch (e) {
      console.warn('Parametres indisponibles, valeurs par defaut utilisees.', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const value = useMemo(() => ({ settings, loading, refresh }), [settings, loading, refresh])
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export function useSite() {
  const context = useContext(SiteContext)
  if (!context) throw new Error('useSite doit etre utilise dans SiteProvider')
  return context
}
