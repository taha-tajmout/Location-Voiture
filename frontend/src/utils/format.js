/** Fonctions utilitaires : prix, telephone, liens WhatsApp. */

export function formatPrice(value) {
  if (value === null || value === undefined || value === '') return '-'
  return `${Number(value).toLocaleString('fr-FR')} DH`
}

/** 0661536755 + indicatif 212 => 212661536755 */
export function toInternational(phone, countryCode = '212') {
  if (!phone) return ''
  const digits = String(phone).replace(/\D/g, '')
  const code = String(countryCode || '').replace(/\D/g, '')
  if (!digits) return ''
  if (code && digits.startsWith(code)) return digits
  if (digits.startsWith('0')) return code + digits.slice(1)
  return code + digits
}

/** Affichage lisible : 06 61 53 67 55 */
export function prettyPhone(phone) {
  if (!phone) return ''
  const digits = String(phone).replace(/\D/g, '')
  return digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim()
}

export function whatsappLink(phone, countryCode, message) {
  const number = toInternational(phone, countryCode)
  const text = encodeURIComponent(message || '')
  return `https://wa.me/${number}${text ? `?text=${text}` : ''}`
}

export function callLink(phone) {
  return `tel:${String(phone || '').replace(/\s/g, '')}`
}

/** Message WhatsApp pre-rempli pour un vehicule donne. */
export function vehicleMessage(vehicle, settings) {
  if (!vehicle) return settings?.whatsappMessage || 'Bonjour, je souhaite reserver un vehicule.'
  const kind = vehicle.type === 'MOTO' ? 'la moto' : 'la voiture'
  return `Bonjour ${settings?.siteName || 'Nouali Car'}, je souhaite reserver ${kind} ${vehicle.name}`
    + `${vehicle.pricePerDay ? ` (${formatPrice(vehicle.pricePerDay)} / jour)` : ''}. Merci de me confirmer la disponibilite.`
}

export function formatDate(value) {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return String(value)
  }
}
