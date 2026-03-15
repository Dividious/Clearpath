export default function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format = (v) => v,
  hint,
}) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="mb-5">
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          {label}
        </label>
        <span className="font-mono text-base font-semibold text-ink tabular-nums">
          {format(value)}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full"
          style={{
            background: `linear-gradient(to right, #0f6e56 ${pct}%, #e7e5e4 ${pct}%)`,
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-ink-light mt-1">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
      {hint && <p className="text-xs text-ink-light mt-1 leading-snug">{hint}</p>}
    </div>
  )
}
