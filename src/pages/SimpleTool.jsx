import { useState, useMemo, useRef, useEffect } from 'react'
import { Bar, Chart } from 'react-chartjs-2'
import Slider from '../components/Slider'
import MetricCard from '../components/MetricCard'
import {
  calculateAccumulation,
  calculateDrawdown,
  getDrawdownStatus,
  fmt$,
  fmt$K,
} from '../utils/calculations'

// ─── Chart color tokens ────────────────────────────────────────────────────────
const TEAL_DARK = '#0f6e56'
const TEAL_MID = '#4aac8e'
const TEAL_LIGHT = '#a3d9c8'
const AMBER = '#d97706'
const AMBER_LIGHT = '#fde68a'
const ROSE = '#e11d48'

// ─── Format helpers ───────────────────────────────────────────────────────────
const fmtDollar = (v) =>
  v === 0 ? '$0' : v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(2)}M` : fmt$(v)
const fmtContrib = (v) =>
  v === 0 ? '$0/yr' : `${fmt$(v)}/yr`
const fmtPct = (v) => `${v}%`
const fmtYrs = (v) => `${v} yr${v !== 1 ? 's' : ''}`

// ─── Tab: Build Your Nest Egg ─────────────────────────────────────────────────
function BuildTab({ onNestEggChange }) {
  const [startAmount, setStartAmount] = useState(10000)
  const [annualContrib, setAnnualContrib] = useState(6000)
  const [returnRate, setReturnRate] = useState(7)
  const [years, setYears] = useState(30)

  const result = useMemo(
    () => calculateAccumulation(startAmount, annualContrib, returnRate, years),
    [startAmount, annualContrib, returnRate, years]
  )

  // Notify parent of nest egg changes for Tab 2
  useEffect(() => {
    onNestEggChange(result.finalBalance)
  }, [result.finalBalance, onNestEggChange])

  // Downsample chart labels for readability
  const step = years > 20 ? 5 : years > 10 ? 2 : 1
  const indices = result.chartData.labels.reduce((acc, _, i) => {
    if (i === 0 || i === years || i % step === 0) acc.push(i)
    return acc
  }, [])

  const chartData = {
    labels: indices.map((i) => result.chartData.labels[i]),
    datasets: [
      {
        label: 'Starting Amount',
        data: indices.map((i) => result.chartData.principal[i]),
        backgroundColor: TEAL_DARK,
        borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 4, bottomRight: 4 },
        borderSkipped: 'bottom',
      },
      {
        label: 'Contributions',
        data: indices.map((i) => result.chartData.contributions[i]),
        backgroundColor: TEAL_MID,
        borderRadius: 0,
      },
      {
        label: 'Interest Earned',
        data: indices.map((i) => result.chartData.interest[i]),
        backgroundColor: TEAL_LIGHT,
        borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
        borderSkipped: 'top',
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
        labels: { usePointStyle: true, pointStyle: 'rect', padding: 16, font: { size: 11 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${fmt$(ctx.raw)}`,
          footer: (items) => `Total: ${fmt$(items.reduce((s, i) => s + i.raw, 0))}`,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { font: { size: 11 }, maxRotation: 0 },
      },
      y: {
        stacked: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          font: { size: 11 },
          callback: (v) => fmt$K(v),
        },
      },
    },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Controls */}
      <div className="lg:col-span-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted mb-5">
          Your inputs
        </h2>
        <Slider label="Starting Amount" value={startAmount} min={0} max={50000} step={500} onChange={setStartAmount} format={fmtDollar} hint="Current savings or initial investment" />
        <Slider label="Annual Contribution" value={annualContrib} min={0} max={30000} step={250} onChange={setAnnualContrib} format={fmtContrib} hint="Amount added each year (e.g. 401k + IRA)" />
        <Slider label="Annual Return Rate" value={returnRate} min={1} max={20} step={0.5} onChange={setReturnRate} format={fmtPct} hint="Historical US equity avg ≈ 10%; balanced portfolio ≈ 6–7%" />
        <Slider label="Years Until Retirement" value={years} min={1} max={50} step={1} onChange={setYears} format={fmtYrs} />
      </div>

      {/* Results */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            label="Final Nest Egg"
            value={fmt$K(result.finalBalance)}
            accent
            size="lg"
          />
          <MetricCard
            label="Total Contributed"
            value={fmt$K(result.totalContributed)}
          />
          <MetricCard
            label="Interest Earned"
            value={fmt$K(result.totalInterest)}
          />
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-4">
            Portfolio growth over {years} years
          </p>
          <div className="chart-wrapper" style={{ height: 260 }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tab: How Long Does It Last? ──────────────────────────────────────────────
function DrawdownTab({ nestEgg: inheritedNestEgg }) {
  const [nestEgg, setNestEgg] = useState(inheritedNestEgg)
  const [annualSpending, setAnnualSpending] = useState(61432)
  const [ssIncome, setSsIncome] = useState(23712)
  const [returnRate, setReturnRate] = useState(4)
  const [inflationRate, setInflationRate] = useState(2.5)
  const [retirementAge, setRetirementAge] = useState(65)

  // Sync when Tab 1 nest egg changes
  const prevNestEgg = useRef(inheritedNestEgg)
  useEffect(() => {
    if (inheritedNestEgg !== prevNestEgg.current) {
      setNestEgg(inheritedNestEgg)
      prevNestEgg.current = inheritedNestEgg
    }
  }, [inheritedNestEgg])

  const result = useMemo(
    () =>
      calculateDrawdown(
        nestEgg,
        annualSpending,
        ssIncome,
        returnRate,
        inflationRate,
        retirementAge
      ),
    [nestEgg, annualSpending, ssIncome, returnRate, inflationRate, retirementAge]
  )

  const status = getDrawdownStatus(result.depletionAge, retirementAge)

  // Prepare chart data — sample every 2 years after age 70 for readability
  const { ages, balances, netDraws } = result.chartData
  const sampleEvery = ages.length > 30 ? 3 : ages.length > 20 ? 2 : 1
  const sampledIndices = ages.reduce((acc, _, i) => {
    if (i === 0 || i === ages.length - 1 || i % sampleEvery === 0) acc.push(i)
    return acc
  }, [])

  const chartData = {
    labels: sampledIndices.map((i) => `${ages[i]}`),
    datasets: [
      {
        type: 'bar',
        label: 'Remaining Balance',
        data: sampledIndices.map((i) => balances[i]),
        backgroundColor: sampledIndices.map((i) =>
          balances[i] === 0
            ? 'rgba(225,29,72,0.2)'
            : balances[i] < nestEgg * 0.25
            ? AMBER_LIGHT
            : AMBER
        ),
        borderRadius: 3,
        yAxisID: 'yBalance',
        order: 2,
      },
      {
        type: 'line',
        label: 'Annual Net Draw',
        data: sampledIndices.map((i) => netDraws[i]),
        borderColor: ROSE,
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        yAxisID: 'yDraw',
        order: 1,
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
          label: (ctx) => ` ${ctx.dataset.label}: ${fmt$(ctx.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, maxTicksLimit: 12 },
        title: { display: true, text: 'Age', font: { size: 11 } },
      },
      yBalance: {
        type: 'linear',
        position: 'left',
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { callback: (v) => fmt$K(v), font: { size: 11 } },
        title: { display: true, text: 'Balance', font: { size: 11 } },
      },
      yDraw: {
        type: 'linear',
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { callback: (v) => fmt$K(v), font: { size: 11 } },
        title: { display: true, text: 'Net Draw', font: { size: 11 } },
      },
    },
  }

  const statusColors = {
    green: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    yellow: 'bg-amber-50 border-amber-200 text-amber-800',
    red: 'bg-red-50 border-red-200 text-red-800',
  }

  const statusDots = {
    green: 'bg-emerald-500',
    yellow: 'bg-amber-500',
    red: 'bg-red-500',
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Controls */}
      <div className="lg:col-span-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted mb-5">
          Your inputs
        </h2>
        <Slider
          label="Nest Egg at Retirement"
          value={nestEgg}
          min={0}
          max={5000000}
          step={10000}
          onChange={setNestEgg}
          format={(v) => fmt$K(v)}
          hint="Auto-populated from Tab 1 — adjust freely"
        />
        <Slider
          label="Annual Spending"
          value={annualSpending}
          min={20000}
          max={200000}
          step={1000}
          onChange={setAnnualSpending}
          format={fmt$}
          hint="BLS 2024 avg for 65+ households: $61,432"
        />
        <Slider
          label="Social Security Income"
          value={ssIncome}
          min={0}
          max={60000}
          step={500}
          onChange={setSsIncome}
          format={fmt$}
          hint="Avg 2025 SS benefit: $23,712/yr ($1,976/mo)"
        />
        <Slider
          label="Portfolio Return in Retirement"
          value={returnRate}
          min={0}
          max={12}
          step={0.5}
          onChange={setReturnRate}
          format={fmtPct}
          hint="Conservative retiree portfolio typically 3–6%"
        />
        <Slider
          label="Inflation Rate"
          value={inflationRate}
          min={1}
          max={8}
          step={0.5}
          onChange={setInflationRate}
          format={fmtPct}
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
      </div>

      {/* Results */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        {/* Status banner */}
        <div
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
            statusColors[status.color]
          }`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              statusDots[status.color]
            }`}
          />
          <div>
            <p className="font-semibold text-sm">{status.label}</p>
            <p className="text-xs opacity-80">{status.desc}</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            label="Years Money Lasts"
            value={
              result.depletionAge ? `${result.yearsLasted} yrs` : '35+ yrs'
            }
            accent={status.color === 'green'}
            size="lg"
          />
          <MetricCard
            label="Funds Run Out At"
            value={
              result.depletionAge ? `Age ${result.ageFundsRunOut}` : 'Age 100+'
            }
          />
          <MetricCard
            label="Year 1 Net Draw"
            value={fmt$K(result.year1NetDraw)}
            sub="From portfolio"
          />
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-4">
            Retirement balance & annual draw
          </p>
          <div className="chart-wrapper" style={{ height: 260 }}>
            <Chart type="bar" data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SimpleTool() {
  const [activeTab, setActiveTab] = useState(0)
  const [nestEgg, setNestEgg] = useState(0)

  const tabs = [
    { label: 'Build your nest egg', icon: '↗' },
    { label: 'How long does it last?', icon: '⏱' },
  ]

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">
            Simple Tool
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-ink leading-tight mb-3">
            Retirement calculator
          </h1>
          <p className="text-ink-muted max-w-xl leading-relaxed">
            See how your savings grow and how long your nest egg will last in retirement.
            All calculations happen instantly in your browser — nothing is stored or shared.
          </p>
        </div>
      </section>

      {/* Tab bar */}
      <div className="border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0">
            {tabs.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === i
                    ? 'border-accent text-accent'
                    : 'border-transparent text-ink-muted hover:text-ink hover:border-stone-300'
                }`}
              >
                <span className="mr-2 opacity-60">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 0 ? (
          <BuildTab onNestEggChange={setNestEgg} />
        ) : (
          <DrawdownTab nestEgg={nestEgg} />
        )}
      </main>
    </div>
  )
}
