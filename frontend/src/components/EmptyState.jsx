import { Inbox } from 'lucide-react'

export default function EmptyState({ title = 'Nothing to show', text = 'No records match this view.' }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center text-center">
      <div className="mb-4 rounded-2xl bg-slate-800 p-3 text-slate-400"><Inbox size={24} /></div>
      <p className="font-semibold text-slate-200">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
    </div>
  )
}

