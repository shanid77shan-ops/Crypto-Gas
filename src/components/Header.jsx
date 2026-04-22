import { Activity, Sun, Moon } from 'lucide-react'
import { useTheme } from '../lib/ThemeContext'

export default function Header() {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'

  return (
    <header className="sticky top-0 z-50 w-full
      border-b border-slate-800/70
      bg-slate-950/80 backdrop-blur-2xl backdrop-saturate-150"
      style={{
        backgroundColor: dark ? 'rgba(8,12,30,0.85)' : 'rgba(240,244,255,0.88)',
        borderBottomColor: dark ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.20)',
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
              bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400
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
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm
            border"
            style={{
              backgroundColor: dark ? 'rgba(10,18,52,0.60)' : 'rgba(238,242,255,0.80)',
              borderColor    : 'var(--color-border)',
              color          : 'var(--color-text-muted)',
            }}
          >
            <Activity size={13} className="text-emerald-400" />
            <span className="hidden sm:inline text-xs">Networks online</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex items-center justify-center w-9 h-9 rounded-full
              border transition-all active:scale-90"
            style={{
              backgroundColor: dark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.10)',
              borderColor    : 'var(--color-border)',
              color          : dark ? '#a5b4fc' : '#4f46e5',
            }}
          >
            {dark
              ? <Sun  size={15} />
              : <Moon size={15} />
            }
          </button>

        </div>
      </div>
    </header>
  )
}
