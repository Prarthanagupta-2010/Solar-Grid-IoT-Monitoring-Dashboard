import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Activity, ArrowRight, LockKeyhole, ShieldCheck, Sun, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../services/api'

export default function LoginPage() {
  const { user, login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    fullName: '', email: 'admin@solargrid.local', password: 'Admin123!',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') await login(form.email, form.password)
      else await register(form)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative grid min-h-screen overflow-hidden bg-ink lg:grid-cols-[1.15fr_.85fr]">
      <div className="pointer-events-none absolute -left-40 top-20 h-[550px] w-[550px] rounded-full bg-mint/[.07] blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-250px] left-[35%] h-[600px] w-[600px] rounded-full bg-solar/[.08] blur-3xl" />

      <section className="relative hidden min-h-screen flex-col justify-between border-r border-white/5 p-14 lg:flex xl:p-20">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-solar to-orange-500 text-ink"><Zap size={24} fill="currentColor" /></div>
          <div><p className="text-xs font-bold tracking-[.26em] text-solar">SOLARGRID</p><p className="font-semibold text-white">Command Center</p></div>
        </div>

        <div className="max-w-2xl">
          <p className="mb-5 text-xs font-bold tracking-[.24em] text-mint">SMART ENERGY · TRUSTED DATA</p>
          <h1 className="text-5xl font-semibold leading-[1.1] tracking-[-.04em] text-white xl:text-6xl">
            See every watt.<br /><span className="text-slate-500">Catch every anomaly.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-slate-400">
            Monitor solar assets, stream IoT telemetry and turn abnormal signals into clear maintenance decisions.
          </p>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {[
              [Activity, 'Real-time', 'Telemetry'],
              [ShieldCheck, 'Rule-based', 'Detection'],
              [Sun, 'Solar-first', 'Analytics'],
            ].map(([Icon, top, bottom]) => (
              <div key={top} className="rounded-2xl border border-white/[.06] bg-white/[.025] p-4">
                <Icon size={19} className="mb-4 text-mint" />
                <p className="text-xs font-semibold text-slate-200">{top}</p><p className="mt-1 text-[11px] text-slate-500">{bottom}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-600">IoT monitoring · Smart-grid security · Decision support</p>
      </section>

      <section className="relative flex min-h-screen items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-9 flex items-center gap-3 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-solar text-ink"><Zap size={21} fill="currentColor" /></div>
            <p className="font-semibold text-white">SolarGrid Command Center</p>
          </div>
          <div className="rounded-3xl border border-white/[.07] bg-[#101c31]/90 p-6 shadow-glow backdrop-blur-xl sm:p-9">
            <div className="mb-7 flex h-11 w-11 items-center justify-center rounded-xl bg-mint/10 text-mint"><LockKeyhole size={20} /></div>
            <h2 className="text-2xl font-semibold text-white">{mode === 'login' ? 'Welcome back' : 'Create viewer account'}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {mode === 'login' ? 'Sign in to access live operations and analytics.' : 'New accounts receive read-only Viewer access.'}
            </p>

            <form onSubmit={submit} className="mt-7 space-y-4">
              {mode === 'register' && (
                <label className="block text-xs font-medium text-slate-400">Full name
                  <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="field mt-2" placeholder="Your name" />
                </label>
              )}
              <label className="block text-xs font-medium text-slate-400">Email address
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="field mt-2" placeholder="name@company.com" />
              </label>
              <label className="block text-xs font-medium text-slate-400">Password
                <input required minLength="8" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="field mt-2" />
              </label>

              {error && <div className="rounded-xl border border-rose-400/15 bg-rose-400/5 px-4 py-3 text-xs text-rose-300">{error}</div>}

              <button disabled={busy} className="btn-primary mt-2 w-full justify-center">
                {busy ? 'Please wait…' : mode === 'login' ? 'Open command center' : 'Create account'}
                {!busy && <ArrowRight size={17} />}
              </button>
            </form>

            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }} className="mt-5 w-full text-center text-xs text-slate-500 hover:text-slate-300">
              {mode === 'login' ? 'Need read-only access? Create an account' : 'Already registered? Sign in'}
            </button>
          </div>
          <p className="mt-5 text-center text-[11px] text-slate-600">Demo: admin@solargrid.local · Admin123!</p>
        </div>
      </section>
    </div>
  )
}

