import { useState, useMemo, useCallback } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import Slider from '../../../components/Slider'
import MetricCard from '../../../components/MetricCard'
import { runMonteCarlo, fmt$, fmt$K } from '../../../utils/calculations'

const BLUE = '#2d4a7a'

export default function MonteCarlo({ sharedState }) {
  const [nestEgg, setNestEgg] = useState(sharedState?.nestEgg ?? 500000)
  const [annualSpending, setAnnualSpending] = useState(61432)
  const [ssIncome, setSsIncome] = useState(23712)
  const [returnRate, setReturnRate] = useState(4)
  const [inflation, setInflation] = useState(2.5)
  const [retirementAge, setRetirementAge] = useState(65)
  const [targetAge, setTargetAge] = useState(90)
  const [simCount] = useState(1000)
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState(null)

  const runSim = useCallback(() => {
    setRunning(true)
    // Defer to avoid blocking UI
    setTimeout(() => {
      const r = runMonteCarlo(
        nestEgg,
        annualSpending,
        ssIncome,
        returnRate,
        inflation,
        retirementAge,
        simCount,
        targetAge
      )
      setResults(r)
      setRunning(false)
    }, 50)
  }, [nestEgg, annualSpending, ssIncome, returnRate, inflation, retirementAge, simCount, targetAge])

  // Fan chart data
  const fanChartData = useMemo(() => {
    if (!results) return null
    const { percentiles, ages } = results
    const labels = ages

    return {
      labels,
      datasets: [
        {
          label: '10th percentile',
          data: percentiles.p10,
          borderColor: `${BLUE}44`,
          backgroundColor: `${BLUE}0a`,
          borderWidth: 1,
          borderDash: [4, 3],
          pointRadius: 0,
          fill: 1,
          order: 5,
        },
        {
          label: '25th percentile',
          data: percentiles.p25,
          borderColor: `${BLUE}66`,
          backgroundColor: `${BLUE}14`,
          borderWidth: 1,
          pointRadius: 0,
          fill: 2,
          order: 4,
        },
        {
          label: 'Median (50th)',
          data: percentiles.p50,
          borderColor: BLUE,
          backgroundColor: `${BLUE}18`,
          borderWidth: 3,
          pointRadius: 0,
          fill: 3,
          order: 2,
        },
        {
          label: '75th percentile',
          data: percentiles.p75,
          borderColor: `${BLUE}66`,
          backgroundColor: `${BLUE}14`,
          borderWidth: 1,
          pointRadius: 0,
          fill: 4,
          order: 3,
        },
        {
          label: '90th percentile',
          data: percentiles.p90,
          borderColor: `${BLUE}44`,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderDash: [4, 3],
          pointRadius: 0,
          fill: false,
          order: 6,
        },
      ],
    }
  }, [results])

  const fanChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true, padding: 14, font: { size: 11 } },
      },
      tooltip: {
        callbacks: {
          title: (items) => `Age ${items[0].label}`,
          label: (ctx) => ` ${ctx.dataset.label}: ${fmt$(ctx.raw ?? 0)}`,
        },
      },
    },
    scales: {
      x: {
        type: 'linear',
        grid: { display: false },
        ticks: { font: { size: 11 }, stepSize: 5, callback: (v) => `${v}` },
        title: { display: true, text: 'Age', font: { size: 11 } },
        min: retirementAge,
        max: 100,
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { callback: (v) => fmt$K(v), font: { size: 11 } },
        title: { display: true, text: 'Portfolio Balance', font: { size: 11 } },
        min: 0,
      },
    },
  }

  // Depletion histogram
  const histData = useMemo(() => {
    if (!results) return null
    const buckets = {}
    for (let a = retirementAge; a <= 105; a += 5) {
      buckets[a] = 0
    }
    results.depletionAges.forEach((a) => {
      const capped = Math.min(a, 105)
      const bucket = Math.floor(capped / 5) * 5
      if (buckets[bucket] !== undefined) buckets[bucket]++
    })

    const labels = Object.keys(buckets).map((k) =>
      Number(k) >= 101 ? '100+ (no depletion)' : `${k}–${Number(k) + 4}`
    )
    const values = Object.values(buckets)

    return {
      labels,
      datasets: [
        {
          label: 'Simulations depleted',
          data: values,
          backgroundColor: Object.keys(buckets).map((k) => {
            const n = Number(k)
            if (n >= 101) return 'rgba(15,110,86,0.7)'
            if (n >= 85) return 'rgba(251,191,36,0.7)'
            return 'rgba(225,29,72,0.6)'
          }),
          borderRadius: 4,
        },
      ],
    }
  }, [results, retirementAge])

  const histOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.raw} simulations (${((ctx.raw / simCount) * 100).toFixed(1)}%)`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, maxRotation: 45 },
        title: { display: true, text: 'Age funds depleted', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { font: { size: 11 } },
        title: { display: true, text: '# of simulations', font: { size: 11 } },
      },
    },
  }

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
        <Slider
          label="Nest Egg at Retirement"
          value={nestEgg}
          min={50000}
          max={3000000}
          step={10000}
          onChange={setNestEgg}
          format={fmt$K}
        />
        <Slider
          label="Annual Spending"
          value={annualSpending}
          min={20000}
          max={200000}
          step={1000}
          onChange={setAnnualSpending}
          format={fmt$}
        />
        <Slider
          label="Social Security Income"
          value={ssIncome}
          min={0}
          max={60000}
          step={500}
          onChange={setSsIncome}
          format={fmt$}
        />
        <Slider
          label="Retirement Return Rate"
          value={returnRate}
          min={0}
          max={12}
          step={0.5}
          onChange={setReturnRate}
          format={(v) => `${v}%`}
        />
        <Slider
          label="Inflation Rate"
          value={inflation}
          min={1}
          max={8}
          step={0.5}
          onChange={setInflation}
          format={(v) => `${v}%`}
        />
        <Slider
          label="Retirement Age"
          value={retirementAge}
          min={50}
          max={75}
          step={1}
          onChange={setRetirementAge}
          format={(v) => `${v}`}
        />
        <Slider
          label="Survival target age"
          value={targetAge}
          min={75}
          max={100}
          step={1}
          onChange={setTargetAge}
          format={(v) => `${v}`}
          hint="What age should we test survival to?"
        />
      </div>

      {/* Run button */}
      <div className="flex items-center gap-4">
        <button
          onClick={runSim}
          disabled={running}
          className="px-6 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {running ? 'Running…' : `Run ${simCount.toLocaleString()} Simulations`}
        </button>
        {results && (
          <span className="text-sm text-ink-muted">
            Last run: {retirementAge}→100 with {simCount.toLocaleString()} paths
          </span>
        )}
      </div>

      {/* Results */}
      {results && (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard
              label={`Survived to Age ${targetAge}`}
              value={`${results.survivalRate}%`}
              sub={`${results.survived.toLocaleString()} of ${simCount.toLocaleString()} simulations`}
              accent={results.survivalRate >= 80}
              size="lg"
            />
            <MetricCard
              label="Median balance at 90"
              value={fmt$K(
                results.percentiles.p50[
                  Math.min(90 - retirementAge, results.percentiles.p50.length - 1)
                ] ?? 0
              )}
            />
            <MetricCard
              label="10th percentile at 90"
              value={fmt$K(
                results.percentiles.p10[
                  Math.min(90 - retirementAge, results.percentiles.p10.length - 1)
                ] ?? 0
              )}
              sub="Worst ~10% of scenarios"
            />
            <MetricCard
              label="90th percentile at 90"
              value={fmt$K(
                results.percentiles.p90[
                  Math.min(90 - retirementAge, results.percentiles.p90.length - 1)
                ] ?? 0
              )}
              sub="Best ~10% of scenarios"
            />
          </div>

          {/* Fan chart */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
              Fan chart — portfolio balance trajectories
            </p>
            <p className="text-xs text-ink-light mb-4">
              Bands show 10th / 25th / 50th / 75th / 90th percentile outcomes across {simCount.toLocaleString()} simulated market sequences
            </p>
            <div className="chart-wrapper" style={{ height: 300 }}>
              <Line data={fanChartData} options={fanChartOptions} />
            </div>
          </div>

          {/* Histogram */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
              Depletion age histogram
            </p>
            <p className="text-xs text-ink-light mb-4">
              How many simulations ran out of money at each age range. Green = no depletion.
            </p>
            <div className="chart-wrapper" style={{ height: 220 }}>
              <Bar data={histData} options={histOptions} />
            </div>
          </div>
        </>
      )}

      {!results && (
        <div className="bg-stone-50 rounded-2xl border border-dashed border-stone-300 p-10 text-center">
          <p className="text-2xl mb-2">📊</p>
          <p className="text-ink-muted text-sm">
            Set your inputs above and click <strong>Run Simulations</strong> to see the fan chart
            and probability analysis.
          </p>
        </div>
      )}

      {/* Disclosure */}
      <p className="text-xs text-ink-light bg-stone-50 rounded-lg p-3 border border-stone-100 leading-relaxed">
        Monte Carlo uses a normal distribution with σ ≈ 12% for retirement phase returns,
        representing approximate historical US equity volatility. Results are for illustrative
        purposes only. Past market behavior does not predict future results. Simulations do not
        account for taxes, fees, or variable spending.
      </p>
    </div>
  )
}
