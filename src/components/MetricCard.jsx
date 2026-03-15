export default function MetricCard({ label, value, sub, accent = false, size = 'md' }) {
  return (
    <div
      className={`rounded-xl p-4 border ${
        accent
          ? 'bg-accent text-white border-accent-dark'
          : 'bg-white border-stone-200'
      }`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
          accent ? 'text-green-100' : 'text-ink-muted'
        }`}
      >
        {label}
      </p>
      <p
        className={`font-mono font-semibold leading-tight tabular-nums ${
          size === 'lg' ? 'text-2xl' : 'text-xl'
        } ${accent ? 'text-white' : 'text-ink'}`}
      >
        {value}
      </p>
      {sub && (
        <p
          className={`text-xs mt-1 ${
            accent ? 'text-green-100' : 'text-ink-light'
          }`}
        >
          {sub}
        </p>
      )}
    </div>
  )
}
