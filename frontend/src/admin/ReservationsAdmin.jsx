import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client.js'
import { useSite } from '../context/SiteContext.jsx'
import { Loader } from '../components/Loader.jsx'
import { IconWhatsapp } from '../components/Icons.jsx'
import { formatDate, whatsappLink } from '../utils/format.js'

const STATUSES = [
  { key: 'NEW', label: 'Nouvelle', pill: 'gold' },
  { key: 'CONFIRMED', label: 'Confirmee', pill: 'ok' },
  { key: 'DONE', label: 'Terminee', pill: 'grey' },
  { key: 'CANCELLED', label: 'Annulee', pill: 'no' },
]

export default function ReservationsAdmin() {
  const { settings } = useSite()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')

  const load = useCallback(() => {
    setLoading(true)
    api
      .get('/api/admin/reservations')
      .then(setReservations)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const visible = useMemo(
    () => (filter === 'ALL' ? reservations : reservations.filter((r) => r.status === filter)),
    [reservations, filter],
  )

  const changeStatus = async (reservation, status) => {
    try {
      const updated = await api.patch(`/api/admin/reservations/${reservation.id}`, { status })
      setReservations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    } catch (e) {
      setError(e.message)
    }
  }

  const remove = async (reservation) => {
    if (!window.confirm('Supprimer cette demande ?')) return
    try {
      await api.del(`/api/admin/reservations/${reservation.id}`)
      setReservations((prev) => prev.filter((r) => r.id !== reservation.id))
    } catch (e) {
      setError(e.message)
    }
  }

  const statusOf = (key) => STATUSES.find((s) => s.key === key) || { label: key, pill: 'grey' }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Reservations</h1>
          <p>Demandes envoyees depuis le formulaire du site.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filters">
        <div className="chips">
          <button className={`chip${filter === 'ALL' ? ' active' : ''}`} onClick={() => setFilter('ALL')}>
            Toutes ({reservations.length})
          </button>
          {STATUSES.map((status) => (
            <button
              key={status.key}
              className={`chip${filter === status.key ? ' active' : ''}`}
              onClick={() => setFilter(status.key)}
            >
              {status.label} ({reservations.filter((r) => r.status === status.key).length})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : visible.length === 0 ? (
        <div className="empty">Aucune demande dans cette categorie.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Vehicule</th>
                <th>Periode</th>
                <th>Message</th>
                <th>Recue le</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((reservation) => (
                <tr key={reservation.id}>
                  <td>
                    <strong>{reservation.customerName}</strong>
                    <div style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>
                      {reservation.customerPhone}
                      {reservation.customerEmail ? ` · ${reservation.customerEmail}` : ''}
                    </div>
                  </td>
                  <td>{reservation.vehicleName || '-'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {reservation.startDate || '?'} → {reservation.endDate || '?'}
                    {reservation.pickupPlace && (
                      <div style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{reservation.pickupPlace}</div>
                    )}
                  </td>
                  <td style={{ maxWidth: 220, color: 'var(--muted)', fontSize: '0.82rem' }}>
                    {reservation.message || '-'}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDate(reservation.createdAt)}</td>
                  <td>
                    <select
                      value={reservation.status}
                      onChange={(e) => changeStatus(reservation, e.target.value)}
                      style={{
                        background: 'var(--black-soft)',
                        border: '1px solid var(--line-strong)',
                        borderRadius: 8,
                        padding: '6px 9px',
                        fontSize: '0.78rem',
                      }}
                    >
                      {STATUSES.map((status) => (
                        <option key={status.key} value={status.key}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                    <div style={{ marginTop: 5 }}>
                      <span className={`pill ${statusOf(reservation.status).pill}`}>
                        {statusOf(reservation.status).label}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="row-actions">
                      <a
                        className="btn btn-whatsapp btn-sm"
                        href={whatsappLink(
                          reservation.customerPhone,
                          settings.countryCode,
                          `Bonjour ${reservation.customerName}, suite a votre demande de reservation`
                            + `${reservation.vehicleName ? ` pour ${reservation.vehicleName}` : ''} chez ${settings.siteName} :`,
                        )}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <IconWhatsapp width={15} height={15} />
                      </a>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(reservation)}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
