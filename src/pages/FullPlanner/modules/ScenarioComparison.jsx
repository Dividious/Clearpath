import { useState, useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import Slider from '../../../components/Slider'
import MetricCard from '../../../components/MetricCard'
import { calculateAccumulation, calculateDrawdown, fmt$, fmt$K } from '../../../utils/calculations'

const TEAL = '#0f6e56'
const BLUE = '#2d4a7a'

const defaultScenario = {
  startAmount: 10000,
  annualContrib: 6000,
  returnRate: 7,
  years: 30,
  annualSpending: 61432,
  ssIncome: 23712,
  retirementReturn: 4,
  inflation: 2.5,
  retirementAge: 65,
}

function ScenarioInputs({ label, color, values, onChange }) {
  const border = color === 'teal' ? 'border-accent' : 'border-slate-brand'
  const badge =
    color === 'teal'
      ? 'bg-accent text-white'
      : 'bg-slate-brand text-white'
  const fmtDollar = (v) => (v === 0 ? '$0' : fmt$K(v))

  return (
    <div className={`bg-white rounded-2xl border-2 ${border} p-5`}>
      <div className="flex items-center gap-2 mb-5">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${badge}`}>
          {label}
        </span>
        <span className="text-xs text-ink-muted">Accumulation + Drawdown</span>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3">
          Building the nest egg
        </p>
        <Slider label="Starting Amount" value={values.startAmount} min={0} max={100000} step={1000} onChange={(v) => onChange('startAmount', v)} format={fmtDollar} />
        <Slider label="Annual Contribution" value={values.annualContrib} min={0} max={30000} step={500} onChange={(v) => onChange('annualContrib', v)} format={(v) => `${fmt$(v)}/yr`} />
        <Slider label="Return Rate" value={values.returnRate} min={1} max={15} step={0.5} onChange={(v) => onChange('returnRate', v)} format={(v) => `${v}%`} />
        <Slider label="Years to Retirement" value={values.years} min={1} max={50} step={1} onChange={(v) => onChange('years', v)} format={(v) => `${v} yrs`} />

        <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3 mt-4 pt-4 border-t border-stone-100">
          Spending in retirement
        </p>
        <Slider label="Annual Spending" value={values.annualSpending} min={20000} max={200000} step={1000} onChange={(v) => onChange('annualSpending', v)} format={fmt$} />
        <Slider label="Social Security" value={values.ssIncome} min={0} max={60000} step={500} onChange={(v) => onChange('ssIncome', v)} format={fmt$} />
        <Slider label="Retirement Return" value={values.retirementReturn} min={0} max={12} step={0.5} onChange={(v) => onChange('retirementReturn', v)} format={(v) => `${v}%`} />
        <Slider label="Inflation" value={values.inflation} min={1} max={8} step={0.5} onChange={(v) => onChange('inflation', v)} format={(v) => `${v}%`} />
        <Slider label="Retirement Age" value={values.retirementAge} min={50} max={75} step={1} onChange={(v) => onChange('retirementAge', v)} format={(v) => `${v}`} />
      </div>
    </div>
  )
}

function computeScenario(s) {
  const acc = calculateAccumulation(s.startAmount, s.annualContrib, s.returnRate, s.years)
  const draw = calculateDrawdown(
    acc.finalBalance,
    s.annualSpending,
    s.ssIncome,
    s.retirementReturn,
    s.inflation,
    s.retirementAge
  )
  return { acc, draw, nestEgg: acc.finalBalance }
}

export default function ScenarioComparison({ onScenarioAChange }) {
  const [scenarioA, setScenarioA] = useState({ ...defaultScenario })
  const [scenarioB, setScenarioB] = useState({
    ...defaultScenario,
    annualContrib: 10000,
    returnRate: 8,
  })

  const updateA = (key, val) => {
    const next = { ...scenarioA, [key]: val }
    setScenarioA(next)
  }
  const updateB = (key, val) => setScenarioB((s) => ({ ...s, [key]: val }))

  const copyAtoB = () => setScenarioB({ ...scenarioA })

  const resA = useMemo(() => computeScenario(scenarioA), [scenarioA])
  const resB = useMemo(() => computeScenario(scenarioB), [scenarioB])

  // Combined chart — balance over time (accumulation + drawdown)
  // Align to the same timeline: use the max years across both scenarios
  const maxAge = 100
  const buildCombinedLine = (scenario, res, color) => {
    // Accumulation: year 0 to years
    const accYears = scenario.years
    const retAge = scenario.retirementAge
    const startAge = retAge - accYears

    const points = []
    // Accumulation phase
    for (let y = 0; y <= accYears; y++) {
      const balance =
        y < res.acc.chartData.principal.length
          ? res.acc.chartData.principal[y] +
            res.acc.chartData.contributions[y] +
            res.acc.chartData.interest[y]
          : res.nestEgg
      points.push({ x: startAge + y, y: balance })
    }
    // Drawdown phase
    const { ages, balances } = res.draw.chartData
    for (let i = 1; i < ages.length; i++) {
      points.push({ x: ages[i], y: balances[i] })
    }
    return points
  }

  const lineA = buildCombinedLine(scenarioA, resA, TEAL)
  const lineB = buildCombinedLine(scenarioB, resB, BLUE)

  const allX = [...new Set([...lineA.map((p) => p.x), ...lineB.map((p) => p.x)])].sort(
    (a, b) => a - b
  )

  const toArray = (line) => {
    const map = {}
    line.forEach((p) => (map[p.x] = p.y))
    return allX.map((x) => map[x] ?? null)
  }

  const chartData = {
    labels: allX,
    datasets: [
      {
        label: 'Scenario A',
        data: toArray(lineA),
        borderColor: TEAL,
        backgroundColor: 'transparent',
        borderWidth: 2.5,
        pointRadius: 0,
        tension: 0.3,
        spanGaps: false,
      },
      {
        label: 'Scenario B',
        data: toArray(lineB),
        borderColor: BLUE,
        backgroundColor: 'transparent',
        borderWidth: 2.5,
        pointRadius: 0,
        tension: 0.3,
        spanGaps: false,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16, font: { size: 11 } } },
      tooltip: {
        callbacks: {
          title: (items) => `Age ${items[0].label}`,
          label: (ctx) => ` ${ctx.dataset.label}: ${fmt$(ctx.raw)}`,
        },
      },
    },
    scales: {
      x: {
        type: 'linear',
        grid: { display: false },
        ticks: { stepSize: 5, font: { size: 11 }, callback: (v) => `${v}` },
        title: { display: true, text: 'Age', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { callback: (v) => fmt$K(v), font: { size: 11 } },
        title: { display: true, text: 'Portfolio Balance', font: { size: 11 } },
      },
    },
  }

  // Delta row
  const nestEggDelta = resB.nestEgg - resA.nestEgg
  const durationA = resA.draw.depletionAge
    ? resA.draw.yearsLasted
    : 100 - scenarioA.retirementAge
  const durationB = resB.draw.depletionAge
    ? resB.draw.yearsLasted
    : 100 - scenarioB.retirementAge
  const durationDelta = durationB - durationA

  return (
    <div className="space-y-6">
      {/* Delta summary */}
      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 flex flex-wrap items-center gap-4">
        <p className="text-sm text-ink-muted">
          <strong className="text-ink">Scenario B</strong> vs{' '}
          <strong className="text-ink">Scenario A</strong>:
        </p>
        <span
          className={`text-sm font-semibold ${
            nestEggDelta >= 0 ? 'text-emerald-700' : 'text-red-600'
          }`}
        >
          {nestEggDelta >= 0 ? '+' : ''}
          {fmt$K(nestEggDelta)} nest egg
        </span>
        <span
          className={`text-sm font-semibold ${
            durationDelta >= 0 ? 'text-emerald-700' : 'text-red-600'
          }`}
        >
          {durationDelta >= 0 ? '+' : ''}
          {durationDelta} yrs duration
        </span>
        <button
          onClick={copyAtoB}
          className="ml-auto px-4 py-1.5 rounded-lg border border-accent text-accent text-xs font-semibold hover:bg-accent hover:text-white transition-colors"
        >
          Copy A → B
        </button>
      </div>

      {/* Side-by-side inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ScenarioInputs label="Scenario A" color="teal" values={scenarioA} onChange={updateA} />
        <ScenarioInputs label="Scenario B" color="blue" values={scenarioB} onChange={updateB} />
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="A — Nest Egg" value={fmt$K(resA.nestEgg)} />
        <MetricCard label="A — Lasts" value={resA.draw.depletionAge ? `${resA.draw.yearsLasted} yrs` : '35+ yrs'} />
        <MetricCard label="B — Nest Egg" value={fmt$K(resB.nestEgg)} />
        <MetricCard label="B — Lasts" value={resB.draw.depletionAge ? `${resB.draw.yearsLasted} yrs` : '35+ yrs'} />
      </div>

      {/* Combined chart */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-4">
          Portfolio balance over lifetime — Scenario A vs B
        </p>
        <div className="chart-wrapper" style={{ height: 280 }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  )
}
