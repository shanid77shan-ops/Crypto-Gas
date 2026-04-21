import { Activity } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full
      border-b border-slate-800/70
      bg-slate-950/80 backdrop-blur-2xl backdrop-saturate-150">
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
              bg-gradient-to-r from-cyan-300 via-emerald-300 to-cyan-400
              bg-clip-text text-transparent">
              Global Gas
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Layer 2 Ecosystem · Live</p>
          </div>
        </div>

        {/* Status pill */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full
          bg-slate-900/60 border border-slate-700/50 text-sm text-slate-400">
          <Activity size={13} className="text-emerald-400" />
          <span className="hidden sm:inline">Networks online</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
        </div>

      </div>
    </header>
  )
}
