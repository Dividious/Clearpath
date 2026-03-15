import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Disclaimer */}
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 mb-8">
          <p className="text-xs text-ink-muted leading-relaxed">
            <strong className="text-ink font-semibold">Disclaimer:</strong> Clearpath is
            an educational tool only. Nothing on this site constitutes financial, legal,
            or tax advice. All projections are illustrative and based on simplified
            models. Consult a qualified financial advisor, CPA, or attorney before making
            retirement decisions.
          </p>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-ink-light">
            Built with ♥ for financial literacy
          </p>
          <nav className="flex items-center gap-4" aria-label="Footer navigation">
            {[
              { to: '/', label: 'Simple Tool' },
              { to: '/planner', label: 'Full Planner' },
              { to: '/resources', label: 'Resources' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-xs text-ink-muted hover:text-accent transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
