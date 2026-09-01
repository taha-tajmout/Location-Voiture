import { useEffect, useState } from 'react'
import { api } from '../api/client.js'
import { useSite } from '../context/SiteContext.jsx'
import { Loader } from '../components/Loader.jsx'
import { prettyPhone, whatsappLink } from '../utils/format.js'

/** Modification des numeros de reservation, reseaux sociaux et textes du site. */
export default function SettingsAdmin() {
  const { refresh } = useSite()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    api
      .get('/api/admin/settings')
      .then(setForm)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const set = (key) => (event) => {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const uploadHero = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { url } = await api.upload(file)
      setForm((prev) => ({ ...prev, heroImageUrl: url }))
    } catch (e) {
      setError(e.message)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const saved = await api.put('/api/admin/settings', form)
      setForm(saved)
      await refresh()
      setMessage('Parametres enregistres. Le site public est mis a jour.')
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader />
  if (!form) return <div className="alert alert-error">{error || 'Parametres indisponibles.'}</div>

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Parametres du site</h1>
          <p>Numeros de reservation, reseaux sociaux et contenu de la page d accueil.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <form onSubmit={submit} style={{ maxWidth: 900 }}>
        <div className="panel" style={{ marginBottom: 20 }}>
          <div className="form-section-title">Numeros de reservation (WhatsApp)</div>

          <div className="field-row">
            <div className="field">
              <label>Numero 1</label>
              <input value={form.phone1 || ''} onChange={set('phone1')} placeholder="0661536755" />
            </div>
            <div className="field">
              <label>Numero 2</label>
              <input value={form.phone2 || ''} onChange={set('phone2')} placeholder="0645424295" />
            </div>
            <div className="field">
              <label>Indicatif pays</label>
              <input value={form.countryCode || ''} onChange={set('countryCode')} placeholder="212" />
            </div>
          </div>

          <div className="field">
            <label>Message WhatsApp par defaut</label>
            <textarea
              value={form.whatsappMessage || ''}
              onChange={set('whatsappMessage')}
              placeholder="Bonjour, je souhaite reserver un vehicule."
            />
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[form.phone1, form.phone2].filter(Boolean).map((phone) => (
              <a
                key={phone}
                className="btn btn-ghost btn-sm"
                href={whatsappLink(phone, form.countryCode, form.whatsappMessage)}
                target="_blank"
                rel="noreferrer"
              >
                Tester {prettyPhone(phone)}
              </a>
            ))}
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 20 }}>
          <div className="form-section-title">Reseaux sociaux & contact</div>

          <div className="field-row">
            <div className="field">
              <label>Instagram (lien complet)</label>
              <input
                value={form.instagram || ''}
                onChange={set('instagram')}
                placeholder="https://www.instagram.com/..."
              />
            </div>
            <div className="field">
              <label>TikTok (lien complet)</label>
              <input value={form.tiktok || ''} onChange={set('tiktok')} placeholder="https://www.tiktok.com/@..." />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Facebook (optionnel)</label>
              <input value={form.facebook || ''} onChange={set('facebook')} placeholder="https://facebook.com/..." />
            </div>
            <div className="field">
              <label>Email</label>
              <input value={form.email || ''} onChange={set('email')} placeholder="contact@..." />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Adresse</label>
              <input value={form.address || ''} onChange={set('address')} placeholder="Ville, quartier..." />
            </div>
            <div className="field">
              <label>Horaires</label>
              <input value={form.openingHours || ''} onChange={set('openingHours')} />
            </div>
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 20 }}>
          <div className="form-section-title">Page d accueil</div>

          <div className="field">
            <label>Nom affiche du site</label>
            <input value={form.siteName || ''} onChange={set('siteName')} />
          </div>

          <div className="field">
            <label>Titre principal</label>
            <input value={form.heroTitle || ''} onChange={set('heroTitle')} />
          </div>

          <div className="field">
            <label>Sous-titre</label>
            <textarea value={form.heroSubtitle || ''} onChange={set('heroSubtitle')} />
          </div>

          <div className="field">
            <label>Image de fond (URL)</label>
            <input value={form.heroImageUrl || ''} onChange={set('heroImageUrl')} />
          </div>

          <div className="upload-zone">
            <input type="file" accept="image/*" onChange={uploadHero} disabled={uploading} />
            <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: 8 }}>
              {uploading ? 'Televersement...' : 'Ou televersez une image depuis votre ordinateur.'}
            </p>
            {form.heroImageUrl && <img className="upload-preview" src={form.heroImageUrl} alt="Apercu" />}
          </div>

          <div className="field">
            <label>Texte de presentation (pied de page)</label>
            <textarea value={form.aboutText || ''} onChange={set('aboutText')} />
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 24 }}>
          <div className="form-section-title">Bandeau d annonce</div>

          <label className="checkbox">
            <input type="checkbox" checked={!!form.announcementActive} onChange={set('announcementActive')} />
            <span>Afficher un bandeau en haut du site</span>
          </label>

          <div className="field">
            <label>Texte du bandeau</label>
            <input
              value={form.announcement || ''}
              onChange={set('announcement')}
              placeholder="Ex : -20% sur toutes les locations ce mois-ci"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-gold" disabled={saving || uploading}>
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </form>
    </>
  )
}
