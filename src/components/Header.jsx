import { Activity, Sun, Moon } from 'lucide-react'
import { useTheme } from '../lib/ThemeContext'

export default function Header() {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'

  return (
    <header
      className="sticky top-0 z-50 w-full backdrop-blur-2xl backdrop-saturate-150 border-b"
      style={{
        backgroundColor: dark ? 'rgba(13,13,13,0.90)' : 'rgba(255,255,255,0.92)',
        borderBottomColor: 'var(--color-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/brand.png"
            alt="Global Gas"
            className="h-9 w-auto max-w-[120px] object-contain object-left"
            onError={e => { e.target.style.display = 'none' }}
          />
          <div className="leading-none">
            <p className="text-lg font-bold tracking-tight
              bg-gradient-to-r from-white via-red-300 to-red-500
              bg-clip-text text-transparent">
              Global Gas
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Layer 2 Ecosystem · Live
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">

          {/* Status pill */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border"
            style={{
              backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(220,38,38,0.04)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            <Activity size={13} className="text-emerald-400" />
            <span className="hidden sm:inline">Networks online</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex items-center justify-center w-9 h-9 rounded-full border
              transition-all active:scale-90 hover:border-red-500/60"
            style={{
              backgroundColor: dark ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.08)',
              borderColor: 'var(--color-border)',
              color: dark ? '#fca5a5' : '#dc2626',
            }}
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

        </div>
      </div>
    </header>
  )
}
