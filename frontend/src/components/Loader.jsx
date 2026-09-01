export function Loader({ label = 'Chargement...' }) {
  return (
    <div className="loading">
      <div className="spinner" />
      {label}
    </div>
  )
}

export function Empty({ label = 'Aucun element pour le moment.' }) {
  return <div className="empty">{label}</div>
}
