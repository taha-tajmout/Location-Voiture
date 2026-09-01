import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import { useSite } from '../context/SiteContext.jsx'
import { Loader } from '../components/Loader.jsx'
import { IconCar, IconMoto, IconPhone, IconWhatsapp } from '../components/Icons.jsx'
import { callLink, formatPrice, prettyPhone, whatsappLink } from '../utils/format.js'

const EMPTY_FORM = {
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  startDate: '',
  endDate: '',
  pickupPlace: '',
  message: '',
}

export default function VehicleDetail() {
  const { id } = useParams()
  const { settings } = useSite()

  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [active, setActive] = useState(0)
  const [broken, setBroken] = useState(false)

  const [form, setForm] = useState(EMPTY_FORM)
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState(null)

  // Sur telephone, cette page affiche sa propre barre basse (prix + reserver) :
  // on masque celle du site pour ne pas empiler deux barres.
  useEffect(() => {
    document.body.classList.add('has-detail-bar')
    return () => document.body.classList.remove('has-detail-bar')
  }, [])

  useEffect(() => {
    setLoading(true)
    api
      .get(`/api/vehicles/${id}`)
      .then((data) => {
        setVehicle(data)
        setActive(0)
        setBroken(false)
      })
      .catch(() => setError('Vehicule introuvable.'))
      .finally(() => setLoading(false))
  }, [id])

  const gallery = useMemo(() => {
    if (!vehicle) return []
    return [vehicle.imageUrl, ...(vehicle.images || [])].filter(Boolean)
  }, [vehicle])

  const days = useMemo(() => {
    if (!form.startDate || !form.endDate) return 0
    const diff = (new Date(form.endDate) - new Date(form.startDate)) / 86400000
    return diff > 0 ? Math.ceil(diff) : 0
  }, [form.startDate, form.endDate])

  const estimate = days && vehicle?.pricePerDay ? days * vehicle.pricePerDay : 0

  const buildMessage = () => {
    const lines = [
      `Bonjour ${settings.siteName},`,
      `Je souhaite reserver : ${vehicle.name}${vehicle.brand ? ` (${vehicle.brand})` : ''}`,
      vehicle.pricePerDay ? `Tarif affiche : ${formatPrice(vehicle.pricePerDay)} / jour` : null,
      form.customerName ? `Nom : ${form.customerName}` : null,
      form.customerPhone ? `Telephone : ${form.customerPhone}` : null,
      form.startDate ? `Du : ${form.startDate}` : null,
      form.endDate ? `Au : ${form.endDate}` : null,
      days ? `Duree : ${days} jour(s)` : null,
      estimate ? `Estimation : ${formatPrice(estimate)}` : null,
      form.pickupPlace ? `Lieu de prise en charge : ${form.pickupPlace}` : null,
      form.message ? `Message : ${form.message}` : null,
    ].filter(Boolean)
    return lines.join('\n')
  }

  const submit = async (event, phone) => {
    event.preventDefault()
    if (!form.customerName.trim() || !form.customerPhone.trim()) {
      setFeedback({ type: 'error', text: 'Merci d indiquer votre nom et votre telephone.' })
      return
    }
    setSending(true)
    setFeedback(null)
    try {
      await api.post('/api/reservations', {
        ...form,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
      })
      setFeedback({
        type: 'success',
        text: 'Demande enregistree. WhatsApp va s ouvrir pour finaliser la reservation.',
      })
      window.open(whatsappLink(phone, settings.countryCode, buildMessage()), '_blank')
    } catch (e) {
      // Meme si l enregistrement echoue, le client peut toujours passer par WhatsApp.
      setFeedback({ type: 'error', text: e.message })
      window.open(whatsappLink(phone, settings.countryCode, buildMessage()), '_blank')
    } finally {
      setSending(false)
    }
  }

  if (loading) return <Loader />
  if (error || !vehicle)
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: 16 }}>{error || 'Vehicule introuvable.'}</h2>
        <Link to="/vehicules" className="btn btn-ghost">
          Retour a la flotte
        </Link>
      </div>
    )

  const isMoto = vehicle.type === 'MOTO'
  const phones = [settings.phone1, settings.phone2].filter(Boolean)

  const specs = [
    { label: 'Marque', value: vehicle.brand },
    { label: 'Categorie', value: vehicle.category },
    { label: 'Annee', value: vehicle.year },
    isMoto
      ? { label: 'Cylindree', value: vehicle.engine }
      : { label: 'Boite', value: vehicle.transmission },
    { label: 'Carburant', value: vehicle.fuel },
    !isMoto ? { label: 'Places', value: vehicle.seats } : null,
    !isMoto ? { label: 'Portes', value: vehicle.doors } : null,
  ].filter((s) => s && s.value)

  return (
    <section className="container vehicle-page">
      <div className="breadcrumb">
        <Link to="/">Accueil</Link> / <Link to={isMoto ? '/motos' : '/voitures'}>{isMoto ? 'Motos' : 'Voitures'}</Link>{' '}
        / <span style={{ color: 'var(--gold)' }}>{vehicle.name}</span>
      </div>

      <div className="detail">
        {/* ---------- Galerie + description ---------- */}
        <div className="detail-gallery">
          {gallery.length > 0 && !broken ? (
            <img className="main" src={gallery[active]} alt={vehicle.name} onError={() => setBroken(true)} />
          ) : (
            <div className="img-placeholder main" style={{ aspectRatio: '16/10', borderRadius: 'var(--radius)' }}>
              {isMoto ? <IconMoto width={64} height={64} /> : <IconCar width={64} height={64} />}
            </div>
          )}

          {gallery.length > 1 && (
            <div className="thumbs">
              {gallery.map((url, index) => (
                <img
                  key={url + index}
                  src={url}
                  alt=""
                  className={index === active ? 'active' : ''}
                  onClick={() => {
                    setActive(index)
                    setBroken(false)
                  }}
                />
              ))}
            </div>
          )}

          <div className="panel" style={{ marginTop: 26 }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 10 }}>{vehicle.name}</h2>
            <p style={{ color: 'var(--muted)' }}>{vehicle.description || 'Aucune description.'}</p>

            <div className="spec-grid">
              {specs.map((spec) => (
                <div className="spec-box" key={spec.label}>
                  <small>{spec.label}</small>
                  <strong>{spec.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ---------- Tarifs + formulaire ---------- */}
        <aside id="reserver">
          <div className="panel">
            <span className={`pill ${vehicle.available ? 'ok' : 'no'}`}>
              {vehicle.available ? 'Disponible' : 'Indisponible'}
            </span>

            <div className="price-table">
              <div className="price-row highlight">
                <span>Journee</span>
                <strong className="gold-text">{formatPrice(vehicle.pricePerDay)}</strong>
              </div>
              {vehicle.pricePerWeek ? (
                <div className="price-row">
                  <span>Semaine</span>
                  <strong>{formatPrice(vehicle.pricePerWeek)}</strong>
                </div>
              ) : null}
              {vehicle.pricePerMonth ? (
                <div className="price-row">
                  <span>Mois</span>
                  <strong>{formatPrice(vehicle.pricePerMonth)}</strong>
                </div>
              ) : null}
              {vehicle.deposit ? (
                <div className="price-row">
                  <span>Caution</span>
                  <strong>{formatPrice(vehicle.deposit)}</strong>
                </div>
              ) : null}
            </div>

            <h3 style={{ fontSize: '0.78rem', letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', margin: '10px 0 16px' }}>
              Demande de reservation
            </h3>

            {feedback && (
              <div className={`alert alert-${feedback.type === 'error' ? 'error' : 'success'}`}>{feedback.text}</div>
            )}

            <form onSubmit={(e) => submit(e, phones[0])}>
              <div className="field">
                <label>Nom complet *</label>
                <input
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  placeholder="Votre nom"
                  required
                />
              </div>

              <div className="field">
                <label>Telephone *</label>
                <input
                  value={form.customerPhone}
                  onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                  placeholder="06 xx xx xx xx"
                  required
                />
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Date de debut</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Date de fin</label>
                  <input
                    type="date"
                    value={form.endDate}
                    min={form.startDate || undefined}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="field">
                <label>Lieu de prise en charge</label>
                <input
                  value={form.pickupPlace}
                  onChange={(e) => setForm({ ...form, pickupPlace: e.target.value })}
                  placeholder="Agence, aeroport, adresse..."
                />
              </div>

              <div className="field">
                <label>Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Precisions eventuelles"
                />
              </div>

              {estimate > 0 && (
                <div className="price-row" style={{ marginBottom: 16 }}>
                  <span>
                    Estimation ({days} jour{days > 1 ? 's' : ''})
                  </span>
                  <strong className="gold-text">{formatPrice(estimate)}</strong>
                </div>
              )}

              <button type="submit" className="btn btn-whatsapp btn-block" disabled={sending || phones.length === 0}>
                <IconWhatsapp width={18} height={18} />
                {sending ? 'Envoi...' : `Reserver sur WhatsApp`}
              </button>
            </form>

            {phones.length > 1 && (
              <button
                type="button"
                className="btn btn-ghost btn-block"
                style={{ marginTop: 10 }}
                disabled={sending}
                onClick={(e) => submit(e, phones[1])}
              >
                <IconWhatsapp width={16} height={16} />
                Autre numero : {prettyPhone(phones[1])}
              </button>
            )}

            <div style={{ display: 'grid', gap: 9, marginTop: 16 }}>
              {phones.map((phone) => (
                <a key={phone} href={callLink(phone)} className="btn btn-dark btn-sm">
                  <IconPhone width={16} height={16} />
                  Appeler {prettyPhone(phone)}
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Barre de reservation collante — telephone uniquement (voir .detail-bar) */}
      <div className="detail-bar">
        <div>
          <small>A partir de</small>
          <strong className="gold-text">{formatPrice(vehicle.pricePerDay)}</strong>
        </div>
        <button
          type="button"
          className="btn btn-whatsapp"
          onClick={() =>
            document.getElementById('reserver')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        >
          <IconWhatsapp width={18} height={18} />
          Reserver
        </button>
      </div>
    </section>
  )
}

