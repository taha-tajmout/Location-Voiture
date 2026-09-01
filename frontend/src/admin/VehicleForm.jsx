import { useEffect, useState } from 'react'
import { api } from '../api/client.js'

const EMPTY = {
  name: '',
  brand: '',
  type: 'CAR',
  category: '',
  pricePerDay: '',
  pricePerWeek: '',
  pricePerMonth: '',
  deposit: '',
  imageUrl: '',
  images: [],
  year: '',
  transmission: 'Automatique',
  fuel: 'Diesel',
  seats: 5,
  doors: 5,
  engine: '',
  description: '',
  available: true,
  featured: false,
  position: 0,
}

const numberOrNull = (value) => (value === '' || value === null || value === undefined ? null : Number(value))

/** Formulaire d'ajout / modification d'un vehicule (voiture ou moto). */
export default function VehicleForm({ vehicle, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY)
  const [gallery, setGallery] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (vehicle) {
      setForm({ ...EMPTY, ...vehicle })
      setGallery((vehicle.images || []).join('\n'))
    } else {
      setForm(EMPTY)
      setGallery('')
    }
  }, [vehicle])

  const set = (key) => (event) => {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const upload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const { url } = await api.upload(file)
      setForm((prev) => ({ ...prev, imageUrl: url }))
    } catch (e) {
      setError(e.message)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!form.name.trim()) {
      setError('Le nom du vehicule est obligatoire.')
      return
    }
    setSaving(true)
    setError('')

    const payload = {
      ...form,
      pricePerDay: numberOrNull(form.pricePerDay) ?? 0,
      pricePerWeek: numberOrNull(form.pricePerWeek),
      pricePerMonth: numberOrNull(form.pricePerMonth),
      deposit: numberOrNull(form.deposit),
      year: numberOrNull(form.year),
      seats: form.type === 'MOTO' ? null : numberOrNull(form.seats),
      doors: form.type === 'MOTO' ? null : numberOrNull(form.doors),
      position: numberOrNull(form.position) ?? 0,
      images: gallery
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    }

    try {
      if (vehicle?.id) await api.put(`/api/admin/vehicles/${vehicle.id}`, payload)
      else await api.post('/api/admin/vehicles', payload)
      onSaved()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const isMoto = form.type === 'MOTO'

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h2>{vehicle ? 'Modifier le vehicule' : 'Ajouter un vehicule'}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-section-title">Informations generales</div>

            <div className="field-row">
              <div className="field">
                <label>Type *</label>
                <select value={form.type} onChange={set('type')}>
                  <option value="CAR">Voiture</option>
                  <option value="MOTO">Moto</option>
                </select>
              </div>
              <div className="field">
                <label>Nom / Modele *</label>
                <input value={form.name} onChange={set('name')} placeholder="Ex : Golf 8 GTI" required />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label>Marque</label>
                <input value={form.brand || ''} onChange={set('brand')} placeholder="Ex : Volkswagen" />
              </div>
              <div className="field">
                <label>Categorie</label>
                <input
                  value={form.category || ''}
                  onChange={set('category')}
                  placeholder={isMoto ? 'Scooter, Roadster...' : 'Berline, SUV, Sport...'}
                />
              </div>
              <div className="field">
                <label>Annee</label>
                <input type="number" value={form.year || ''} onChange={set('year')} placeholder="2023" />
              </div>
            </div>

            <div className="form-section-title">Tarifs (DH)</div>

            <div className="field-row">
              <div className="field">
                <label>Prix / jour *</label>
                <input type="number" step="any" value={form.pricePerDay} onChange={set('pricePerDay')} required />
              </div>
              <div className="field">
                <label>Prix / semaine</label>
                <input type="number" step="any" value={form.pricePerWeek || ''} onChange={set('pricePerWeek')} />
              </div>
              <div className="field">
                <label>Prix / mois</label>
                <input type="number" step="any" value={form.pricePerMonth || ''} onChange={set('pricePerMonth')} />
              </div>
              <div className="field">
                <label>Caution</label>
                <input type="number" step="any" value={form.deposit || ''} onChange={set('deposit')} />
              </div>
            </div>

            <div className="form-section-title">Caracteristiques</div>

            <div className="field-row">
              {isMoto ? (
                <div className="field">
                  <label>Cylindree</label>
                  <input value={form.engine || ''} onChange={set('engine')} placeholder="Ex : 125 cc" />
                </div>
              ) : (
                <>
                  <div className="field">
                    <label>Boite de vitesses</label>
                    <select value={form.transmission || ''} onChange={set('transmission')}>
                      <option value="Automatique">Automatique</option>
                      <option value="Manuelle">Manuelle</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Places</label>
                    <input type="number" value={form.seats ?? ''} onChange={set('seats')} />
                  </div>
                  <div className="field">
                    <label>Portes</label>
                    <input type="number" value={form.doors ?? ''} onChange={set('doors')} />
                  </div>
                </>
              )}
              <div className="field">
                <label>Carburant</label>
                <select value={form.fuel || ''} onChange={set('fuel')}>
                  <option value="Diesel">Diesel</option>
                  <option value="Essence">Essence</option>
                  <option value="Hybride">Hybride</option>
                  <option value="Electrique">Electrique</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>Description</label>
              <textarea
                value={form.description || ''}
                onChange={set('description')}
                placeholder="Texte affiche sur la fiche du vehicule"
              />
            </div>

            <div className="form-section-title">Photos</div>

            <div className="upload-zone">
              <input type="file" accept="image/*" onChange={upload} disabled={uploading} />
              <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: 8 }}>
                {uploading ? 'Televersement en cours...' : 'Choisissez une image depuis votre ordinateur (jpg, png, webp).'}
              </p>
              {form.imageUrl && <img className="upload-preview" src={form.imageUrl} alt="Apercu" />}
            </div>

            <div className="field">
              <label>Photo principale (URL)</label>
              <input value={form.imageUrl || ''} onChange={set('imageUrl')} placeholder="https://... ou /uploads/..." />
            </div>

            <div className="field">
              <label>Photos supplementaires (une URL par ligne)</label>
              <textarea value={gallery} onChange={(e) => setGallery(e.target.value)} placeholder={'https://...\nhttps://...'} />
            </div>

            <div className="form-section-title">Affichage</div>

            <label className="checkbox">
              <input type="checkbox" checked={!!form.available} onChange={set('available')} />
              <span>Disponible a la location</span>
            </label>

            <label className="checkbox">
              <input type="checkbox" checked={!!form.featured} onChange={set('featured')} />
              <span>Mettre en avant sur la page d accueil</span>
            </label>

            <div className="field">
              <label>Ordre d affichage (plus petit = affiche en premier)</label>
              <input type="number" value={form.position ?? 0} onChange={set('position')} />
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-dark btn-sm" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-gold btn-sm" disabled={saving || uploading}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
