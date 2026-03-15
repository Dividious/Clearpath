import { useState, useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import Slider from '../../../components/Slider'
import { calculateSSBreakeven, fmt$ } from '../../../utils/calculations'

const C62 = '#e11d48'    // rose
const C67 = '#0f6e56'    // teal
const C70 = '#2d4a7a'    // slate blue

export default function SocialSecurityBreakeven() {
  const [monthlyBenefit, setMonthlyBenefit] = useState(1976)
  const [currentAge, setCurrentAge] = useState(55)

  const data = useMemo(() => calculateSSBreakeven(monthlyBenefit), [monthlyBenefit])

  const { ages, cum62, cum67, cum70, crossovers, monthlyBenefits } = data

  // Annotate crossover ages on chart
  const crossover6267 = crossovers['62vs67']
  const crossover6770 = crossovers['67vs70']

  const chartData = {
    labels: ages,
    datasets: [
      {
        label: 'Claim at 62',
        data: cum62,
        borderColor: C62,
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.1,
      },
      {
        label: 'Claim at 67 (FRA)',
        data: cum67,
        borderColor: C67,
        backgroundColor: 'transparent',
        borderWidth: 2.5,
        pointRadius: 0,
        tension: 0.1,
      },
      {
        label: 'Claim at 70',
        data: cum70,
        borderColor: C70,
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.1,
        borderDash: [5, 3],
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true, padding: 16, font: { size: 11 } },
      },
      tooltip: {
        callbacks: {
          title: (items) => `Age ${items[0].label}`,
          label: (ctx) =>
            ` ${ctx.dataset.label}: ${fmt$(ctx.raw)} cumulative`,
        },
      },
    },
    scales: {
      x: {
        type: 'category',
        grid: { display: false },
        ticks: {
          font: { size: 11 },
          maxTicksLimit: 15,
          callback: (_, i) => ages[i],
        },
        title: { display: true, text: 'Age', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { callback: (v) => `$${(v / 1000).toFixed(0)}k`, font: { size: 11 } },
        title: {
          display: true,
          text: 'Cumulative SS Income',
          font: { size: 11 },
        },
      },
    },
  }

  // Annual benefits
  const ann62 = monthlyBenefit * 12 * 0.70
  const ann67 = monthlyBenefit * 12
  const ann70 = monthlyBenefit * 12 * 1.24

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Slider
          label="Monthly Benefit at Full Retirement Age (67)"
          value={monthlyBenefit}
          min={500}
          max={4000}
          step={50}
          onChange={setMonthlyBenefit}
          format={(v) => `$${v.toLocaleString()}/mo`}
          hint="Check your estimate at ssa.gov/myaccount"
        />
        <Slider
          label="Your Current Age"
          value={currentAge}
          min={40}
          max={69}
          step={1}
          onChange={setCurrentAge}
          format={(v) => `${v}`}
        />
      </div>

      {/* Benefit cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { age: 62, factor: '70%', monthly: monthlyBenefits.age62, annual: ann62, color: C62, label: 'Early (Reduced)' },
          { age: 67, factor: '100%', monthly: monthlyBenefits.age67, annual: ann67, color: C67, label: 'Full Ret. Age' },
          { age: 70, factor: '124%', monthly: monthlyBenefits.age70, annual: ann70, color: C70, label: 'Delayed (Max)' },
        ].map((item) => (
          <div
            key={item.age}
            className="bg-white rounded-xl border border-stone-200 p-4 space-y-2"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: item.color }}
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Age {item.age}
              </span>
            </div>
            <p className="font-mono text-xl font-semibold text-ink">
              ${Number(item.monthly).toLocaleString()}<span className="text-sm font-normal text-ink-muted">/mo</span>
            </p>
            <p className="text-xs text-ink-muted">{fmt$(item.annual)}/yr · {item.factor} of FRA</p>
            <p className="text-xs text-stone-400 italic">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Crossover info */}
      <div className="rounded-xl bg-stone-50 border border-stone-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
            62 vs 67 breakeven age
          </p>
          <p className="font-mono text-lg font-semibold text-ink">
            Age {crossover6267}
          </p>
          <p className="text-xs text-ink-muted mt-0.5">
            Claiming at 67 surpasses age-62 cumulative at this age
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
            67 vs 70 breakeven age
          </p>
          <p className="font-mono text-lg font-semibold text-ink">
            Age {crossover6770}
          </p>
          <p className="text-xs text-ink-muted mt-0.5">
            Claiming at 70 surpasses age-67 cumulative at this age
          </p>
        </div>
      </div>

      {/* Crossover chart */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
          Cumulative Social Security income by claiming age
        </p>
        <p className="text-xs text-ink-light mb-4">
          Where lines cross = breakeven point between strategies
        </p>
        <div className="chart-wrapper" style={{ height: 280 }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Disclosure */}
      <p className="text-xs text-ink-light bg-stone-50 rounded-lg p-3 border border-stone-100 leading-relaxed">
        These calculations don't account for investment returns on early benefits, taxation of
        benefits, or survivor considerations. Benefit amounts assume no work after claiming.
        Consult{' '}
        <a
          href="https://www.ssa.gov"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-accent hover:text-accent-dark"
        >
          SSA.gov
        </a>{' '}
        or a financial advisor for a personalized estimate.
      </p>
    </div>
  )
}
