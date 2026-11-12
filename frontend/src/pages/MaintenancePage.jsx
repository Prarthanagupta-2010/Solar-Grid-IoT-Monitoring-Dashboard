import { useCallback, useEffect, useState } from 'react'
import { ClipboardCheck, Plus, Wrench, X } from 'lucide-react'
import api, { errorMessage } from '../services/api'
import PageHeader from '../components/PageHeader'
import LoadingState from '../components/LoadingState'
import EmptyState from '../components/EmptyState'
import { dateTime, label } from '../utils/format'
import { useAuth } from '../context/AuthContext'

export default function MaintenancePage() {
  const [logs, setLogs] = useState(null)
  const [devices, setDevices] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ deviceId: '', type: 'INSPECTION', note: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { user } = useAuth()
  const canAdd = ['ADMIN', 'ENGINEER'].includes(user?.role)

  const load = useCallback(async () => {
    try {
      const [logsResult, devicesResult] = await Promise.all([api.get('/maintenance-logs'), api.get('/devices')])
      setLogs(logsResult.data); setDevices(devicesResult.data); setError('')
      if (devicesResult.data[0]) setForm((current) => current.deviceId ? current : ({ ...current, deviceId: devicesResult.data[0].id }))
    } catch (err) { setError(errorMessage(err)) }
  }, [])
  useEffect(() => { load() }, [load])

  const create = async (event) => {
    event.preventDefault(); setBusy(true); setError('')
    try { await api.post('/maintenance-logs', { ...form, deviceId: Number(form.deviceId) }); setOpen(false); setForm({ ...form, note: '' }); await load() }
    catch (err) { setError(errorMessage(err)) }
    finally { setBusy(false) }
  }

  if (!logs && !error) return <LoadingState />

  return <>
    <PageHeader title="Maintenance logbook" description="Create an auditable intervention history for inspected, calibrated and repaired assets."
      actions={canAdd && <button onClick={() => setOpen(true)} className="btn-primary"><Plus size={16} /> Add log entry</button>} />
    {error && !open && <div className="mb-5 rounded-xl border border-rose-400/15 bg-rose-400/5 p-4 text-sm text-rose-300">{error}</div>}
    <section className="card overflow-hidden">
      <div className="border-b border-white/5 px-5 py-4 sm:px-6"><h2 className="section-title">Intervention history</h2><p className="section-subtitle">{logs?.length || 0} documented actions</p></div>
      {!logs?.length ? <EmptyState title="No maintenance records" text="The first inspection or repair note will appear here." /> : <div className="divide-y divide-white/5">
        {logs.map((log) => <div key={log.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:p-6"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-400/10 text-violet-300"><Wrench size={18} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-slate-200">{log.deviceName}</p><span className="rounded-full bg-white/[.05] px-2.5 py-1 text-[10px] font-semibold text-slate-400">{label(log.type)}</span></div><p className="mt-2 text-sm leading-6 text-slate-400">{log.note}</p><div className="mt-3 flex flex-wrap gap-4 text-[11px] text-slate-600"><span>By {log.engineerName}</span><span>{dateTime(log.createdAt)}</span></div></div><ClipboardCheck size={18} className="shrink-0 text-mint" /></div>)}
      </div>}
    </section>

    {open && <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"><div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#111d33] p-6 shadow-glow sm:p-8"><div className="mb-6 flex items-center justify-between"><div><p className="text-[10px] font-bold tracking-[.2em] text-mint">AUDIT LOG</p><h2 className="mt-2 text-xl font-semibold text-white">Document intervention</h2></div><button onClick={() => setOpen(false)} className="icon-btn"><X size={18}/></button></div><form onSubmit={create} className="space-y-4">
      <label className="block text-xs font-medium text-slate-400">Device<select required className="field mt-2" value={form.deviceId} onChange={(e) => setForm({ ...form, deviceId: e.target.value })}>{devices.map((device) => <option key={device.id} value={device.id}>{device.name}</option>)}</select></label>
      <label className="block text-xs font-medium text-slate-400">Maintenance type<select className="field mt-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{['INSPECTION','PREVENTIVE','CORRECTIVE','CALIBRATION','SOFTWARE_UPDATE'].map((value) => <option key={value}>{value}</option>)}</select></label>
      <label className="block text-xs font-medium text-slate-400">Technical note<textarea required rows="5" maxLength="1000" className="field mt-2 resize-none" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Describe findings, action taken and follow-up recommendation…" /></label>
      {error && <div className="rounded-xl border border-rose-400/15 bg-rose-400/5 p-3 text-xs text-rose-300">{error}</div>}
      <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setOpen(false)} className="btn-secondary">Cancel</button><button disabled={busy} className="btn-primary">{busy ? 'Saving…' : 'Save log entry'}</button></div>
    </form></div></div>}
  </>
}
