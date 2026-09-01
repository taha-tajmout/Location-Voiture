import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import { clearToken } from '../api/client.js'
import {
  IconCar,
  IconDashboard,
  IconList,
  IconLock,
  IconLogout,
  IconSettings,
} from '../components/Icons.jsx'

const LINKS = [
  { to: '/admin', label: 'Tableau de bord', icon: <IconDashboard width={18} height={18} />, end: true },
  { to: '/admin/vehicules', label: 'Voitures & motos', icon: <IconCar width={18} height={18} /> },
  { to: '/admin/reservations', label: 'Reservations', icon: <IconList width={18} height={18} /> },
  { to: '/admin/parametres', label: 'Parametres du site', icon: <IconSettings width={18} height={18} /> },
  { to: '/admin/compte', label: 'Mot de passe', icon: <IconLock width={18} height={18} /> },
]

export default function AdminLayout() {
  const navigate = useNavigate()

  const logout = () => {
    clearToken()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="brand">
          <Logo height={40} />
        </div>

        {LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end}>
            {link.icon}
            {link.label}
          </NavLink>
        ))}

        <div className="spacer" />

        <a href="/" target="_blank" rel="noreferrer">
          <IconCar width={18} height={18} />
          Voir le site
        </a>
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            padding: '11px 14px',
            borderRadius: 9,
            background: 'none',
            border: 'none',
            color: '#ff9a9a',
            cursor: 'pointer',
            fontSize: '0.87rem',
            fontWeight: 600,
          }}
        >
          <IconLogout width={18} height={18} />
          Deconnexion
        </button>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
