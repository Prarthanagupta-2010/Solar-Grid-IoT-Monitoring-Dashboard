import { useCallback, useEffect, useMemo, useState } from 'react'
import { Activity, AlertTriangle, BatteryCharging, Cpu, RefreshCw, ShieldCheck, Sun, Zap } from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import api, { errorMessage } from '../services/api'
import PageHeader from '../components/PageHeader'
import LoadingState from '../components/LoadingState'
import StatusBadge from '../components/StatusBadge'
import { dateTime, number, shortTime } from '../utils/format'
import { useAuth } from '../context/AuthContext'

const pieColors = { ONLINE: '#42d3ad', WARNING: '#f6b94a', CRITICAL: '#fb7185', OFFLINE: '#64748b', MAINTENANCE: '#a78bfa' }

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [simulating, setSimulating] = useState(false)
  const { user } = useAuth()

  const load = useCallback(async () => {
    try {
      setError('')
      const [summary, energy, devices, alerts] = await Promise.all([
        api.get('/dashboard/summary'), api.get('/dashboard/energy-production?hours=24'),
        api.get('/devices'), api.get('/alerts/active'),
      ])
      setData({ summary: summary.data, energy: energy.data, devices: devices.data, alerts: alerts.data })
    } catch (err) {
      setError(errorMessage(err))
    }
  }, [])

  useEffect(() => { load() }, [load])

  const statusData = useMemo(() => {
    if (!data) return []
    const grouped = data.devices.reduce((acc, device) => ({ ...acc, [device.status]: (acc[device.status] || 0) + 1 }), {})
    return Object.entries(grouped).map(([name, value]) => ({ name, value }))
  }, [data])

  const simulate = async () => {
    setSimulating(true)
    try { await api.post('/sensor-readings/simulate'); await load() }
    catch (err) { setError(errorMessage(err)) }
    finally { setSimulating(false) }
  }

  if (!data && !error) return <LoadingState />

  const summary = data?.summary || {}
  const cards = [
    { label: 'Connected assets', value: summary.totalDevices, meta: `${summary.onlineDevices || 0} reporting`, icon: Cpu, color: 'text-sky-300', bg: 'bg-sky-400/10' },
    { label: 'Energy today', value: `${number(summary.dailyEnergyKwh)} kWh`, meta: 'Across all monitored assets', icon: Sun, color: 'text-solar', bg: 'bg-solar/10' },
    { label: 'Active alerts', value: summary.activeAlerts, meta: `${summary.criticalAlerts || 0} critical`, icon: AlertTriangle, color: 'text-rose-300', bg: 'bg-rose-400/10' },
    { label: 'System health', value: `${number(summary.averageHealthScore, 0)}%`, meta: `${summary.anomaliesToday || 0} anomalies today`, icon: ShieldCheck, color: 'text-mint', bg: 'bg-mint/10' },
  ]

  return <>
    <PageHeader
      title="Operations overview"
      description="A live decision-support view of energy production, asset health and security-relevant anomalies."
      actions={<>
        <button onClick={load} className="btn-secondary"><RefreshCw size={16} /> Refresh</button>
        {user?.role !== 'VIEWER' && <button onClick={simulate} disabled={simulating} className="btn-primary"><Zap size={16} /> {simulating ? 'Simulating…' : 'Run telemetry cycle'}</button>}
      </>}
    />

    {error && <div className="mb-5 rounded-xl border border-rose-400/15 bg-rose-400/5 p-4 text-sm text-rose-300">{error}</div>}

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, meta, icon: Icon, color, bg }) => (
        <div key={label} className="card p-5">
          <div className="flex items-start justify-between">
            <div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-3 text-2xl font-semibold tracking-tight text-white">{value ?? '—'}</p></div>
            <div className={`rounded-xl p-2.5 ${bg} ${color}`}><Icon size={19} /></div>
          </div>
          <div className="mt-5 flex items-center gap-2 border-t border-white/5 pt-4 text-[11px] text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-mint" />{meta}</div>
        </div>
      ))}
    </div>

    <div className="mt-5 grid gap-5 xl:grid-cols-[1.7fr_.8fr]">
      <section className="card p-5 sm:p-6">
        <div className="mb-6 flex items-center justify-between"><div><h2 className="section-title">Energy & power profile</h2><p className="section-subtitle">Hourly aggregation · last 24 hours</p></div><Activity className="text-mint" size={19} /></div>
        <div className="h-[310px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.energy || []} margin={{ left: -22, right: 8 }}>
              <defs>
                <linearGradient id="energy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#42d3ad" stopOpacity=".38" /><stop offset="1" stopColor="#42d3ad" stopOpacity="0" /></linearGradient>
                <linearGradient id="power" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6b94a" stopOpacity=".22" /><stop offset="1" stopColor="#f6b94a" stopOpacity="0" /></linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#26334a" strokeDasharray="3 6" />
              <XAxis dataKey="timestamp" tickFormatter={shortTime} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#111d33', border: '1px solid #27334a', borderRadius: 12, fontSize: 12 }} labelFormatter={dateTime} />
              <Area type="monotone" dataKey="powerKw" name="Power (kW)" stroke="#f6b94a" fill="url(#power)" strokeWidth={2} />
              <Area type="monotone" dataKey="energyKwh" name="Energy (kWh)" stroke="#42d3ad" fill="url(#energy)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <div><h2 className="section-title">Asset status</h2><p className="section-subtitle">Current fleet distribution</p></div>
        <div className="relative h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={82} paddingAngle={4} stroke="none">
              {statusData.map((entry) => <Cell key={entry.name} fill={pieColors[entry.name] || '#64748b'} />)}
            </Pie><Tooltip contentStyle={{ background: '#111d33', border: '1px solid #27334a', borderRadius: 12, fontSize: 12 }} /></PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><p className="text-3xl font-semibold text-white">{summary.totalDevices || 0}</p><p className="text-[10px] uppercase tracking-wider text-slate-500">Assets</p></div></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {statusData.map((item) => <div key={item.name} className="flex items-center gap-2 text-[11px] text-slate-400"><span className="h-2 w-2 rounded-full" style={{ background: pieColors[item.name] }} />{item.name} <b className="ml-auto text-slate-200">{item.value}</b></div>)}
        </div>
      </section>
    </div>

    <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4 sm:px-6"><div><h2 className="section-title">Asset health</h2><p className="section-subtitle">Lowest scores require attention first</p></div><BatteryCharging size={19} className="text-solar" /></div>
        <div className="divide-y divide-white/5">
          {[...(data?.devices || [])].sort((a, b) => a.healthScore - b.healthScore).slice(0, 5).map((device) => (
            <div key={device.id} className="flex items-center gap-4 px-5 py-4 sm:px-6">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/[.04] text-slate-400"><Cpu size={17} /></div>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-200">{device.name}</p><p className="mt-1 truncate text-[11px] text-slate-500">{device.location}</p></div>
              <div className="hidden w-28 sm:block"><div className="h-1.5 rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-solar to-mint" style={{ width: `${device.healthScore}%` }} /></div></div>
              <p className="w-10 text-right text-sm font-semibold text-white">{device.healthScore}%</p>
              <StatusBadge value={device.status} />
            </div>
          ))}
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4 sm:px-6"><div><h2 className="section-title">Active alerts</h2><p className="section-subtitle">Most recent unresolved findings</p></div><AlertTriangle size={19} className="text-rose-300" /></div>
        <div className="divide-y divide-white/5">
          {(data?.alerts || []).slice(0, 5).map((alert) => (
            <div key={alert.id} className="px-5 py-4 sm:px-6">
              <div className="flex items-start gap-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-400" /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="truncate text-xs font-semibold text-slate-200">{alert.deviceName}</p><StatusBadge value={alert.severity} /></div><p className="mt-1.5 line-clamp-2 text-[11px] leading-5 text-slate-500">{alert.message}</p></div></div>
            </div>
          ))}
          {(data?.alerts || []).length === 0 && <div className="p-10 text-center text-sm text-slate-500">No active alerts. The grid is stable.</div>}
        </div>
      </section>
    </div>
  </>
}

