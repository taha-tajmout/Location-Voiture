import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IconCar, IconMoto, IconWhatsapp } from './Icons.jsx'
import { useSite } from '../context/SiteContext.jsx'
import { formatPrice, vehicleMessage, whatsappLink } from '../utils/format.js'

export default function VehicleCard({ vehicle }) {
  const { settings } = useSite()
  const [broken, setBroken] = useState(false)
  const isMoto = vehicle.type === 'MOTO'

  const wa = whatsappLink(settings.phone1, settings.countryCode, vehicleMessage(vehicle, settings))

  const specs = isMoto
    ? [vehicle.engine, vehicle.category, vehicle.year]
    : [vehicle.transmission, vehicle.fuel, vehicle.seats ? `${vehicle.seats} places` : null, vehicle.year]

  return (
    <article className="card">
      <Link to={`/vehicule/${vehicle.id}`} className="card-media">
        {vehicle.imageUrl && !broken ? (
          <img
            src={vehicle.imageUrl}
            alt={vehicle.name}
            loading="lazy"
            onError={() => setBroken(true)}
          />
        ) : (
          <div className="img-placeholder">
            {isMoto ? <IconMoto width={46} height={46} /> : <IconCar width={46} height={46} />}
          </div>
        )}
        <span className="badge badge-type">{isMoto ? 'Moto' : 'Voiture'}</span>
        <span className={`badge badge-status ${vehicle.available ? 'ok' : 'no'}`}>
          {vehicle.available ? 'Disponible' : 'Indisponible'}
        </span>
      </Link>

      <div className="card-body">
        <div>
          <div className="card-brand">{vehicle.brand || (isMoto ? 'Moto' : 'Voiture')}</div>
          <h3 className="card-title">{vehicle.name}</h3>
        </div>

        <div className="specs">
          {specs.filter(Boolean).map((spec, i) => (
            <span className="spec" key={i}>
              {spec}
            </span>
          ))}
        </div>

        <div className="card-price">
          <div>
            <div className="price-value gold-text">{formatPrice(vehicle.pricePerDay)}</div>
            <div className="price-unit">par jour</div>
          </div>
        </div>

        <div className="card-actions">
          <Link to={`/vehicule/${vehicle.id}`} className="btn btn-ghost btn-sm">
            Details
          </Link>
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="btn btn-whatsapp btn-sm"
            aria-label="Reserver sur WhatsApp"
          >
            <IconWhatsapp width={16} height={16} />
          </a>
        </div>
      </div>
    </article>
  )
}
