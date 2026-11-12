import { label } from '../utils/format'

const styles = {
  ONLINE: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/20',
  RESOLVED: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/20',
  LOW: 'bg-sky-400/10 text-sky-300 ring-sky-400/20',
  OPEN: 'bg-rose-400/10 text-rose-300 ring-rose-400/20',
  OFFLINE: 'bg-slate-400/10 text-slate-300 ring-slate-400/20',
  WARNING: 'bg-amber-400/10 text-amber-300 ring-amber-400/20',
  MEDIUM: 'bg-amber-400/10 text-amber-300 ring-amber-400/20',
  IN_PROGRESS: 'bg-violet-400/10 text-violet-300 ring-violet-400/20',
  HIGH: 'bg-orange-400/10 text-orange-300 ring-orange-400/20',
  CRITICAL: 'bg-rose-400/10 text-rose-300 ring-rose-400/20',
  MAINTENANCE: 'bg-violet-400/10 text-violet-300 ring-violet-400/20',
  IGNORED: 'bg-slate-400/10 text-slate-300 ring-slate-400/20',
}

export default function StatusBadge({ value }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ring-1 ${styles[value] || styles.OFFLINE}`}>
      {label(value)}
    </span>
  )
}

