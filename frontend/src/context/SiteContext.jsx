import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client.js'

const SiteContext = createContext(null)

const FALLBACK = {
  siteName: 'Mehdi Luxury Cars',
  phone1: '0661536755',
  phone2: '0645424295',
  countryCode: '212',
  whatsappMessage: 'Bonjour Mehdi Luxury Cars, je souhaite reserver un vehicule.',
  heroTitle: "Louez l'exception",
  heroSubtitle: 'Voitures et motos de luxe a la location.',
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
