import { useState, useMemo } from 'react'
import { Chart } from 'react-chartjs-2'
import Slider from '../../../components/Slider'
import MetricCard from '../../../components/MetricCard'
import { calculateHealthcareDrawdown, fmt$, fmt$K } from '../../../utils/calculations'

const TEAL = 'rgba(15,110,86,0.7)'
const AMBER = 'rgba(217,119,6,0.7)'
const ROSE = '#e11d48'

export default function HealthcareCost({ sharedState }) {
  const [nestEgg, setNestEgg] = useState(sharedState?.nestEgg ?? 500000)
  const [baseSpending, setBaseSpending] = useState(53405)   // $61,432 - $8,027 HC
  const [hcSpending, setHcSpending] = useState(8027)
  const [ssIncome, setSsIncome] = useState(23712)
  const [returnRate, setReturnRate] = useState(4)
  const [inflation, setInflation] = useState(2.5)
  const [hcInflation, setHcInflation] = useState(5.5)
  const [retirementAge, setRetirementAge] = useState(65)

  const result = useMemo(
    () =>
      calculateHealthcareDrawdown(
        nestEgg,
        baseSpending,
        hcSpending,
        ssIncome,
        returnRate,
        inflation,
        hcInflation,
        retirementAge
      ),
    [nestEgg, baseSpending, hcSpending, ssIncome, returnRate, inflation, hcInflation, retirementAge]
  )

  const { ages, otherSpends, hcSpends, netDraws, balances } = result.chartData

  // Sample for chart readability
  const sampleEvery = ages.length > 25 ? 3 : 2
  const indices = ages.reduce((acc, _, i) => {
    if (i === 0 || i === ages.length - 1 || i % sampleEvery === 0) acc.push(i)
    return acc
  }, [])

  const chartData = {
    labels: indices.map((i) => `${ages[i]}`),
    datasets: [
      {
        type: 'bar',
        label: 'Housing, Food & Transport',
        data: indices.map((i) => otherSpends[i]),
        backgroundColor: TEAL,
        stack: 'spending',
        yAxisID: 'ySpend',
        order: 3,
        borderRadius: { topLeft: 0, topRight: 0 },
      },
      {
        type: 'bar',
        label: 'Healthcare',
        data: indices.map((i) => hcSpends[i]),
        backgroundColor: AMBER,
        stack: 'spending',
        yAxisID: 'ySpend',
        order: 3,
        borderRadius: { topLeft: 4, topRight: 4 },
      },
      {
        type: 'line',
        label: 'Portfolio Balance',
        data: indices.map((i) => balances[i]),
        borderColor: '#2d4a7a',
        backgroundColor: 'transparent',
        borderWidth: 2.5,
        pointRadius: 0,
        tension: 0.3,
        yAxisID: 'yBalance',
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
        stacked: true,
        grid: { display: false },
        ticks: { font: { size: 11 }, maxTicksLimit: 12 },
        title: { display: true, text: 'Age', font: { size: 11 } },
      },
      ySpend: {
        stacked: true,
        type: 'linear',
        position: 'left',
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { callback: (v) => fmt$K(v), font: { size: 11 } },
        title: { display: true, text: 'Annual Spending', font: { size: 11 } },
      },
      yBalance: {
        type: 'linear',
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { callback: (v) => fmt$K(v), font: { size: 11 } },
        title: { display: true, text: 'Portfolio Balance', font: { size: 11 } },
      },
    },
  }

  // Project HC spending at age 85
  const yearsTo85 = 85 - retirementAge
  const hcAt85 = hcSpending * Math.pow(1 + hcInflation / 100, yearsTo85)
  const otherAt85 = baseSpending * Math.pow(1 + inflation / 100, yearsTo85)
  const hcShareAt85 = hcAt85 / (hcAt85 + otherAt85)

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
          label="Annual Non-Healthcare Spending"
          value={baseSpending}
          min={10000}
          max={150000}
          step={1000}
          onChange={setBaseSpending}
          format={fmt$}
          hint="Housing, food, transport, etc."
        />
        <Slider
          label="Healthcare Spending at Retirement"
          value={hcSpending}
          min={2000}
          max={40000}
          step={500}
          onChange={setHcSpending}
          format={fmt$}
          hint="BLS 2023: $8,027/yr avg for 65+ household"
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
          label="Portfolio Return"
          value={returnRate}
          min={0}
          max={12}
          step={0.5}
          onChange={setReturnRate}
          format={(v) => `${v}%`}
        />
        <Slider
          label="General Inflation"
          value={inflation}
          min={1}
          max={8}
          step={0.5}
          onChange={setInflation}
          format={(v) => `${v}%`}
        />
        <Slider
          label="Healthcare Inflation"
          value={hcInflation}
          min={2}
          max={10}
          step={0.5}
          onChange={setHcInflation}
          format={(v) => `${v}%`}
          hint="Historical avg ≈ 5.5%/yr, outpacing general inflation"
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

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          label="HC Spending at Retirement"
          value={fmt$(hcSpending)}
          sub={`${((hcSpending / (hcSpending + baseSpending)) * 100).toFixed(0)}% of total`}
        />
        <MetricCard
          label="HC Spending at Age 85"
          value={fmt$(Math.round(hcAt85))}
          sub={`${(hcShareAt85 * 100).toFixed(0)}% of total by then`}
        />
        <MetricCard
          label="Funds Run Out"
          value={result.depletionAge ? `Age ${result.depletionAge}` : 'Age 100+'}
          accent={!result.depletionAge}
        />
        <MetricCard
          label="HC Inflation Rate"
          value={`${hcInflation}%/yr`}
          sub={`vs ${inflation}% general`}
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
          Spending breakdown & portfolio balance by age
        </p>
        <p className="text-xs text-ink-light mb-4">
          Note rising healthcare share of total spending over time
        </p>
        <div className="chart-wrapper" style={{ height: 280 }}>
          <Chart type="bar" data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Fidelity note */}
      <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
        <p className="text-xs text-amber-900 leading-relaxed">
          <strong>Note:</strong> Fidelity estimates the average 65-year-old couple needs{' '}
          <strong>$300,000</strong> for out-of-pocket healthcare costs in retirement, not
          including long-term care. This figure has risen steadily year over year.
          Planning for healthcare inflation separately from general inflation gives a
          materially more accurate picture of retirement sustainability.
        </p>
      </div>
    </div>
  )
}
