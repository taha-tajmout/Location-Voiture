import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client.js'
import { Loader } from '../components/Loader.jsx'
import { IconPlus } from '../components/Icons.jsx'
import { formatPrice } from '../utils/format.js'
import VehicleForm from './VehicleForm.jsx'

export default function VehiclesAdmin() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null) // null = ferme, {} = creation

  const load = useCallback(() => {
    setLoading(true)
    api
      .get('/api/admin/vehicles')
      .then(setVehicles)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const visible = useMemo(() => {
    let list = vehicles
    if (filter !== 'ALL') list = list.filter((v) => v.type === filter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((v) => [v.name, v.brand, v.category].filter(Boolean).some((f) => f.toLowerCase().includes(q)))
    }
    return list
  }, [vehicles, filter, search])

  const toggleAvailability = async (vehicle) => {
    try {
      const updated = await api.patch(`/api/admin/vehicles/${vehicle.id}/availability`, {
        available: !vehicle.available,
      })
      setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)))
    } catch (e) {
      setError(e.message)
    }
  }

  const remove = async (vehicle) => {
    if (!window.confirm(`Supprimer definitivement "${vehicle.name}" ?`)) return
    try {
      await api.del(`/api/admin/vehicles/${vehicle.id}`)
      setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id))
      setMessage('Vehicule supprime.')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Voitures & motos</h1>
          <p>Ajoutez, modifiez les prix, les photos et la disponibilite de votre flotte.</p>
        </div>
        <button className="btn btn-gold btn-sm" onClick={() => setEditing({})}>
          <IconPlus width={16} height={16} />
          Ajouter un vehicule
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="filters">
        <div className="chips">
          {[
            { key: 'ALL', label: `Tous (${vehicles.length})` },
            { key: 'CAR', label: `Voitures (${vehicles.filter((v) => v.type === 'CAR').length})` },
            { key: 'MOTO', label: `Motos (${vehicles.filter((v) => v.type === 'MOTO').length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`chip${filter === tab.key ? ' active' : ''}`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <input
          placeholder="Rechercher un vehicule..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: 'var(--black-soft)',
            border: '1px solid var(--line-strong)',
            borderRadius: 9,
            padding: '9px 13px',
            minWidth: 220,
          }}
        />
      </div>

      {loading ? (
        <Loader />
      ) : visible.length === 0 ? (
        <div className="empty">Aucun vehicule. Cliquez sur "Ajouter un vehicule" pour commencer.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Photo</th>
                <th>Vehicule</th>
                <th>Type</th>
                <th>Jour</th>
                <th>Semaine</th>
                <th>Mois</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>
                    {vehicle.imageUrl ? (
                      <img className="table-thumb" src={vehicle.imageUrl} alt="" />
                    ) : (
                      <div className="table-thumb" style={{ background: '#101010' }} />
                    )}
                  </td>
                  <td>
                    <strong>{vehicle.name}</strong>
                    <div style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>
                      {[vehicle.brand, vehicle.category, vehicle.year].filter(Boolean).join(' · ')}
                      {vehicle.featured && (
                        <span className="pill gold" style={{ marginLeft: 8 }}>
                          En vedette
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{vehicle.type === 'MOTO' ? 'Moto' : 'Voiture'}</td>
                  <td className="gold-text">
                    <strong>{formatPrice(vehicle.pricePerDay)}</strong>
                  </td>
                  <td>{vehicle.pricePerWeek ? formatPrice(vehicle.pricePerWeek) : '-'}</td>
                  <td>{vehicle.pricePerMonth ? formatPrice(vehicle.pricePerMonth) : '-'}</td>
                  <td>
                    <button
                      className={`pill ${vehicle.available ? 'ok' : 'no'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleAvailability(vehicle)}
                      title="Cliquer pour basculer"
                    >
                      {vehicle.available ? 'Disponible' : 'Indisponible'}
                    </button>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditing(vehicle)}>
                        Modifier
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(vehicle)}>
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

      {editing !== null && (
        <VehicleForm
          vehicle={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            setMessage('Vehicule enregistre.')
            load()
          }}
        />
      )}
    </>
  )
}
