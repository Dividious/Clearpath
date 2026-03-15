import { useState, useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import Slider from '../../../components/Slider'
import MetricCard from '../../../components/MetricCard'
import { calculateAccumulation, calculateDrawdown, fmt$, fmt$K } from '../../../utils/calculations'

const TEAL = 'rgba(15,110,86,0.85)'
const TEAL_LIGHT = 'rgba(74,172,142,0.75)'
const BLUE = 'rgba(45,74,122,0.85)'
const BLUE_LIGHT = 'rgba(100,140,210,0.75)'

export default function SpousePartnerMode({ sharedState }) {
  const [enabled, setEnabled] = useState(false)
  const [survivorEnabled, setSurvivorEnabled] = useState(false)

  // Primary
  const [pStart, setPStart] = useState(sharedState?.startAmount ?? 10000)
  const [pContrib, setPContrib] = useState(sharedState?.annualContrib ?? 6000)
  const [pReturn, setPReturn] = useState(sharedState?.returnRate ?? 7)
  const [pYears, setPYears] = useState(sharedState?.years ?? 30)
  const [pSSIncome, setPSSIncome] = useState(23712)
  const [pRetAge, setPRetAge] = useState(65)

  // Partner
  const [sStart, setSStart] = useState(5000)
  const [sContrib, setSContrib] = useState(4000)
  const [sReturn, setSReturn] = useState(6)
  const [sYears, setSYears] = useState(28)
  const [sSSIncome, setSSSIncome] = useState(14400)
  const [sRetAge, setSRetAge] = useState(63)
  const [survivorBenefit, setSurvivorBenefit] = useState(100)

  // Shared drawdown
  const [annualSpending, setAnnualSpending] = useState(61432)
  const [returnRate, setReturnRate] = useState(4)
  const [inflation, setInflation] = useState(2.5)

  // Survivor scenario
  const [partnerAPassAge, setPartnerAPassAge] = useState(78)

  const resP = useMemo(
    () => calculateAccumulation(pStart, pContrib, pReturn, pYears),
    [pStart, pContrib, pReturn, pYears]
  )
  const resS = useMemo(
    () => calculateAccumulation(sStart, sContrib, sReturn, sYears),
    [sStart, sContrib, sReturn, sYears]
  )

  const combinedNestEgg = enabled ? resP.finalBalance + resS.finalBalance : resP.finalBalance

  const combinedSS = enabled ? pSSIncome + sSSIncome : pSSIncome

  const resDraw = useMemo(
    () =>
      calculateDrawdown(
        combinedNestEgg,
        annualSpending,
        combinedSS,
        returnRate,
        inflation,
        Math.min(pRetAge, enabled ? sRetAge : pRetAge)
      ),
    [combinedNestEgg, annualSpending, combinedSS, returnRate, inflation, pRetAge, sRetAge, enabled]
  )

  // Survivor scenario: at partnerAPassAge, recalculate with single SS and reduced spending
  const resSurvivor = useMemo(() => {
    if (!survivorEnabled || !enabled) return null
    const retirementAge = Math.min(pRetAge, sRetAge)
    const survivorAge = partnerAPassAge
    if (survivorAge <= retirementAge) return null

    // Find balance at partnerAPassAge
    const { ages, balances } = resDraw.chartData
    const idx = ages.findIndex((a) => a >= survivorAge)
    const balanceAtDeath = idx >= 0 ? balances[idx] : 0

    // Survivor gets higher of the two SS benefits
    const survivorSS = Math.max(pSSIncome, sSSIncome * (survivorBenefit / 100))
    const survivorSpending = annualSpending * 0.75 // typical: survivor spends ~75% of couple

    return calculateDrawdown(
      balanceAtDeath,
      survivorSpending,
      survivorSS,
      returnRate,
      inflation,
      survivorAge
    )
  }, [
    survivorEnabled,
    enabled,
    partnerAPassAge,
    resDraw,
    pRetAge,
    sRetAge,
    pSSIncome,
    sSSIncome,
    survivorBenefit,
    annualSpending,
    returnRate,
    inflation,
  ])

  // Build chart — side-by-side accumulation bars for both partners
  const maxYears = Math.max(pYears, enabled ? sYears : pYears)
  const sampleEvery = maxYears > 20 ? 5 : 2
  const yearLabels = Array.from({ length: Math.ceil(maxYears / sampleEvery) + 1 }, (_, i) =>
    i * sampleEvery
  ).filter((y) => y <= maxYears)

  const getPBalance = (y) => {
    if (y > pYears) return null
    const d = resP.chartData
    const idx = Math.min(y, d.principal.length - 1)
    return d.principal[idx] + d.contributions[idx] + d.interest[idx]
  }
  const getSBalance = (y) => {
    if (!enabled || y > sYears) return null
    const d = resS.chartData
    const idx = Math.min(y, d.principal.length - 1)
    return d.principal[idx] + d.contributions[idx] + d.interest[idx]
  }

  const chartData = {
    labels: yearLabels.map((y) => `Yr ${y}`),
    datasets: [
      {
        label: 'Primary — Principal',
        data: yearLabels.map((y) => (y <= pYears ? resP.chartData.principal[y] : null)),
        backgroundColor: TEAL,
        stack: 'primary',
        borderRadius: { topLeft: 0, topRight: 0 },
      },
      {
        label: 'Primary — Growth',
        data: yearLabels.map((y) => {
          if (y > pYears) return null
          const d = resP.chartData
          return d.contributions[y] + d.interest[y]
        }),
        backgroundColor: TEAL_LIGHT,
        stack: 'primary',
        borderRadius: { topLeft: 4, topRight: 4 },
      },
      ...(enabled
        ? [
            {
              label: 'Partner — Principal',
              data: yearLabels.map((y) => (y <= sYears ? resS.chartData.principal[y] : null)),
              backgroundColor: BLUE,
              stack: 'partner',
              borderRadius: { topLeft: 0, topRight: 0 },
            },
            {
              label: 'Partner — Growth',
              data: yearLabels.map((y) => {
                if (y > sYears) return null
                const d = resS.chartData
                return d.contributions[y] + d.interest[y]
              }),
              backgroundColor: BLUE_LIGHT,
              stack: 'partner',
              borderRadius: { topLeft: 4, topRight: 4 },
            },
          ]
        : []),
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12, font: { size: 11 } } },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${fmt$(ctx.raw ?? 0)}`,
        },
      },
    },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { font: { size: 11 } } },
      y: {
        stacked: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { callback: (v) => fmt$K(v), font: { size: 11 } },
      },
    },
  }

  const fmtD = (v) => fmt$K(v)

  return (
    <div className="space-y-6">
      {/* Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setEnabled((e) => !e)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? 'bg-accent' : 'bg-stone-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className="text-sm font-medium text-ink">Include a partner?</span>
      </div>

      {/* Shared drawdown inputs */}
      <div className="bg-stone-50 rounded-xl border border-stone-200 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-4">
          Shared retirement spending
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6">
          <Slider label="Annual Spending" value={annualSpending} min={20000} max={200000} step={1000} onChange={setAnnualSpending} format={fmt$} />
          <Slider label="Portfolio Return" value={returnRate} min={0} max={12} step={0.5} onChange={setReturnRate} format={(v) => `${v}%`} />
          <Slider label="Inflation" value={inflation} min={1} max={8} step={0.5} onChange={setInflation} format={(v) => `${v}%`} />
        </div>
      </div>

      {/* Partner inputs */}
      <div className={`grid grid-cols-1 ${enabled ? 'md:grid-cols-2' : ''} gap-5`}>
        {/* Primary */}
        <div className="bg-white rounded-2xl border-2 border-accent p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-accent mb-4">Primary</p>
          <Slider label="Starting Amount" value={pStart} min={0} max={100000} step={1000} onChange={setPStart} format={fmtD} />
          <Slider label="Annual Contribution" value={pContrib} min={0} max={30000} step={500} onChange={setPContrib} format={(v) => `${fmt$(v)}/yr`} />
          <Slider label="Return Rate" value={pReturn} min={1} max={15} step={0.5} onChange={setPReturn} format={(v) => `${v}%`} />
          <Slider label="Working Years" value={pYears} min={1} max={50} step={1} onChange={setPYears} format={(v) => `${v} yrs`} />
          <Slider label="SS Income" value={pSSIncome} min={0} max={60000} step={500} onChange={setPSSIncome} format={fmt$} />
          <Slider label="Retirement Age" value={pRetAge} min={50} max={75} step={1} onChange={setPRetAge} format={(v) => `${v}`} />
        </div>

        {/* Partner (only when enabled) */}
        {enabled && (
          <div className="bg-white rounded-2xl border-2 border-slate-brand p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-brand mb-4">Partner</p>
            <Slider label="Starting Amount" value={sStart} min={0} max={100000} step={1000} onChange={setSStart} format={fmtD} />
            <Slider label="Annual Contribution" value={sContrib} min={0} max={30000} step={500} onChange={setSContrib} format={(v) => `${fmt$(v)}/yr`} />
            <Slider label="Return Rate" value={sReturn} min={1} max={15} step={0.5} onChange={setSReturn} format={(v) => `${v}%`} />
            <Slider label="Working Years" value={sYears} min={1} max={50} step={1} onChange={setSYears} format={(v) => `${v} yrs`} />
            <Slider label="SS Income" value={sSSIncome} min={0} max={60000} step={500} onChange={setSSSIncome} format={fmt$} />
            <Slider label="Retirement Age" value={sRetAge} min={50} max={75} step={1} onChange={setSRetAge} format={(v) => `${v}`} />
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Primary Nest Egg" value={fmt$K(resP.finalBalance)} />
        {enabled && <MetricCard label="Partner Nest Egg" value={fmt$K(resS.finalBalance)} />}
        <MetricCard label="Combined Nest Egg" value={fmt$K(combinedNestEgg)} accent />
        <MetricCard
          label="Projected Duration"
          value={resDraw.depletionAge ? `${resDraw.yearsLasted} yrs` : '35+ yrs'}
        />
      </div>

      {/* Accumulation chart */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-4">
          Accumulation by partner over time
        </p>
        <div className="chart-wrapper" style={{ height: 240 }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Survivor scenario */}
      {enabled && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setSurvivorEnabled((e) => !e)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                survivorEnabled ? 'bg-accent' : 'bg-stone-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  survivorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm font-medium text-ink">Model survivor scenario</span>
          </div>

          {survivorEnabled && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Slider
                  label="If Primary passes at age"
                  value={partnerAPassAge}
                  min={60}
                  max={95}
                  step={1}
                  onChange={setPartnerAPassAge}
                  format={(v) => `${v}`}
                />
                <Slider
                  label="Survivor SS benefit (% of Primary's benefit)"
                  value={survivorBenefit}
                  min={50}
                  max={100}
                  step={5}
                  onChange={setSurvivorBenefit}
                  format={(v) => `${v}%`}
                  hint="Surviving spouse typically receives the higher of the two benefits (100%)"
                />
              </div>

              {resSurvivor && (
                <div className="grid grid-cols-3 gap-3">
                  <MetricCard
                    label="Balance at Death"
                    value={fmt$K(resDraw.chartData.balances[
                      resDraw.chartData.ages.findIndex((a) => a >= partnerAPassAge) || 0
                    ])}
                  />
                  <MetricCard
                    label="Survivor Duration"
                    value={resSurvivor.depletionAge ? `${resSurvivor.yearsLasted} yrs` : '25+ yrs'}
                    accent={!resSurvivor.depletionAge}
                  />
                  <MetricCard
                    label="Survivor Funds Out"
                    value={resSurvivor.depletionAge ? `Age ${resSurvivor.depletionAge}` : 'Age 100+'}
                  />
                </div>
              )}
              <p className="text-xs text-ink-light bg-stone-50 rounded-lg p-3 border border-stone-100">
                Survivor scenario assumes partner spends 75% of couple's expenses and inherits the
                higher Social Security benefit. Actual survivor benefits depend on Social Security
                rules and marital duration. Consult SSA.gov for details.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
