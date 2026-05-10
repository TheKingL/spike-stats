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
      <footer className="border-t border-white/[0.05] py-5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-3 items-center text-xs text-gray-600">
          <span className="font-display font-bold text-gray-500 tracking-wide">SpikeStats</span>
          <a
            href="https://www.volleyballsa.com.au"
            target="_blank"
            rel="noopener noreferrer"
            className="text-center hover:text-gray-400 transition-colors cursor-pointer"
          >
            volleyballsa.com.au
          </a>
          <span className="text-gray-700 text-right">Adelaide University SAVL · 2026</span>
        </div>
      </footer>
    </div>
  )
}
