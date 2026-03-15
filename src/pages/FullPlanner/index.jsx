import { useState, useMemo } from 'react'
import CollapsibleModule from '../../components/CollapsibleModule'
import Sidebar from './Sidebar'
import ScenarioComparison from './modules/ScenarioComparison'
import SocialSecurityBreakeven from './modules/SocialSecurityBreakeven'
import SpousePartnerMode from './modules/SpousePartnerMode'
import HealthcareCost from './modules/HealthcareCost'
import MonteCarlo from './modules/MonteCarlo'
import TaxTreatment from './modules/TaxTreatment'
import { calculateAccumulation, calculateDrawdown } from '../../utils/calculations'

const MODULES = [
  {
    number: 1,
    title: 'Scenario Comparison',
    description: 'Compare two retirement strategies side by side to isolate the effect of any single variable.',
    Component: ScenarioComparison,
    defaultOpen: true,
  },
  {
    number: 2,
    title: 'Social Security Breakeven',
    description: 'Find the crossover ages between claiming at 62, 67, or 70.',
    Component: SocialSecurityBreakeven,
    defaultOpen: false,
  },
  {
    number: 3,
    title: 'Spouse / Partner Mode',
    description: 'Model two income streams, different retirement ages, and survivor scenarios.',
    Component: SpousePartnerMode,
    defaultOpen: false,
  },
  {
    number: 4,
    title: 'Healthcare Cost Escalation',
    description: 'Healthcare inflates faster than general CPI — see the real impact on your plan.',
    Component: HealthcareCost,
    defaultOpen: false,
  },
  {
    number: 5,
    title: 'Monte Carlo Simulation',
    description: '1,000 simulations model sequence-of-returns risk across market volatility scenarios.',
    Component: MonteCarlo,
    defaultOpen: false,
  },
  {
    number: 6,
    title: 'Tax Treatment',
    description: 'Compare Traditional, Roth, and taxable accounts under your specific tax rates.',
    Component: TaxTreatment,
    defaultOpen: false,
  },
]

// Default "primary scenario" for sidebar
const DEFAULT_ACC = { startAmount: 10000, annualContrib: 6000, returnRate: 7, years: 30 }
const DEFAULT_DRAW = {
  annualSpending: 61432,
  ssIncome: 23712,
  retirementReturn: 4,
  inflation: 2.5,
  retirementAge: 65,
}

export default function FullPlanner() {
  // Sidebar state — driven by Scenario A defaults initially
  const [sidebarNestEgg] = useState(() => {
    const { finalBalance } = calculateAccumulation(
      DEFAULT_ACC.startAmount,
      DEFAULT_ACC.annualContrib,
      DEFAULT_ACC.returnRate,
      DEFAULT_ACC.years
    )
    return finalBalance
  })

  const sidebarDraw = useMemo(() => {
    return calculateDrawdown(
      sidebarNestEgg,
      DEFAULT_DRAW.annualSpending,
      DEFAULT_DRAW.ssIncome,
      DEFAULT_DRAW.retirementReturn,
      DEFAULT_DRAW.inflation,
      DEFAULT_DRAW.retirementAge
    )
  }, [sidebarNestEgg])

  const projectedDuration = sidebarDraw.depletionAge
    ? sidebarDraw.yearsLasted
    : 100 - DEFAULT_DRAW.retirementAge

  const sharedState = {
    nestEgg: sidebarNestEgg,
    startAmount: DEFAULT_ACC.startAmount,
    annualContrib: DEFAULT_ACC.annualContrib,
    returnRate: DEFAULT_ACC.returnRate,
    years: DEFAULT_ACC.years,
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">
            Full Planner
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-ink leading-tight mb-3">
            Deep-dive retirement analysis
          </h1>
          <p className="text-ink-muted max-w-2xl leading-relaxed">
            Six modules that build on each other — from scenario comparison and Social Security
            strategy to Monte Carlo simulation and tax treatment. Open each module to explore.
          </p>
        </div>
      </section>

      {/* Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar — top on mobile, left on desktop */}
          <div className="order-first lg:order-last">
            <Sidebar
              nestEgg={sidebarNestEgg}
              projectedDuration={projectedDuration}
              monteCarloRate={null}
            />
          </div>

          {/* Modules */}
          <div className="flex-1 min-w-0 space-y-4">
            {MODULES.map(({ number, title, description, Component, defaultOpen }) => (
              <CollapsibleModule
                key={number}
                number={number}
                title={title}
                description={description}
                defaultOpen={defaultOpen}
              >
                <Component sharedState={sharedState} />
              </CollapsibleModule>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
