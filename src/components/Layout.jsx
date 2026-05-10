import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { useStats } from '../hooks/useStats'

export default function Layout() {
  const { lastUpdated } = useStats()

  return (
    <div className="min-h-screen flex flex-col bg-s1">
      <Navbar lastUpdated={lastUpdated} />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
      <footer className="relative pt-px mt-auto">
        {/* Gradient top border */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-uni/40 to-transparent" />

        <div className="py-6 bg-s0/60 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-3 items-center text-xs">

            {/* Brand */}
            <span className="font-display font-bold tracking-widest text-sm text-gradient-uni select-none">
              SpikeStats
            </span>

            {/* Data source */}
            <a
              href="https://www.volleyballsa.com.au"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-1.5 text-gray-500 hover:text-uniLight transition-colors duration-300"
            >
              <span className="group-hover:underline underline-offset-4 decoration-uniLight/40">volleyballsa.com.au</span>
              <svg className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            {/* Author + year */}
            <div className="flex items-center justify-end gap-2 text-gray-500">
              <a
                href="https://github.com/TheKingL"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1.5 hover:text-white transition-colors duration-300"
              >
                <svg className="w-3.5 h-3.5 text-gray-600 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span className="font-display font-bold tracking-wide group-hover:text-white">Loris</span>
              </a>
              <span className="text-gray-700">·</span>
              <span className="font-mono text-[10px] text-gray-600 tabular-nums">2026</span>
            </div>

          </div>
        </div>
      </footer>
    </div>
  )
}
