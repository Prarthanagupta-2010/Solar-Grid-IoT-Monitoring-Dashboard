export const number = (value, digits = 1) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(value ?? 0)

export const dateTime = (value) =>
  value ? new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium', timeStyle: 'short',
  }).format(new Date(value)) : '—'

export const shortTime = (value) =>
  value ? new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(value)) : '—'

export const label = (value) =>
  value ? value.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase()) : '—'

