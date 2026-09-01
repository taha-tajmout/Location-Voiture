import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container" style={{ padding: '110px 20px', textAlign: 'center' }}>
      <h1 className="gold-text" style={{ fontSize: '4.6rem', fontWeight: 900, lineHeight: 1 }}>
        404
      </h1>
      <p style={{ color: 'var(--muted)', margin: '14px 0 28px' }}>Cette page n existe pas ou a ete deplacee.</p>
      <Link to="/" className="btn btn-gold">
        Retour a l accueil
      </Link>
    </div>
  )
}
