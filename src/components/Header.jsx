import { Fuel, Activity } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.05]
      bg-[#07070f]/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative p-1.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20
            border border-indigo-500/20">
            <Fuel size={16} className="text-indigo-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400
              ring-2 ring-[#07070f] animate-pulse" />
          </div>
          <div className="leading-none">
            <p className="text-sm font-bold tracking-tight bg-gradient-to-r from-white to-gray-400
              bg-clip-text text-transparent">
              GasTracker
            </p>
            <p className="text-[10px] text-gray-600 mt-0.5">Multi-chain · Live</p>
          </div>
        </div>

        {/* Status pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
          bg-white/[0.04] border border-white/[0.06] text-xs text-gray-500">
          <Activity size={11} className="text-emerald-400" />
          <span>Networks online</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
        </div>

      </div>
    </header>
  )
}
