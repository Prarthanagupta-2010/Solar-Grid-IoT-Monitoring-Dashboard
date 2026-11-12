export default function LoadingState({ label = 'Loading solar-grid data…' }) {
  return (
    <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-slate-400">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-mint" />
      {label}
    </div>
  )
}

