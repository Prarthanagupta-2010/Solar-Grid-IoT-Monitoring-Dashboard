import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Filter, RefreshCw, ShieldAlert } from 'lucide-react'
import api, { errorMessage } from '../services/api'
import PageHeader from '../components/PageHeader'
import LoadingState from '../components/LoadingState'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import { dateTime, label } from '../utils/format'
import { useAuth } from '../context/AuthContext'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(null)
  const [status, setStatus] = useState('ACTIVE')
  const [severity, setSeverity] = useState('ALL')
  const [error, setError] = useState('')
  const { user } = useAuth()
  const canUpdate = user?.role !== 'VIEWER'

  const load = async () => {
    try { setAlerts((await api.get('/alerts')).data); setError('') }
    catch (err) { setError(errorMessage(err)) }
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => (alerts || []).filter((alert) => {
    const statusMatch = status === 'ALL' || (status === 'ACTIVE' ? ['OPEN', 'IN_PROGRESS'].includes(alert.status) : alert.status === status)
    return statusMatch && (severity === 'ALL' || alert.severity === severity)
  }), [alerts, severity, status])

  const update = async (alert, nextStatus) => {
    const resolutionNote = ['RESOLVED', 'IGNORED'].includes(nextStatus)
      ? window.prompt('Optional resolution note:', alert.resolutionNote || '') : null
    try { await api.patch(`/alerts/${alert.id}/status`, { status: nextStatus, resolutionNote }); await load() }
    catch (err) { setError(errorMessage(err)) }
  }

  if (!alerts && !error) return <LoadingState />
  const activeCount = (alerts || []).filter((a) => ['OPEN', 'IN_PROGRESS'].includes(a.status)).length
  const criticalCount = (alerts || []).filter((a) => a.severity === 'CRITICAL' && ['OPEN', 'IN_PROGRESS'].includes(a.status)).length
  const resolvedCount = (alerts || []).filter((a) => a.status === 'RESOLVED').length

  return <>
    <PageHeader title="Alert management" description="Triage operational, electrical and cyber-physical anomalies detected by the rule engine."
      actions={<button onClick={load} className="btn-secondary"><RefreshCw size={16} /> Refresh</button>} />
    {error && <div className="mb-5 rounded-xl border border-rose-400/15 bg-rose-400/5 p-4 text-sm text-rose-300">{error}</div>}
    <div className="grid gap-4 sm:grid-cols-3">
      <MiniCard icon={AlertTriangle} label="Active findings" value={activeCount} color="text-orange-300" />
      <MiniCard icon={ShieldAlert} label="Critical open" value={criticalCount} color="text-rose-300" />
      <MiniCard icon={CheckCircle2} label="Resolved" value={resolvedCount} color="text-mint" />
    </div>

    <section className="card mt-5 overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-white/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2 text-xs text-slate-500"><Filter size={15} /> {filtered.length} matching alerts</div>
        <div className="flex flex-wrap gap-2">
          <select className="field w-auto py-2" value={status} onChange={(e) => setStatus(e.target.value)}><option value="ACTIVE">Active</option><option value="ALL">All statuses</option><option value="OPEN">Open</option><option value="IN_PROGRESS">In progress</option><option value="RESOLVED">Resolved</option><option value="IGNORED">Ignored</option></select>
          <select className="field w-auto py-2" value={severity} onChange={(e) => setSeverity(e.target.value)}><option value="ALL">All severities</option>{['LOW','MEDIUM','HIGH','CRITICAL'].map((value) => <option key={value}>{value}</option>)}</select>
        </div>
      </div>
      {filtered.length === 0 ? <EmptyState title="No alerts in this view" text="Try changing the status or severity filters." /> : <div className="divide-y divide-white/5">
        {filtered.map((alert) => <div key={alert.id} className="p-5 sm:p-6"><div className="flex flex-col gap-4 xl:flex-row xl:items-start">
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${alert.severity === 'CRITICAL' ? 'bg-rose-400/10 text-rose-300' : 'bg-amber-400/10 text-amber-300'}`}><AlertTriangle size={18} /></div>
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-slate-200">{label(alert.type)}</p><StatusBadge value={alert.severity} /><StatusBadge value={alert.status} /></div><p className="mt-2 text-sm leading-6 text-slate-400">{alert.message}</p><div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-slate-600"><span>Asset: <b className="font-medium text-slate-400">{alert.deviceName}</b></span><span>Detected: {dateTime(alert.createdAt)}</span>{alert.resolvedAt && <span>Resolved: {dateTime(alert.resolvedAt)}</span>}</div>{alert.resolutionNote && <p className="mt-3 rounded-lg bg-white/[.025] px-3 py-2 text-xs text-slate-500">Resolution: {alert.resolutionNote}</p>}</div>
          {canUpdate && <div className="flex shrink-0 flex-wrap gap-2">{alert.status === 'OPEN' && <button onClick={() => update(alert, 'IN_PROGRESS')} className="btn-secondary">Start review</button>}{['OPEN', 'IN_PROGRESS'].includes(alert.status) && <button onClick={() => update(alert, 'RESOLVED')} className="btn-primary">Resolve</button>}{['OPEN', 'IN_PROGRESS'].includes(alert.status) && <button onClick={() => update(alert, 'IGNORED')} className="btn-ghost">Ignore</button>}</div>}
        </div></div>)}
      </div>}
    </section>
  </>
}

function MiniCard({ icon: Icon, label: title, value, color }) {
  return <div className="card flex items-center justify-between p-5"><div><p className="text-xs text-slate-500">{title}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p></div><Icon size={21} className={color} /></div>
}

