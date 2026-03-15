import { NavLink, Link } from 'react-router-dom'

const navLinks = [
  { to: '/', label: 'Simple Tool' },
  { to: '/planner', label: 'Full Planner' },
  { to: '/resources', label: 'Resources' },
]

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-stone-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2 no-underline group"
          aria-label="Clearpath home"
        >
          <span className="w-7 h-7 rounded-md bg-accent flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
              <path
                d="M10 3L17 8V17H3V8L10 3Z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M7 17V11H13V17"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="font-bold text-base text-ink tracking-tight">
            Clearpath
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent text-white'
                    : 'text-ink-muted hover:text-ink hover:bg-stone-100'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  )
}
