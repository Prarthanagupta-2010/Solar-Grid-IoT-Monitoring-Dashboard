import { useEffect, useState } from 'react'
import { Shield, UserCheck, Users } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import api, { errorMessage } from '../services/api'
import PageHeader from '../components/PageHeader'
import LoadingState from '../components/LoadingState'
import StatusBadge from '../components/StatusBadge'
import { dateTime } from '../utils/format'
import { useAuth } from '../context/AuthContext'

export default function UsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState(null)
  const [error, setError] = useState('')

  const load = async () => {
    try { setUsers((await api.get('/users')).data); setError('') }
    catch (err) { setError(errorMessage(err)) }
  }
  useEffect(() => { if (user?.role === 'ADMIN') load() }, [user?.role])
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />
  if (!users && !error) return <LoadingState />

  const update = async (item, patch) => {
    try { await api.patch(`/users/${item.id}`, { role: item.role, enabled: item.enabled, ...patch }); await load() }
    catch (err) { setError(errorMessage(err)) }
  }

  return <>
    <PageHeader title="Access management" description="Assign least-privilege roles to engineers, operators and read-only stakeholders." />
    {error && <div className="mb-5 rounded-xl border border-rose-400/15 bg-rose-400/5 p-4 text-sm text-rose-300">{error}</div>}
    <div className="mb-5 grid gap-4 sm:grid-cols-3">
      <AccessCard icon={Users} title="Total accounts" value={users?.length || 0} />
      <AccessCard icon={Shield} title="Administrators" value={(users || []).filter((item) => item.role === 'ADMIN').length} />
      <AccessCard icon={UserCheck} title="Enabled" value={(users || []).filter((item) => item.enabled).length} />
    </div>
    <section className="card overflow-hidden"><div className="border-b border-white/5 px-5 py-4 sm:px-6"><h2 className="section-title">Platform users</h2><p className="section-subtitle">Role changes take effect on the next authenticated request</p></div><div className="overflow-x-auto"><table className="data-table"><thead><tr><th>User</th><th>Role</th><th>Account state</th><th>Created</th></tr></thead><tbody>
      {(users || []).map((item) => { const isSelf = item.id === user.id; return <tr key={item.id}><td><div><p className="font-medium text-slate-200">{item.fullName}{isSelf && <span className="ml-2 text-[10px] text-mint">YOU</span>}</p><p className="mt-1 text-[11px] text-slate-600">{item.email}</p></div></td><td><select disabled={isSelf} className="field w-40 py-2" value={item.role} onChange={(e) => update(item, { role: e.target.value })}>{['ADMIN','ENGINEER','OPERATOR','VIEWER'].map((value) => <option key={value}>{value}</option>)}</select></td><td><button disabled={isSelf} onClick={() => update(item, { enabled: !item.enabled })}><StatusBadge value={item.enabled ? 'ONLINE' : 'OFFLINE'} /></button></td><td className="whitespace-nowrap text-slate-500">{dateTime(item.createdAt)}</td></tr> })}
    </tbody></table></div></section>
  </>
}

function AccessCard({ icon: Icon, title, value }) {
  return <div className="card flex items-center justify-between p-5"><div><p className="text-xs text-slate-500">{title}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p></div><Icon size={21} className="text-mint" /></div>
}

