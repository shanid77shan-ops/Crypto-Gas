import Header          from './components/Header'
import GasTrafficLight  from './components/GasTrafficLight'
import WalletLookup     from './components/WalletLookup'
import GasHistory       from './components/GasHistory'
import WorthItCalculator from './components/WorthItCalculator'
import GasHeatmap       from './components/GasHeatmap'
import WatchlistManager from './components/WatchlistManager'
import SwapCard         from './components/SwapCard'

export default function App() {
  return (
    /* slate-950 base ─────────────────────────────────────────────────────── */
    <div className="min-h-screen flex flex-col bg-slate-950 relative">

      {/* ── Fixed ambient orbs (non-interactive decoration) ────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        {/* Top-left indigo bloom */}
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full
          bg-indigo-700/10 blur-[140px]" />
        {/* Bottom-right cyan bloom */}
        <div className="absolute bottom-0 right-0 w-[480px] h-[480px] rounded-full
          bg-cyan-800/8 blur-[120px]" />
        {/* Mid-page violet hint */}
        <div className="absolute top-1/2 left-1/3 w-[360px] h-[360px] rounded-full
          bg-violet-900/8 blur-[100px]" />
        {/* Subtle dot-grid overlay */}
        <div className="absolute inset-0
          bg-[radial-gradient(rgba(148,163,184,0.04)_1px,transparent_1px)]
          bg-[size:32px_32px]" />
      </div>

      {/* ── Sticky header ────────────────────────────────────────────────── */}
      <Header />

      {/* ── Page content ─────────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">

        {/* Row 0 ─ Bridge Estimator (full width) */}
        <section aria-label="Cross-chain bridge estimator">
          <SwapCard />
        </section>

        {/* Row 1 ─ Gas indicator + Worth It Calculator
            Mobile : single column (stacks)
            Desktop: 280px traffic light | remaining width for calculator   */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <GasTrafficLight />
          <WorthItCalculator />
        </div>

        {/* Row 2 ─ Watch-Only Portfolio (Rule 3, full width) */}
        <section aria-label="Watch-only portfolio">
          <WatchlistManager />
        </section>

        {/* Row 3 ─ One-shot multi-chain lookup */}
        <section aria-label="Multi-chain USDT lookup">
          <WalletLookup />
        </section>

        {/* Row 4 ─ Gas heatmap + recharts bar chart */}
        <section aria-label="Gas heatmap">
          <GasHeatmap />
        </section>

        {/* Row 5 ─ Historical gas readings (only visible when Supabase is live) */}
        <GasHistory />

      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="text-center py-5 text-xs text-slate-600
        border-t border-slate-800/60">
        Powered by&nbsp;
        <span className="text-slate-500">Alchemy · TronGrid · CryptoCompare · LI.FI · Supabase</span>
        <span className="mx-2 text-slate-700">|</span>
        Gas refreshes every 60 s
      </footer>

    </div>
  )
}
