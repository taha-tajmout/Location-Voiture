import { useEffect, useState } from 'react'
import { api } from '../api/client.js'
import { IconLock } from '../components/Icons.jsx'

export default function AccountAdmin() {
  const [account, setAccount] = useState(null)
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/api/admin/me').then(setAccount).catch(() => {})
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (form.newPassword !== form.confirm) {
      setError('Les deux nouveaux mots de passe ne sont pas identiques.')
      return
    }
    if (form.newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caracteres.')
      return
    }

    setSaving(true)
    try {
      await api.post('/api/admin/password', {
        currentPassword:  form.currentPassword,
        
        newPassword: form.newPassword,
      }) 
      setForm({ currentPassword: '', newPassword: '', confirm: '' })
      setMessage('Mot de passe mis a jour.')
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Mot de passe</h1>
          <p>Compte connecte : {account?.username || '...'}</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <form onSubmit={submit} className="panel" style={{ maxWidth: 480 }}>
        <div className="field">
          <label>Mot de passe actuel</label>
          <input
            type="password"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            required
          />
        </div>

        <div className="field">
          <label>Nouveau mot de passe</label>
          <input
            type="password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            required
          />
        </div>

        <div className="field">
          <label>Confirmer le nouveau mot de passe</label>
          <input
            type="password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            required
          />
        </div>

        <button type="submit" className="btn btn-gold btn-block" disabled={saving}>
          <IconLock width={16} height={16} />
          {saving ? 'Enregistrement...' : 'Changer le mot de passe'}
        </button>
      </form>
    </>
  )
}
