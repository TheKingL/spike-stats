import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { DIVISIONS } from '../constants'

export default function Navbar({ lastUpdated }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const formatUpdated = (iso) => {
    if (!iso) return null
    const d = new Date(iso)
    return d.toLocaleDateString('en-AU', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit',
      timeZone: 'Australia/Adelaide',
    }) + ' ACST'
  }

  return (
    <nav className="sticky top-0 z-50 bg-s0/95 backdrop-blur-md relative pb-px">
      {/* Gradient bottom border */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-uni/40 to-transparent" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <span className="font-display font-black text-xl text-uniLight tracking-tight">Spike</span>
            <span className="font-display font-black text-xl text-white tracking-tight">Stats</span>
          </Link>

          {/* Desktop nav — "FULL DIVISION PAGES" */}
          <div className="hidden md:flex items-center gap-0.5">
            <span className="text-xs text-gray-600 uppercase tracking-widest mr-2 font-semibold">Divisions</span>
            {DIVISIONS.map(div => (
              <NavLink
                key={div.id}
                to={`/division/${div.gradeId}`}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer
                  ${isActive
                    ? 'bg-uni text-white shadow-glow'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.06]'}`
                }
              >
                {div.label}
              </NavLink>
            ))}
            <NavLink
              to="/compare"
              className={({ isActive }) =>
                `ml-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer border
                ${isActive
                  ? 'bg-grape text-white border-grape'
                  : 'text-gray-400 hover:text-grape border-transparent hover:border-grape/40'}`
              }
            >
              Compare
            </NavLink>
          </div>

          {/* Last updated */}
          {lastUpdated && (
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-surf animate-pulse inline-block" />
              {formatUpdated(lastUpdated)}
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-s0 px-4 py-3 flex flex-col gap-1">
          <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold px-2 mb-1">Full Division Pages</p>
          {DIVISIONS.map(div => (
            <NavLink
              key={div.id}
              to={`/division/${div.gradeId}`}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer
                ${isActive ? 'bg-uni text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`
              }
              onClick={() => setMenuOpen(false)}
            >
              {div.label}
            </NavLink>
          ))}
          <NavLink
            to="/compare"
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer border mt-1
              ${isActive ? 'bg-grape text-white border-grape' : 'text-gray-400 hover:text-grape border-white/10 hover:border-grape/40'}`
            }
            onClick={() => setMenuOpen(false)}
          >
            ⚡ Compare Teams
          </NavLink>
          {lastUpdated && (
            <p className="px-3 pt-2 text-xs text-gray-600 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-surf inline-block" />
              Updated: {formatUpdated(lastUpdated)}
            </p>
          )}
        </div>
      )}
    </nav>
  )
}
