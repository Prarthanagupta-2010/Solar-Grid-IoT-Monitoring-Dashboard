import { useEffect, useMemo, useState } from 'react'
import { Cpu, Edit3, Eye, Plus, Search, Trash2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import api, { errorMessage } from '../services/api'
import PageHeader from '../components/PageHeader'
import LoadingState from '../components/LoadingState'
import StatusBadge from '../components/StatusBadge'
import { dateTime, label } from '../utils/format'
import { useAuth } from '../context/AuthContext'

const emptyForm = {
  name: '', serialNumber: '', type: 'SOLAR_PANEL', location: '', status: 'ONLINE',
  healthScore: 100, installationDate: new Date().toISOString().slice(0, 10),
}

export default function DevicesPage() {
  const [devices, setDevices] = useState(null)
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { user } = useAuth()
  const canEdit = ['ADMIN', 'ENGINEER'].includes(user?.role)

  const load = async () => {
    try { setDevices((await api.get('/devices')).data); setError('') }
    catch (err) { setError(errorMessage(err)) }
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => (devices || []).filter((device) =>
    `${device.name} ${device.serialNumber} ${device.location} ${device.type}`.toLowerCase().includes(query.toLowerCase())), [devices, query])

  const openCreate = () => { setForm(emptyForm); setModal('create'); setError('') }
  const openEdit = (device) => { setForm({ ...device }); setModal(device); setError('') }

  const save = async (event) => {
    event.preventDefault(); setBusy(true); setError('')
    const payload = { ...form, healthScore: Number(form.healthScore) }
    try {
      if (modal === 'create') await api.post('/devices', payload)
      else await api.put(`/devices/${modal.id}`, payload)
      setModal(null); await load()
    } catch (err) { setError(errorMessage(err)) }
    finally { setBusy(false) }
  }

  const remove = async (device) => {
    if (!window.confirm(`Delete ${device.name} and all associated telemetry?`)) return
    try { await api.delete(`/devices/${device.id}`); await load() }
    catch (err) { setError(errorMessage(err)) }
  }

  if (!devices && !error) return <LoadingState />

  return <>
    <PageHeader title="Device management" description="Inventory, operational state and computed health for every solar-grid IoT asset."
      actions={canEdit && <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Add device</button>} />
    {error && !modal && <div className="mb-5 rounded-xl border border-rose-400/15 bg-rose-400/5 p-4 text-sm text-rose-300">{error}</div>}

    <section className="card overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-white/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div><h2 className="section-title">Asset inventory</h2><p className="section-subtitle">{filtered.length} devices shown</p></div>
        <label className="relative block sm:w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} className="field py-2.5 pl-9" placeholder="Search assets…" /></label>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>Device</th><th>Type</th><th>Location</th><th>Status</th><th>Health</th><th>Last seen</th><th className="text-right">Actions</th></tr></thead>
          <tbody>{filtered.map((device) => (
            <tr key={device.id}>
              <td><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-400/10 text-sky-300"><Cpu size={17} /></div><div><p className="font-medium text-slate-200">{device.name}</p><p className="mt-1 text-[10px] text-slate-600">{device.serialNumber}</p></div></div></td>
              <td className="text-slate-400">{label(device.type)}</td><td className="max-w-48 truncate text-slate-400">{device.location}</td><td><StatusBadge value={device.status} /></td>
              <td><div className="flex items-center gap-2"><div className="h-1.5 w-16 rounded-full bg-slate-800"><div className="h-full rounded-full bg-mint" style={{ width: `${device.healthScore}%` }} /></div><b className="text-xs text-slate-300">{device.healthScore}%</b></div></td>
              <td className="whitespace-nowrap text-slate-500">{dateTime(device.lastSeenAt)}</td>
              <td><div className="flex justify-end gap-1"><Link title="View" to={`/devices/${device.id}`} className="icon-btn"><Eye size={16} /></Link>{canEdit && <button title="Edit" onClick={() => openEdit(device)} className="icon-btn"><Edit3 size={16} /></button>}{user?.role === 'ADMIN' && <button title="Delete" onClick={() => remove(device)} className="icon-btn hover:text-rose-300"><Trash2 size={16} /></button>}</div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </section>

    {modal && <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-2xl rounded-3xl border border-white/10 bg-[#111d33] p-6 shadow-glow sm:p-8">
        <div className="mb-6 flex items-center justify-between"><div><p className="text-[10px] font-bold tracking-[.2em] text-mint">ASSET CONFIGURATION</p><h2 className="mt-2 text-xl font-semibold text-white">{modal === 'create' ? 'Add monitored device' : 'Edit monitored device'}</h2></div><button onClick={() => setModal(null)} className="icon-btn"><X size={18} /></button></div>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <FormField label="Device name"><input required className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></FormField>
          <FormField label="Serial number"><input required className="field" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} /></FormField>
          <FormField label="Device type"><select className="field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{['SOLAR_PANEL','INVERTER','BATTERY','SMART_METER','WEATHER_SENSOR','GRID_NODE'].map((value) => <option key={value}>{value}</option>)}</select></FormField>
          <FormField label="Status"><select className="field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{['ONLINE','OFFLINE','WARNING','CRITICAL','MAINTENANCE'].map((value) => <option key={value}>{value}</option>)}</select></FormField>
          <FormField label="Location"><input required className="field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></FormField>
          <FormField label="Installation date"><input required type="date" className="field" value={form.installationDate} onChange={(e) => setForm({ ...form, installationDate: e.target.value })} /></FormField>
          <FormField label="Initial health score"><input min="0" max="100" required type="number" className="field" value={form.healthScore} onChange={(e) => setForm({ ...form, healthScore: e.target.value })} /></FormField>
          {error && <div className="sm:col-span-2 rounded-xl border border-rose-400/15 bg-rose-400/5 p-3 text-xs text-rose-300">{error}</div>}
          <div className="mt-2 flex justify-end gap-2 sm:col-span-2"><button type="button" onClick={() => setModal(null)} className="btn-secondary">Cancel</button><button disabled={busy} className="btn-primary">{busy ? 'Saving…' : 'Save device'}</button></div>
        </form>
      </div>
    </div>}
  </>
}

function FormField({ label: title, children }) {
  return <label className="block text-xs font-medium text-slate-400">{title}<div className="mt-2">{children}</div></label>
}

