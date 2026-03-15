import { useState, useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import Slider from '../../../components/Slider'
import MetricCard from '../../../components/MetricCard'
import { calculateTaxComparison, fmt$, fmt$K } from '../../../utils/calculations'

const TEAL = 'rgba(15,110,86,0.82)'
const BLUE = 'rgba(45,74,122,0.82)'
const AMBER = 'rgba(217,119,6,0.82)'

const ACCOUNT_TYPES = [
  {
    key: 'traditional',
    label: 'Traditional',
    sub: '401(k) / Traditional IRA',
    desc: 'Pre-tax contributions. Tax deduction now. All withdrawals taxed as ordinary income.',
    color: TEAL,
  },
  {
    key: 'roth',
    label: 'Roth',
    sub: 'Roth 401(k) / Roth IRA',
    desc: 'After-tax contributions. No deduction. All withdrawals — including gains — tax-free.',
    color: BLUE,
  },
  {
    key: 'taxable',
    label: 'Taxable Brokerage',
    sub: 'Regular investment account',
    desc: 'No deduction. Dividends taxed annually. Long-term capital gains rate at withdrawal.',
    color: AMBER,
  },
]

export default function TaxTreatment() {
  const [annualContrib, setAnnualContrib] = useState(6000)
  const [years, setYears] = useState(30)
  const [returnRate, setReturnRate] = useState(7)
  const [currentTaxRate, setCurrentTaxRate] = useState(24)
  const [retirementTaxRate, setRetirementTaxRate] = useState(18)

  const result = useMemo(
    () =>
      calculateTaxComparison(annualContrib, years, returnRate, currentTaxRate, retirementTaxRate),
    [annualContrib, years, returnRate, currentTaxRate, retirementTaxRate]
  )

  const { traditional, roth, taxable } = result

  // Grouped bar chart
  const chartData = {
    labels: ['Pre-Tax Balance', 'After-Tax Value'],
    datasets: [
      {
        label: 'Traditional',
        data: [traditional.balance, traditional.afterTax],
        backgroundColor: TEAL,
        borderRadius: 4,
      },
      {
        label: 'Roth',
        data: [roth.balance, roth.afterTax],
        backgroundColor: BLUE,
        borderRadius: 4,
      },
      {
        label: 'Taxable',
        data: [taxable.balance, taxable.afterTax],
        backgroundColor: AMBER,
        borderRadius: 4,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true, padding: 16, font: { size: 11 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${fmt$(ctx.raw)}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 12, weight: '500' } } },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { callback: (v) => fmt$K(v), font: { size: 11 } },
      },
    },
  }

  // Winner
  const winner = [
    { label: 'Traditional', val: traditional.afterTax },
    { label: 'Roth', val: roth.afterTax },
    { label: 'Taxable', val: taxable.afterTax },
  ].sort((a, b) => b.val - a.val)[0]

  const taxDrag = {
    traditional: ((traditional.balance - traditional.afterTax) / traditional.balance) * 100,
    roth: 0,
    taxable: ((taxable.balance - taxable.afterTax) / taxable.balance) * 100,
  }

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
        <Slider
          label="Annual Contribution"
          value={annualContrib}
          min={500}
          max={30000}
          step={500}
          onChange={setAnnualContrib}
          format={(v) => `${fmt$(v)}/yr`}
          hint="Same contribution amount compared across account types"
        />
        <Slider
          label="Years Until Retirement"
          value={years}
          min={5}
          max={45}
          step={1}
          onChange={setYears}
          format={(v) => `${v} yrs`}
        />
        <Slider
          label="Annual Return Rate"
          value={returnRate}
          min={2}
          max={15}
          step={0.5}
          onChange={setReturnRate}
          format={(v) => `${v}%`}
        />
        <Slider
          label="Current Marginal Tax Rate"
          value={currentTaxRate}
          min={10}
          max={37}
          step={1}
          onChange={setCurrentTaxRate}
          format={(v) => `${v}%`}
          hint="Your marginal rate on ordinary income today"
        />
        <Slider
          label="Expected Retirement Tax Rate"
          value={retirementTaxRate}
          min={0}
          max={37}
          step={1}
          onChange={setRetirementTaxRate}
          format={(v) => `${v}%`}
          hint="Most retirees are in a lower bracket. Default: lower than current"
        />
      </div>

      {/* Tax rate comparison note */}
      {retirementTaxRate < currentTaxRate && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3">
          <p className="text-xs text-emerald-800">
            <strong>Traditional favored:</strong> Your retirement rate ({retirementTaxRate}%) is
            lower than current ({currentTaxRate}%), so deferring taxes to retirement saves money.
            Roth is still valuable for tax diversification and flexibility.
          </p>
        </div>
      )}
      {retirementTaxRate > currentTaxRate && (
        <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
          <p className="text-xs text-blue-800">
            <strong>Roth favored:</strong> Your retirement rate ({retirementTaxRate}%) is higher
            than current ({currentTaxRate}%), so paying taxes now at the lower rate is advantageous.
          </p>
        </div>
      )}

      {/* Account type cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ACCOUNT_TYPES.map(({ key, label, sub, desc, color }) => {
          const res = result[key]
          const isWinner = winner.label === label
          return (
            <div
              key={key}
              className={`bg-white rounded-2xl border-2 p-5 ${
                isWinner ? 'border-accent shadow-card-hover' : 'border-stone-200'
              }`}
            >
              {isWinner && (
                <span className="inline-block mb-2 px-2 py-0.5 rounded-full bg-accent text-white text-xs font-semibold">
                  Best after-tax value
                </span>
              )}
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: color }} />
                <div>
                  <p className="font-semibold text-sm text-ink">{label}</p>
                  <p className="text-xs text-ink-muted">{sub}</p>
                </div>
              </div>
              <p className="text-xs text-ink-light mb-4 leading-snug">{desc}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-muted">Pre-tax balance</span>
                  <span className="font-mono font-semibold text-ink">{fmt$K(res.balance)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-stone-100 pt-2">
                  <span className="text-ink font-medium">After-tax value</span>
                  <span className="font-mono font-bold text-accent">{fmt$K(res.afterTax)}</span>
                </div>
                <div className="flex justify-between text-xs text-ink-muted">
                  <span>Tax drag</span>
                  <span>{(taxDrag[key] || 0).toFixed(1)}%</span>
                </div>
                {key === 'taxable' && (
                  <div className="flex justify-between text-xs text-ink-muted">
                    <span>LTCG rate applied</span>
                    <span>{taxable.ltcgRate.toFixed(0)}%</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-4">
          Pre-tax vs after-tax value by account type
        </p>
        <div className="chart-wrapper" style={{ height: 240 }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Contribution limits note */}
      <div className="rounded-xl bg-stone-50 border border-stone-200 p-4">
        <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
          2025 Contribution Limits
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
          {[
            { label: '401(k)', limit: '$23,500 ($31,000 50+)' },
            { label: 'IRA / Roth IRA', limit: '$7,000 ($8,000 50+)' },
            { label: 'SEP-IRA', limit: '25% of comp, max $70,000' },
            { label: 'SIMPLE IRA', limit: '$16,500 ($20,000 50+)' },
          ].map((item) => (
            <div key={item.label} className="text-xs">
              <p className="font-semibold text-ink">{item.label}</p>
              <p className="text-ink-muted">{item.limit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-ink-light bg-stone-50 rounded-lg p-3 border border-stone-100 leading-relaxed">
        This is a simplified comparison using a single contribution amount and flat tax rates.
        Actual tax treatment depends on income brackets, state taxes, filing status, income phase-outs,
        RMD rules (Traditional accounts), Roth conversion strategies, and other factors. Consult a CPA
        or tax advisor for a personalized analysis.
      </p>
    </div>
  )
}
