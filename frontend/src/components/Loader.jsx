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

/** Fiche vehicule fantome affichee pendant le chargement de la flotte. */
export function CardSkeleton() {
  return (
    <div className="skeleton" aria-hidden="true">
      <div className="sk-media" />
      <div className="sk-body">
        <div className="sk-line w40" />
        <div className="sk-line tall w70" />
        <div className="sk-line w55" />
        <div className="sk-line tall w40" />
      </div>
    </div>
  )
}

/** Grille de fiches fantomes, calee sur la grille reelle des vehicules. */
export function CardSkeletonGrid({ count = 6 }) {
  return (
    <div className="grid" role="status" aria-label="Chargement des vehicules">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
