import { useState } from 'react'

export default function CollapsibleModule({
  number,
  title,
  description,
  defaultOpen = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-expanded={open}
      >
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-white text-sm font-bold flex items-center justify-center font-mono">
          {number}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-ink text-base leading-tight">{title}</h3>
          {description && (
            <p className="text-xs text-ink-muted mt-0.5 leading-snug">{description}</p>
          )}
        </div>
        <svg
          className={`flex-shrink-0 w-5 h-5 text-ink-muted transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-6 pb-6 border-t border-stone-100">
          <div className="pt-5">{children}</div>
        </div>
      )}
    </div>
  )
}
