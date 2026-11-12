import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Download, Leaf, ShieldCheck, Sun } from 'lucide-react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import api, { errorMessage } from '../services/api'
import PageHeader from '../components/PageHeader'
import LoadingState from '../components/LoadingState'
import { dateTime, label, number } from '../utils/format'

const severityColors = { LOW: '#38bdf8', MEDIUM: '#f6b94a', HIGH: '#fb923c', CRITICAL: '#fb7185' }

export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get('/dashboard/energy-production?hours=168'), api.get('/dashboard/anomaly-statistics'), api.get('/devices')])
      .then(([energy, anomalies, devices]) => setData({ energy: energy.data, anomalies: anomalies.data, devices: devices.data }))
      .catch((err) => setError(errorMessage(err)))
  }, [])

  const severityData = useMemo(() => data ? Object.entries(data.anomalies.bySeverity).map(([name, value]) => ({ name, value })) : [], [data])
  const typeData = useMemo(() => data ? Object.entries(data.anomalies.byType).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name: label(name), value })) : [], [data])
  const totalEnergy = (data?.energy || []).reduce((sum, point) => sum + point.energyKwh, 0)
  const peakPower = Math.max(0, ...(data?.energy || []).map((point) => point.powerKw))
  const averageHealth = (data?.devices || []).reduce((sum, device) => sum + device.healthScore, 0) / Math.max(1, data?.devices?.length || 0)

  const exportCsv = () => {
    const rows = ['timestamp,energy_kwh,power_kw', ...data.energy.map((item) => `${item.timestamp},${item.energyKwh},${item.powerKw}`)]
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' }))
    link.download = 'solargrid-energy-analytics.csv'; link.click(); URL.revokeObjectURL(link.href)
  }

  if (!data && !error) return <LoadingState />
  if (error) return <div className="rounded-xl border border-rose-400/15 bg-rose-400/5 p-4 text-rose-300">{error}</div>

  return <>
    <PageHeader title="Energy analytics" description="Seven-day production trends and the anomaly profile behind operational risk."
      actions={<button onClick={exportCsv} className="btn-secondary"><Download size={16} /> Export CSV</button>} />
    <div className="grid gap-4 sm:grid-cols-3">
      <Metric icon={Sun} title="7-day energy" value={`${number(totalEnergy)} kWh`} color="text-solar" />
      <Metric icon={BarChart3} title="Peak aggregate power" value={`${number(peakPower)} kW`} color="text-sky-300" />
      <Metric icon={ShieldCheck} title="Fleet health" value={`${number(averageHealth, 0)}%`} color="text-mint" />
    </div>

    <section className="card mt-5 p-5 sm:p-6"><div className="mb-6 flex items-center justify-between"><div><h2 className="section-title">Seven-day production</h2><p className="section-subtitle">Hourly energy contribution and aggregate power</p></div><Leaf size={19} className="text-mint" /></div><div className="h-[370px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.energy} margin={{ left: -20, right: 8 }}><defs><linearGradient id="weekly" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#42d3ad" stopOpacity=".35"/><stop offset="1" stopColor="#42d3ad" stopOpacity="0"/></linearGradient></defs><CartesianGrid vertical={false} stroke="#26334a" strokeDasharray="3 6"/><XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleDateString('en-GB', { weekday: 'short', hour: '2-digit' })} tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} minTickGap={32}/><YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false}/><Tooltip labelFormatter={dateTime} contentStyle={{ background: '#111d33', border: '1px solid #27334a', borderRadius: 12, fontSize: 12 }}/><Area type="monotone" dataKey="energyKwh" name="Energy kWh" stroke="#42d3ad" strokeWidth={2} fill="url(#weekly)"/></AreaChart></ResponsiveContainer></div></section>

    <div className="mt-5 grid gap-5 xl:grid-cols-2">
      <section className="card p-5 sm:p-6"><div className="mb-6"><h2 className="section-title">Alerts by severity</h2><p className="section-subtitle">All detected findings</p></div><div className="h-[280px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={severityData}><CartesianGrid vertical={false} stroke="#26334a" strokeDasharray="3 6"/><XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false}/><YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false}/><Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ background: '#111d33', border: '1px solid #27334a', borderRadius: 12, fontSize: 12 }}/><Bar dataKey="value" radius={[7,7,0,0]}>{severityData.map((item) => <Cell key={item.name} fill={severityColors[item.name]} />)}</Bar></BarChart></ResponsiveContainer></div></section>
      <section className="card p-5 sm:p-6"><div className="mb-6"><h2 className="section-title">Dominant anomaly classes</h2><p className="section-subtitle">Most frequently triggered detection rules</p></div><div className="h-[280px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={typeData} layout="vertical" margin={{ left: 20 }}><CartesianGrid horizontal={false} stroke="#26334a" strokeDasharray="3 6"/><XAxis type="number" allowDecimals={false} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false}/><YAxis type="category" dataKey="name" width={130} tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false}/><Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ background: '#111d33', border: '1px solid #27334a', borderRadius: 12, fontSize: 12 }}/><Bar dataKey="value" fill="#f6b94a" radius={[0,7,7,0]}/></BarChart></ResponsiveContainer></div></section>
    </div>
  </>
}

function Metric({ icon: Icon, title, value, color }) {
  return <div className="card flex items-center justify-between p-5"><div><p className="text-xs text-slate-500">{title}</p><p className="mt-2 text-xl font-semibold text-white">{value}</p></div><Icon size={22} className={color}/></div>
}

