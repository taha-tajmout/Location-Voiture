import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, setToken } from '../api/client.js'
import Logo from '../components/Logo.jsx'
import { IconLock } from '../components/Icons.jsx'

/** Page d'authentification unique de l'administrateur. */
export default function AdminLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.post('/api/auth/login', { username, password })
      setToken(data.token)
      navigate('/admin', { replace: true })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo-wrap">
          <Logo height={80} withText={false} />
          <h1 className="gold-text">Espace administrateur</h1>
          <p className="sub">Mehdi Luxury Cars</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label>Identifiant</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="admin"
              required
              autoFocus
            />
          </div>

          <div className="field">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-gold btn-block" disabled={loading}>
            <IconLock width={17} height={17} />
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.78rem', color: 'var(--muted-2)' }}>
          Acces reserve. <a href="/" style={{ color: 'var(--gold)' }}>Retour au site</a>
        </p>
      </div>
    </div>
  )
}
