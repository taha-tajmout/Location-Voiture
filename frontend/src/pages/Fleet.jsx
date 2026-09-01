import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client.js'
import VehicleCard from '../components/VehicleCard.jsx'
import { CardSkeletonGrid, Empty } from '../components/Loader.jsx'

const SORTS = [
  { key: 'default', label: 'Par defaut' },
  { key: 'price-asc', label: 'Prix croissant' },
  { key: 'price-desc', label: 'Prix decroissant' },
  { key: 'name', label: 'Nom (A-Z)' },
]

/** Page catalogue. type = 'CAR' | 'MOTO' | undefined (tout). */
export default function Fleet({ type }) {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('all')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [sort, setSort] = useState('default')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    setCategory('all')
    api
      .get(`/api/vehicles${type ? `?type=${type}` : ''}`)
      .then(setVehicles)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [type])

  const categories = useMemo(() => {
    const set = new Set(vehicles.map((v) => v.category).filter(Boolean))
    return ['all', ...Array.from(set)]
  }, [vehicles])

  const visible = useMemo(() => {
    let list = [...vehicles]
    if (category !== 'all') list = list.filter((v) => v.category === category)
    if (onlyAvailable) list = list.filter((v) => v.available)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((v) =>
        [v.name, v.brand, v.category].filter(Boolean).some((field) => field.toLowerCase().includes(q)),
      )
    }
    if (sort === 'price-asc') list.sort((a, b) => (a.pricePerDay || 0) - (b.pricePerDay || 0))
    if (sort === 'price-desc') list.sort((a, b) => (b.pricePerDay || 0) - (a.pricePerDay || 0))
    if (sort === 'name') list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    return list
  }, [vehicles, category, onlyAvailable, sort, search])

  const title = type === 'MOTO' ? 'Nos motos' : type === 'CAR' ? 'Nos voitures' : 'Toute la flotte'
  const subtitle =
    type === 'MOTO'
      ? 'Scooters et roadsters disponibles a la location, casques inclus.'
      : type === 'CAR'
        ? 'Citadines, berlines et SUV de la flotte Mehdi Luxury Cars.'
        : 'Voitures et motos disponibles a la location.'

  return (
    <>
      <div className="page-head">
        <div className="container">
          <h1>
            {title.split(' ')[0]} <span className="gold-text">{title.split(' ').slice(1).join(' ')}</span>
          </h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="filters">
            <div className="chips">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`chip${category === cat ? ' active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat === 'all' ? 'Toutes' : cat}
                </button>
              ))}
            </div>

            <div className="filters-tools">
              <input
                className="input-search"
                type="search"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select className="input-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
              <button
                className={`chip${onlyAvailable ? ' active' : ''}`}
                onClick={() => setOnlyAvailable((v) => !v)}
              >
                Disponibles uniquement
              </button>
            </div>
          </div>

          {loading ? (
            <CardSkeletonGrid />
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : visible.length === 0 ? (
            <Empty label="Aucun vehicule ne correspond a votre recherche." />
          ) : (
            <>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 18 }}>
                {visible.length} vehicule{visible.length > 1 ? 's' : ''}
              </p>
              <div className="grid">
                {visible.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
