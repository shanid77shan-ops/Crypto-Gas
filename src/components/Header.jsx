import { Fuel, Activity } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full
      border-b border-slate-800/70
      bg-slate-950/80 backdrop-blur-2xl backdrop-saturate-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative p-1.5 rounded-xl
            bg-gradient-to-br from-indigo-500/20 to-violet-500/20
            border border-indigo-500/25">
            <Fuel size={16} className="text-indigo-400" />
            {/* Live pulse */}
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full
              bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
          </div>
          <div className="leading-none">
            <p className="text-sm font-bold tracking-tight
              bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
              GasTracker
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5">Multi-chain · Live</p>
          </div>
        </div>

        {/* Status pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
          bg-slate-900/60 border border-slate-700/50 text-xs text-slate-500">
          <Activity size={11} className="text-emerald-400" />
          <span className="hidden sm:inline">Networks online</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
        </div>

      </div>
    </header>
  )
}
