import { useState } from 'react'

// ─── State data ───────────────────────────────────────────────────────────────
const STATE_DATA = [
  { name: 'Alabama', retirementUrl: 'https://www.rsa-al.gov', taxUrl: 'https://www.revenue.alabama.gov' },
  { name: 'Alaska', retirementUrl: 'https://www.drb.state.ak.us', taxUrl: 'https://www.tax.alaska.gov' },
  { name: 'Arizona', retirementUrl: 'https://www.azasrs.gov', taxUrl: 'https://azdor.gov' },
  { name: 'Arkansas', retirementUrl: 'https://www.artrs.gov', taxUrl: 'https://www.dfa.arkansas.gov' },
  { name: 'California', retirementUrl: 'https://www.calpers.ca.gov', taxUrl: 'https://www.ftb.ca.gov', note: 'CalPERS' },
  { name: 'Colorado', retirementUrl: 'https://www.copera.org', taxUrl: 'https://tax.colorado.gov', note: 'PERA' },
  { name: 'Connecticut', retirementUrl: 'https://www.ct.gov/osc/retirement', taxUrl: 'https://portal.ct.gov/DRS' },
  { name: 'Delaware', retirementUrl: 'https://pensionoffice.omb.delaware.gov', taxUrl: 'https://revenue.delaware.gov' },
  { name: 'Florida', retirementUrl: 'https://www.myfrs.com', taxUrl: 'https://floridarevenue.com', note: 'FRS — no state income tax' },
  { name: 'Georgia', retirementUrl: 'https://www.ers.ga.gov', taxUrl: 'https://dor.georgia.gov', note: 'ERS' },
  { name: 'Hawaii', retirementUrl: 'https://www.ers.hawaii.gov', taxUrl: 'https://tax.hawaii.gov' },
  { name: 'Idaho', retirementUrl: 'https://www.persi.idaho.gov', taxUrl: 'https://tax.idaho.gov' },
  { name: 'Illinois', retirementUrl: 'https://www.surs.org', taxUrl: 'https://www2.illinois.gov/rev', note: 'SURS / TRS (trs.illinois.gov)' },
  { name: 'Indiana', retirementUrl: 'https://www.inprs.in.gov', taxUrl: 'https://www.in.gov/dor' },
  { name: 'Iowa', retirementUrl: 'https://ipers.org', taxUrl: 'https://tax.iowa.gov', note: 'IPERS' },
  { name: 'Kansas', retirementUrl: 'https://www.kpers.org', taxUrl: 'https://www.ksrevenue.gov', note: 'KPERS' },
  { name: 'Kentucky', retirementUrl: 'https://kyret.ky.gov', taxUrl: 'https://revenue.ky.gov', note: 'KRS' },
  { name: 'Louisiana', retirementUrl: 'https://www.lasers.state.la.us', taxUrl: 'https://www.revenue.louisiana.gov' },
  { name: 'Maine', retirementUrl: 'https://www.mainepers.org', taxUrl: 'https://www.maine.gov/revenue', note: 'MainePERS' },
  { name: 'Maryland', retirementUrl: 'https://sra.maryland.gov', taxUrl: 'https://www.marylandtaxes.gov' },
  { name: 'Massachusetts', retirementUrl: 'https://www.mass.gov/orsc', taxUrl: 'https://www.mass.gov/dor' },
  { name: 'Michigan', retirementUrl: 'https://www.michigan.gov/ors', taxUrl: 'https://www.michigan.gov/taxes', note: 'ORS / MERS (mersofmich.com)' },
  { name: 'Minnesota', retirementUrl: 'https://www.msrs.state.mn.us', taxUrl: 'https://www.revenue.state.mn.us', note: 'MSRS / PERA' },
  { name: 'Mississippi', retirementUrl: 'https://www.pers.ms.gov', taxUrl: 'https://www.dor.ms.gov' },
  { name: 'Missouri', retirementUrl: 'https://www.mosers.org', taxUrl: 'https://dor.mo.gov', note: 'MOSERS' },
  { name: 'Montana', retirementUrl: 'https://mpera.mt.gov', taxUrl: 'https://mtrevenue.gov' },
  { name: 'Nebraska', retirementUrl: 'https://www.neperb.nebraska.gov', taxUrl: 'https://revenue.nebraska.gov' },
  { name: 'Nevada', retirementUrl: 'https://www.nvpers.org', taxUrl: 'https://tax.nv.gov', note: 'PERS — no state income tax' },
  { name: 'New Hampshire', retirementUrl: 'https://www.nhrs.org', taxUrl: 'https://www.revenue.nh.gov', note: 'No income tax on wages' },
  { name: 'New Jersey', retirementUrl: 'https://www.nj.gov/treasury/pensions', taxUrl: 'https://www.state.nj.us/treasury/taxation' },
  { name: 'New Mexico', retirementUrl: 'https://www.nmpera.org', taxUrl: 'https://www.tax.newmexico.gov' },
  { name: 'New York', retirementUrl: 'https://www.osc.state.ny.us/retirement', taxUrl: 'https://www.tax.ny.gov', note: 'NYSLRS' },
  { name: 'North Carolina', retirementUrl: 'https://www.myncretirement.com', taxUrl: 'https://www.ncdor.gov' },
  { name: 'North Dakota', retirementUrl: 'https://www.nd.gov/ndpers', taxUrl: 'https://www.nd.gov/tax' },
  { name: 'Ohio', retirementUrl: 'https://www.opers.org', taxUrl: 'https://tax.ohio.gov', note: 'OPERS' },
  { name: 'Oklahoma', retirementUrl: 'https://www.ok.gov/trs', taxUrl: 'https://oklahoma.gov/tax' },
  { name: 'Oregon', retirementUrl: 'https://www.oregon.gov/pers', taxUrl: 'https://www.oregon.gov/dor', note: 'PERS' },
  { name: 'Pennsylvania', retirementUrl: 'https://www.psers.pa.gov', taxUrl: 'https://www.revenue.pa.gov', note: 'PSERS / SERS (sers.pa.gov)' },
  { name: 'Rhode Island', retirementUrl: 'https://www.ersri.org', taxUrl: 'https://www.ri.gov/taxation' },
  { name: 'South Carolina', retirementUrl: 'https://www.peba.sc.gov', taxUrl: 'https://dor.sc.gov' },
  { name: 'South Dakota', retirementUrl: 'https://sdrs.sd.gov', taxUrl: 'https://dor.sd.gov', note: 'No state income tax' },
  { name: 'Tennessee', retirementUrl: 'https://www.tn.gov/treasury/retirement', taxUrl: 'https://www.tn.gov/revenue', note: 'No income tax on wages' },
  { name: 'Texas', retirementUrl: 'https://www.trs.texas.gov', taxUrl: 'https://comptroller.texas.gov', note: 'TRS — no state income tax' },
  { name: 'Utah', retirementUrl: 'https://www.urs.org', taxUrl: 'https://tax.utah.gov' },
  { name: 'Vermont', retirementUrl: 'https://www.vsers.vermont.gov', taxUrl: 'https://tax.vermont.gov' },
  { name: 'Virginia', retirementUrl: 'https://www.varetire.org', taxUrl: 'https://www.tax.virginia.gov', note: 'VRS' },
  { name: 'Washington', retirementUrl: 'https://www.drs.wa.gov', taxUrl: 'https://dor.wa.gov', note: 'DRS — no state income tax' },
  { name: 'West Virginia', retirementUrl: 'https://www.wvretirement.com', taxUrl: 'https://tax.wv.gov' },
  { name: 'Wisconsin', retirementUrl: 'https://etf.wi.gov', taxUrl: 'https://www.revenue.wi.gov' },
  { name: 'Wyoming', retirementUrl: 'https://retirement.wyo.gov', taxUrl: 'https://revenue.wyo.gov', note: 'No state income tax' },
  { name: 'District of Columbia', retirementUrl: 'https://dchr.dc.gov/page/dc-retirement-and-pension-plans', taxUrl: 'https://otr.cfo.dc.gov' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionHeader({ title, icon }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-2xl">{icon}</span>
      <h2 className="text-lg font-bold text-ink">{title}</h2>
    </div>
  )
}

function LinkList({ links }) {
  return (
    <ul className="space-y-2.5">
      {links.map(({ label, url, desc }) => (
        <li key={url} className="flex flex-col">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-accent hover:text-accent-dark underline-offset-2 hover:underline transition-colors"
          >
            {label} ↗
          </a>
          {desc && <p className="text-xs text-ink-muted mt-0.5">{desc}</p>}
        </li>
      ))}
    </ul>
  )
}

function ResourceCard({ title, icon, links }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-6">
      <SectionHeader title={title} icon={icon} />
      <LinkList links={links} />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Resources() {
  const [selectedState, setSelectedState] = useState('')

  const stateInfo = STATE_DATA.find((s) => s.name === selectedState)

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">
            Resources
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-ink leading-tight mb-3">
            Trusted retirement resources
          </h1>
          <p className="text-ink-muted max-w-xl leading-relaxed">
            Curated links to federal agencies, free counseling services, and state-specific
            retirement systems. No fluff — only genuinely useful sources.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Federal + Veterans grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Federal Government */}
          <ResourceCard
            title="Federal Government"
            icon="🏛️"
            links={[
              {
                label: 'Social Security Administration',
                url: 'https://www.ssa.gov',
                desc: 'Retirement estimator, full retirement age calculator, benefits info',
              },
              {
                label: 'My Social Security Portal',
                url: 'https://www.ssa.gov/myaccount',
                desc: 'View your personalized benefit estimate and earnings record',
              },
              {
                label: 'Medicare',
                url: 'https://www.medicare.gov',
                desc: 'Plan finder, cost estimator, drug coverage comparison',
              },
              {
                label: 'IRS Retirement Plans',
                url: 'https://www.irs.gov/retirement-plans',
                desc: 'Contribution limits, RMD rules, plan types, tax guidance',
              },
              {
                label: 'USA.gov Retirement',
                url: 'https://www.usa.gov/retirement',
                desc: 'Federal retirement planning overview and links',
              },
              {
                label: 'Benefits.gov',
                url: 'https://www.benefits.gov',
                desc: 'Federal benefits eligibility screening tool',
              },
              {
                label: 'Pension Benefit Guaranty Corp (PBGC)',
                url: 'https://www.pbgc.gov',
                desc: 'If you have a pension — verify coverage and find lost benefits',
              },
              {
                label: 'Dept of Labor — Employee Benefits',
                url: 'https://www.dol.gov/agencies/ebsa',
                desc: 'ERISA guidance, 401(k) rules, fiduciary standards',
              },
            ]}
          />

          {/* Veterans */}
          <ResourceCard
            title="Veterans-Specific"
            icon="🎖️"
            links={[
              {
                label: 'VA Benefits',
                url: 'https://benefits.va.gov/benefits',
                desc: 'Full index of VA benefit programs including pension and compensation',
              },
              {
                label: 'Military OneSource Financial Counseling',
                url: 'https://www.militaryonesource.mil',
                desc: 'Free financial counseling for servicemembers and veterans',
              },
              {
                label: 'MOAA Financial Planning',
                url: 'https://www.moaa.org',
                desc: 'Military Officers Association — financial guidance and advocacy',
              },
              {
                label: 'VFW Financial Assistance',
                url: 'https://www.vfw.org',
                desc: 'Veterans of Foreign Wars — assistance programs and resources',
              },
              {
                label: 'DAV Benefits',
                url: 'https://www.dav.org',
                desc: 'Disabled American Veterans — claims assistance and advocacy',
              },
              {
                label: 'Survivor Benefit Plan (SBP)',
                url: 'https://www.dfas.mil/RetiredMilitary/survivors/Survivor-Benefit-Plan/',
                desc: 'DFAS — military survivor annuity for spouses and dependents',
              },
              {
                label: 'BRS Comparison Calculator',
                url: 'https://militarypay.defense.gov/Calculators/BRS/',
                desc: 'Blended Retirement System comparison tool from DoD',
              },
            ]}
          />
        </div>

        {/* Free Counseling */}
        <ResourceCard
          title="Free Financial Counseling"
          icon="💬"
          links={[
            {
              label: 'CFPB — Retirement Planning Tools',
              url: 'https://www.consumerfinance.gov/consumer-tools/retirement/',
              desc: 'Consumer Financial Protection Bureau — free planning guides and tools',
            },
            {
              label: 'NCOA Benefits CheckUp',
              url: 'https://www.benefitscheckup.org',
              desc: 'Find benefits programs you may qualify for — quick eligibility screening',
            },
            {
              label: 'SHIP — Free Medicare Counseling',
              url: 'https://www.shiphelp.org',
              desc: 'State Health Insurance Assistance Program — free, unbiased Medicare help',
            },
            {
              label: 'NFCC — National Foundation for Credit Counseling',
              url: 'https://www.nfcc.org',
              desc: 'Non-profit credit and financial counseling with certified counselors',
            },
            {
              label: 'AFCPE — Find an AFC',
              url: 'https://www.afcpe.org/find-an-afc',
              desc: 'Accredited Financial Counselors — vetted, fee-only practitioners',
            },
            {
              label: 'MyMoney.gov',
              url: 'https://www.mymoney.gov',
              desc: "Federal financial literacy portal — official U.S. government resource",
            },
            {
              label: 'AARP Money Map',
              url: 'https://www.aarp.org/money/budgeting-saving/aarp_money_map.html',
              desc: 'Free financial triage tool for people facing money challenges',
            },
          ]}
        />

        {/* State Resources */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-6">
          <SectionHeader title="State Retirement Resources" icon="🗺️" />
          <p className="text-sm text-ink-muted mb-5 leading-relaxed">
            Select your state to find your state retirement system and tax authority.
            Links go directly to official government sites.
          </p>

          {/* State selector */}
          <div className="max-w-sm mb-6">
            <label htmlFor="state-select" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
              Select your state
            </label>
            <select
              id="state-select"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="">— Choose a state —</option>
              {STATE_DATA.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* State result */}
          {stateInfo && (
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-5">
              <h3 className="font-semibold text-ink mb-1">{stateInfo.name}</h3>
              {stateInfo.note && (
                <p className="text-xs text-ink-muted mb-4">{stateInfo.note}</p>
              )}
              <div className="space-y-3">
                <a
                  href={stateInfo.retirementUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-stone-200 hover:border-accent transition-colors group"
                >
                  <span className="text-xl">🏦</span>
                  <div>
                    <p className="text-sm font-medium text-ink group-hover:text-accent transition-colors">
                      State Retirement System ↗
                    </p>
                    <p className="text-xs text-ink-muted mt-0.5 truncate">{stateInfo.retirementUrl}</p>
                  </div>
                </a>
                <a
                  href={stateInfo.taxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-stone-200 hover:border-accent transition-colors group"
                >
                  <span className="text-xl">📋</span>
                  <div>
                    <p className="text-sm font-medium text-ink group-hover:text-accent transition-colors">
                      State Tax Authority ↗
                    </p>
                    <p className="text-xs text-ink-muted mt-0.5 truncate">{stateInfo.taxUrl}</p>
                  </div>
                </a>
              </div>
            </div>
          )}

          {/* State grid preview */}
          {!selectedState && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mt-2">
              {STATE_DATA.map((s) => (
                <button
                  key={s.name}
                  onClick={() => setSelectedState(s.name)}
                  className="text-left px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 hover:border-accent hover:bg-accent/5 text-xs text-ink transition-colors"
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* General advice note */}
        <div className="rounded-xl bg-accent/5 border border-accent/20 p-6">
          <h3 className="font-semibold text-ink mb-2">About these resources</h3>
          <p className="text-sm text-ink-muted leading-relaxed">
            All links go to official government agencies or established non-profit organizations.
            Clearpath has no affiliation with any of these organizations and does not receive
            compensation for these listings. We recommend verifying current URLs directly —
            government web addresses occasionally change. If you find a broken link, check the
            organization's main domain.
          </p>
        </div>
      </main>
    </div>
  )
}
