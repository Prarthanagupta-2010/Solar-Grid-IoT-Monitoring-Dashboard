export default function PageHeader({ eyebrow = 'SOLARGRID COMMAND CENTER', title, description, actions }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        <p className="mb-2 text-[11px] font-bold tracking-[.22em] text-mint">{eyebrow}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

