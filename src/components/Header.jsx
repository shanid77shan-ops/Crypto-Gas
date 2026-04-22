import { Activity, Sun, Moon } from 'lucide-react'
import { useTheme } from '../lib/ThemeContext'

export default function Header() {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'

  return (
    <header
      className="sticky top-0 z-50 w-full backdrop-blur-2xl border-b"
      style={{
        backgroundColor: dark ? 'rgba(0,0,0,0.92)' : 'rgba(255,255,255,0.96)',
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
            <p
              className="text-xl font-black tracking-tight"
              style={{
                background: 'linear-gradient(90deg, #ffffff 0%, #ff4040 50%, #ff0000 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Global Gas
            </p>
            <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Layer 2 Ecosystem · Live
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">

          {/* Status pill */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border"
            style={{
              backgroundColor: dark ? 'rgba(255,30,30,0.10)' : 'rgba(220,20,20,0.07)',
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
            className="flex items-center justify-center w-9 h-9 rounded-full border font-black
              transition-all active:scale-90"
            style={{
              backgroundColor: 'var(--red-dim)',
              borderColor: 'var(--color-border)',
              color: 'var(--red)',
            }}
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

        </div>
      </div>
    </header>
  )
}
