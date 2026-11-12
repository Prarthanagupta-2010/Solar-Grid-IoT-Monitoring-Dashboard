import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Battery, CalendarDays, Cpu, Gauge, MapPin, Radio, Thermometer, Zap } from 'lucide-react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import api, { errorMessage } from '../services/api'
import LoadingState from '../components/LoadingState'
import StatusBadge from '../components/StatusBadge'
import { dateTime, label, number, shortTime } from '../utils/format'

export default function DeviceDetailPage() {
  const { id } = useParams()
  const [device, setDevice] = useState(null)
  const [readings, setReadings] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get(`/devices/${id}`), api.get(`/devices/${id}/readings?limit=80`)])
      .then(([deviceResult, readingResult]) => { setDevice(deviceResult.data); setReadings(readingResult.data.reverse()) })
      .catch((err) => setError(errorMessage(err)))
  }, [id])

  if (!device && !error) return <LoadingState />
  if (error) return <div className="rounded-xl border border-rose-400/15 bg-rose-400/5 p-4 text-rose-300">{error}</div>
  const latest = readings.at(-1)

  return <>
    <Link to="/devices" className="mb-5 inline-flex items-center gap-2 text-xs text-slate-500 hover:text-mint"><ArrowLeft size={15} /> Back to inventory</Link>
    <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div><p className="mb-2 text-[11px] font-bold tracking-[.22em] text-mint">ASSET DIGITAL TWIN</p><div className="flex items-center gap-3"><h1 className="text-3xl font-semibold text-white">{device.name}</h1><StatusBadge value={device.status} /></div><p className="mt-2 text-sm text-slate-500">{device.serialNumber} · {label(device.type)}</p></div>
      <div className="rounded-2xl border border-white/[.06] bg-white/[.025] px-5 py-3 text-right"><p className="text-[10px] uppercase tracking-wider text-slate-500">Computed health</p><p className="mt-1 text-2xl font-semibold text-mint">{device.healthScore}%</p></div>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[
        [Zap, 'Power output', `${number(latest?.power, 2)} kW`, 'text-solar', 'bg-solar/10'],
        [Gauge, 'Voltage', `${number(latest?.voltage, 1)} V`, 'text-sky-300', 'bg-sky-400/10'],
        [Thermometer, 'Temperature', `${number(latest?.temperature, 1)} °C`, 'text-rose-300', 'bg-rose-400/10'],
        [Battery, 'Battery', `${number(latest?.batteryLevel, 0)}%`, 'text-mint', 'bg-mint/10'],
      ].map(([Icon, title, value, color, bg]) => <div key={title} className="card flex items-center gap-4 p-5"><div className={`rounded-xl p-3 ${bg} ${color}`}><Icon size={20} /></div><div><p className="text-[11px] text-slate-500">{title}</p><p className="mt-1 text-lg font-semibold text-white">{value}</p></div></div>)}
    </div>

    <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_.7fr]">
      <section className="card p-5 sm:p-6"><div className="mb-6"><h2 className="section-title">Telemetry timeline</h2><p className="section-subtitle">Power, temperature and battery history</p></div><div className="h-[360px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={readings} margin={{ left: -20, right: 8 }}><CartesianGrid vertical={false} stroke="#26334a" strokeDasharray="3 6" /><XAxis dataKey="createdAt" tickFormatter={shortTime} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip labelFormatter={dateTime} contentStyle={{ background: '#111d33', border: '1px solid #27334a', borderRadius: 12, fontSize: 12 }} /><Legend wrapperStyle={{ fontSize: 11, paddingTop: 15 }} /><Line dot={false} type="monotone" dataKey="power" name="Power kW" stroke="#f6b94a" strokeWidth={2} /><Line dot={false} type="monotone" dataKey="temperature" name="Temperature °C" stroke="#fb7185" strokeWidth={2} /><Line dot={false} type="monotone" dataKey="batteryLevel" name="Battery %" stroke="#42d3ad" strokeWidth={2} /></LineChart></ResponsiveContainer></div></section>

      <section className="card overflow-hidden"><div className="border-b border-white/5 p-5 sm:px-6"><h2 className="section-title">Asset profile</h2><p className="section-subtitle">Registry and connection details</p></div><div className="space-y-5 p-5 sm:p-6">
        <Detail icon={Cpu} title="Device type" value={label(device.type)} />
        <Detail icon={MapPin} title="Location" value={device.location} />
        <Detail icon={CalendarDays} title="Installed" value={device.installationDate} />
        <Detail icon={Radio} title="Last telemetry" value={dateTime(device.lastSeenAt)} />
      </div><div className="border-t border-white/5 p-5 sm:px-6"><div className="flex items-center justify-between text-xs"><span className="text-slate-500">Anomalous samples</span><b className="text-rose-300">{readings.filter((r) => r.anomalous).length}</b></div><div className="mt-3 h-1.5 rounded-full bg-slate-800"><div className="h-full rounded-full bg-rose-400" style={{ width: `${Math.min(100, readings.filter((r) => r.anomalous).length * 8)}%` }} /></div></div></section>
    </div>
  </>
}

function Detail({ icon: Icon, title, value }) {
  return <div className="flex gap-3"><div className="mt-0.5 text-slate-600"><Icon size={17} /></div><div><p className="text-[10px] uppercase tracking-wider text-slate-600">{title}</p><p className="mt-1 text-sm text-slate-300">{value}</p></div></div>
}

