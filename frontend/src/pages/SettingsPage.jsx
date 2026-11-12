import { Activity, BellRing, BookOpen, Database, ExternalLink, KeyRound, Radio, Server, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/AuthContext'

const rules = [
  ['High temperature', 'Panel or device temperature > 75 °C', 'HIGH'],
  ['Low battery', 'Battery state of charge < 20%', 'HIGH'],
  ['Voltage anomaly', 'Voltage < 180 V or > 260 V', 'CRITICAL'],
  ['Production drop', 'Power falls by more than 40% between samples', 'MEDIUM'],
  ['Frequency anomaly', 'Grid frequency outside 49.5–50.5 Hz', 'CRITICAL'],
  ['False data injection', 'Power contradicts measured voltage and current', 'CRITICAL'],
]

export default function SettingsPage() {
  const { user } = useAuth()
  return <>
    <PageHeader title="Platform settings" description="Runtime configuration, detection policy and API integration references." />
    <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
      <div className="space-y-5">
        <section className="card p-5 sm:p-6"><div className="mb-6 flex items-center gap-3"><div className="rounded-xl bg-mint/10 p-2.5 text-mint"><SlidersHorizontal size={19}/></div><div><h2 className="section-title">Runtime profile</h2><p className="section-subtitle">Active demo configuration</p></div></div><div className="space-y-1">
          <Setting icon={Radio} title="Telemetry interval" value="5 seconds" />
          <Setting icon={Database} title="Persistence" value="PostgreSQL" />
          <Setting icon={Server} title="API runtime" value="Spring Boot · Java 21" />
          <Setting icon={BellRing} title="Alert deduplication" value="Per device and open rule" />
          <Setting icon={KeyRound} title="Authenticated role" value={user?.role} />
        </div></section>
        <section className="card p-5 sm:p-6"><div className="flex items-start gap-4"><div className="rounded-xl bg-sky-400/10 p-3 text-sky-300"><BookOpen size={20}/></div><div><h2 className="section-title">API documentation</h2><p className="mt-2 text-sm leading-6 text-slate-500">Explore every REST contract and authorize requests with the JWT returned by login.</p><a href="http://localhost:8080/swagger-ui.html" target="_blank" rel="noreferrer" className="btn-secondary mt-4 inline-flex">Open Swagger UI <ExternalLink size={14}/></a></div></div></section>
      </div>

      <section className="card overflow-hidden"><div className="flex items-center gap-3 border-b border-white/5 p-5 sm:px-6"><div className="rounded-xl bg-rose-400/10 p-2.5 text-rose-300"><ShieldCheck size={19}/></div><div><h2 className="section-title">Detection policy</h2><p className="section-subtitle">Transparent rule-based anomaly logic</p></div></div><div className="divide-y divide-white/5">
        {rules.map(([name, condition, severity]) => <div key={name} className="flex items-center gap-4 p-5 sm:px-6"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[.04] text-slate-500"><Activity size={15}/></div><div className="min-w-0 flex-1"><p className="text-sm font-medium text-slate-200">{name}</p><p className="mt-1 text-[11px] text-slate-500">{condition}</p></div><span className={`text-[10px] font-bold tracking-wider ${severity === 'CRITICAL' ? 'text-rose-300' : severity === 'HIGH' ? 'text-orange-300' : 'text-amber-300'}`}>{severity}</span></div>)}
      </div><div className="border-t border-white/5 bg-white/[.015] p-5 text-[11px] leading-5 text-slate-600 sm:px-6">Rules are intentionally interpretable for a GitHub-ready MVP. The service layer can later be replaced or augmented with federated-learning anomaly scores.</div></section>
    </div>
  </>
}

function Setting({ icon: Icon, title, value }) {
  return <div className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-white/[.025]"><Icon size={16} className="text-slate-600"/><span className="flex-1 text-xs text-slate-500">{title}</span><b className="text-xs font-medium text-slate-300">{value}</b></div>
}

