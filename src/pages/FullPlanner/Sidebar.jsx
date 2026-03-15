import { fmt$K } from '../../utils/calculations'

export default function Sidebar({ nestEgg, projectedDuration, monteCarloRate }) {
  const metrics = [
    {
      label: 'Projected Nest Egg',
      value: nestEgg > 0 ? fmt$K(nestEgg) : '—',
      desc: 'From Scenario A accumulation',
      accent: true,
    },
    {
      label: 'Projected Duration',
      value: projectedDuration > 0 ? `${projectedDuration} yrs` : '—',
      desc: 'Years funds last from retirement',
      accent: false,
    },
    {
      label: 'Monte Carlo Survival',
      value: monteCarloRate != null ? `${monteCarloRate}%` : 'Run sim →',
      desc: monteCarloRate != null ? `Survived to target age` : 'Run Module 5 simulation',
      accent: false,
    },
  ]

  return (
    <aside className="lg:w-64 xl:w-72 flex-shrink-0">
      <div className="sticky top-20">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
          <div className="px-5 py-4 bg-ink">
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-0.5">
              Plan Summary
            </p>
            <p className="text-xs text-stone-500">Updates as you adjust inputs</p>
          </div>

          <div className="divide-y divide-stone-100">
            {metrics.map((m, i) => (
              <div key={i} className={`px-5 py-4 ${m.accent ? 'bg-accent/5' : ''}`}>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
                  {m.label}
                </p>
                <p
                  className={`font-mono text-xl font-bold leading-tight ${
                    m.accent ? 'text-accent' : 'text-ink'
                  }`}
                >
                  {m.value}
                </p>
                <p className="text-xs text-ink-light mt-0.5">{m.desc}</p>
              </div>
            ))}
          </div>

          <div className="px-5 py-4 bg-stone-50 border-t border-stone-100">
            <p className="text-xs text-ink-light leading-snug">
              Summary reflects Scenario A in the Scenario Comparison module.
              Each module may have its own independent inputs.
            </p>
          </div>
        </div>

        {/* Disclaimer card */}
        <div className="mt-4 px-4 py-3 rounded-xl border border-stone-200 bg-stone-50">
          <p className="text-xs text-ink-light leading-relaxed">
            All projections are illustrative. Not financial advice.
          </p>
        </div>
      </div>
    </aside>
  )
}
