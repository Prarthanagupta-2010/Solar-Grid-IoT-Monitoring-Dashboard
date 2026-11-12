import { useEffect, useMemo, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import { Activity, Radio, RefreshCw, Wifi, WifiOff, Zap } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import api, { errorMessage } from '../services/api'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { dateTime, number, shortTime } from '../utils/format'
import { useAuth } from '../context/AuthContext'

export default function LiveMonitoringPage() {
  const [readings, setReadings] = useState([])
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState('')
  const [simulating, setSimulating] = useState(false)
  const clientRef = useRef(null)
  const { user } = useAuth()

  useEffect(() => {
    api.get('/sensor-readings/latest').then(({ data }) => setReadings(data.reverse())).catch((err) => setError(errorMessage(err)))
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const client = new Client({
      brokerURL: `${protocol}//${window.location.host}/ws`,
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setConnected(true)
        client.subscribe('/topic/readings', (message) => {
          const reading = JSON.parse(message.body)
          setReadings((current) => [...current, reading].slice(-120))
        })
      },
      onDisconnect: () => setConnected(false),
      onWebSocketClose: () => setConnected(false),
      onStompError: (frame) => setError(frame.headers.message || 'Live channel error'),
    })
    client.activate(); clientRef.current = client
    return () => { client.deactivate(); clientRef.current = null }
  }, [])

  const latestByDevice = useMemo(() => {
    const map = new Map()
    readings.forEach((reading) => map.set(reading.deviceId, reading))
    return [...map.values()].sort((a, b) => a.deviceName.localeCompare(b.deviceName))
  }, [readings])

  const timeline = readings.slice(-50)
  const simulate = async () => {
    setSimulating(true)
    try { await api.post('/sensor-readings/simulate') }
    catch (err) { setError(errorMessage(err)) }
    finally { setSimulating(false) }
  }

  return <>
    <PageHeader title="Live telemetry" description="WebSocket-streamed sensor measurements from the simulated solar microgrid."
      actions={<>{user?.role !== 'VIEWER' && <button onClick={simulate} disabled={simulating} className="btn-primary"><Zap size={16} /> {simulating ? 'Sending…' : 'Generate readings'}</button>}</>} />
    {error && <div className="mb-5 rounded-xl border border-rose-400/15 bg-rose-400/5 p-4 text-sm text-rose-300">{error}</div>}

    <div className="mb-5 flex flex-wrap gap-3">
      <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs ${connected ? 'border-emerald-400/15 bg-emerald-400/5 text-emerald-300' : 'border-rose-400/15 bg-rose-400/5 text-rose-300'}`}>
        {connected ? <Wifi size={14} /> : <WifiOff size={14} />}{connected ? 'WebSocket connected' : 'Reconnecting live channel'}
      </div>
      <div className="inline-flex items-center gap-2 rounded-full border border-white/[.06] bg-white/[.025] px-3 py-2 text-xs text-slate-400"><RefreshCw size={13} className="animate-spin-slow" /> Auto refresh · 5 seconds</div>
      <div className="inline-flex items-center gap-2 rounded-full border border-white/[.06] bg-white/[.025] px-3 py-2 text-xs text-slate-400"><Radio size={13} /> {readings.length} buffered samples</div>
    </div>

    <section className="card p-5 sm:p-6">
      <div className="mb-6 flex items-center justify-between"><div><h2 className="section-title">Streaming power signal</h2><p className="section-subtitle">Latest samples across connected assets</p></div><Activity size={19} className="text-mint" /></div>
      <div className="h-[320px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={timeline} margin={{ left: -20, right: 8 }}><CartesianGrid vertical={false} stroke="#26334a" strokeDasharray="3 6" /><XAxis dataKey="createdAt" tickFormatter={shortTime} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip labelFormatter={dateTime} contentStyle={{ background: '#111d33', border: '1px solid #27334a', borderRadius: 12, fontSize: 12 }} /><Line type="monotone" dataKey="power" name="Power kW" stroke="#42d3ad" strokeWidth={2} dot={(props) => props.payload.anomalous ? <circle key={`${props.cx}-${props.cy}`} cx={props.cx} cy={props.cy} r={4} fill="#fb7185" /> : null} /></LineChart></ResponsiveContainer></div>
    </section>

    <section className="card mt-5 overflow-hidden">
      <div className="border-b border-white/5 px-5 py-4 sm:px-6"><h2 className="section-title">Latest measurement per device</h2><p className="section-subtitle">Red rows indicate a rule-triggering sample</p></div>
      <div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Device</th><th>Voltage</th><th>Current</th><th>Power</th><th>Temperature</th><th>Frequency</th><th>Battery</th><th>Signal</th><th>Timestamp</th></tr></thead><tbody>
        {latestByDevice.map((reading) => <tr key={reading.deviceId} className={reading.anomalous ? 'bg-rose-400/[.025]' : ''}><td className="font-medium text-slate-200">{reading.deviceName}</td><td>{number(reading.voltage)} V</td><td>{number(reading.current)} A</td><td className="text-solar">{number(reading.power, 2)} kW</td><td>{number(reading.temperature)} °C</td><td>{number(reading.frequency, 2)} Hz</td><td>{number(reading.batteryLevel, 0)}%</td><td><StatusBadge value={reading.anomalous ? 'CRITICAL' : 'ONLINE'} /></td><td className="whitespace-nowrap text-slate-500">{dateTime(reading.createdAt)}</td></tr>)}
      </tbody></table></div>
    </section>
  </>
}

