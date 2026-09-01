import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'
import { Loader } from '../components/Loader.jsx'
import { IconArrowRight, IconPlus } from '../components/Icons.jsx'
import { formatDate } from '../utils/format.js'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [latest, setLatest] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/api/admin/stats'), api.get('/api/admin/reservations')])
      .then(([statsData, reservations]) => {
        setStats(statsData)
        setLatest(reservations.slice(0, 5))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  const cards = [
    { label: 'Vehicules', value: stats?.totalVehicles ?? 0, gold: true },
    { label: 'Voitures', value: stats?.cars ?? 0 },
    { label: 'Motos', value: stats?.motos ?? 0 },
    { label: 'Disponibles', value: stats?.available ?? 0 },
    { label: 'Reservations', value: stats?.totalReservations ?? 0 },
    { label: 'Nouvelles', value: stats?.newReservations ?? 0, gold: true },
  ]

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Tableau de bord</h1>
          <p>Vue d ensemble de la flotte et des demandes de reservation.</p>
        </div>
        <Link to="/admin/vehicules" className="btn btn-gold btn-sm">
          <IconPlus width={16} height={16} />
          Gerer les vehicules
        </Link>
      </div>

      <div className="stat-grid">
        {cards.map((card) => (
          <div className={`stat${card.gold ? ' gold' : ''}`} key={card.label}>
            <small>{card.label}</small>
            <strong>{card.value}</strong>
          </div>
        ))}
      </div>

      <div className="admin-header" style={{ marginTop: 10 }}>
        <h1 style={{ fontSize: '1.1rem' }}>Dernieres demandes</h1>
        <Link to="/admin/reservations" className="btn btn-ghost btn-sm">
          Tout voir
          <IconArrowRight width={15} height={15} />
        </Link>
      </div>

      {latest.length === 0 ? (
        <div className="empty">Aucune demande de reservation pour l instant.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Telephone</th>
                <th>Vehicule</th>
                <th>Dates</th>
                <th>Recue le</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {latest.map((reservation) => (
                <tr key={reservation.id}>
                  <td>{reservation.customerName}</td>
                  <td>{reservation.customerPhone}</td>
                  <td>{reservation.vehicleName || '-'}</td>
                  <td>
                    {reservation.startDate || '-'} → {reservation.endDate || '-'}
                  </td>
                  <td>{formatDate(reservation.createdAt)}</td>
                  <td>
                    <span className={`pill ${reservation.status === 'NEW' ? 'gold' : 'grey'}`}>
                      {reservation.status}
                    </span>
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
