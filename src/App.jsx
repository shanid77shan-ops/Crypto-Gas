import { ThemeProvider, useTheme } from './lib/ThemeContext'
import Header           from './components/Header'
import GasTrafficLight  from './components/GasTrafficLight'
import WalletLookup     from './components/WalletLookup'
import GasHistory       from './components/GasHistory'
import WorthItCalculator from './components/WorthItCalculator'
import GasHeatmap       from './components/GasHeatmap'
import WatchlistManager from './components/WatchlistManager'
import SwapCard         from './components/SwapCard'

// ── Theme-aware ambient orbs ───────────────────────────────────────────────────

function AmbientOrbs() {
  const { theme } = useTheme()
  const dark = theme === 'dark'

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      {dark ? (
        <>
          {/* Top-left — vivid indigo bloom */}
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full
            bg-indigo-600/14 blur-[160px]" />
          {/* Bottom-right — deep cyan bloom */}
          <div className="absolute bottom-0 right-0 w-[520px] h-[520px] rounded-full
            bg-cyan-500/10 blur-[140px]" />
          {/* Mid — violet accent */}
          <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full
            bg-violet-600/10 blur-[120px]" />
          {/* Extra — indigo-rose hint top-right */}
          <div className="absolute -top-16 right-1/4 w-[300px] h-[300px] rounded-full
            bg-blue-600/8 blur-[100px]" />
        </>
      ) : (
        <>
          {/* Top-left — light indigo */}
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full
            bg-indigo-300/25 blur-[130px]" />
          {/* Bottom-right — light cyan */}
          <div className="absolute bottom-0 right-0 w-[460px] h-[460px] rounded-full
            bg-violet-300/20 blur-[120px]" />
          {/* Mid — soft blue */}
          <div className="absolute top-1/2 left-1/3 w-[360px] h-[360px] rounded-full
            bg-blue-200/30 blur-[100px]" />
        </>
      )}

      {/* Dot-grid (both themes) */}
      <div className={`absolute inset-0
        bg-[radial-gradient(${dark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.07)'}
        _1px,transparent_1px)]
        bg-[size:32px_32px]`} />
    </div>
  )
}

// ── App shell ──────────────────────────────────────────────────────────────────

function AppShell() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      <AmbientOrbs />

      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">

        {/* Row 0 — Cross-Chain Swap (full width) */}
        <section aria-label="Cross-chain swap">
          <SwapCard />
        </section>

        {/* Row 1 — Gas indicator + Worth It Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <GasTrafficLight />
          <WorthItCalculator />
        </div>

        {/* Row 2 — Watch-Only Portfolio */}
        <section aria-label="Watch-only portfolio">
          <WatchlistManager />
        </section>

        {/* Row 3 — Multi-chain lookup */}
        <section aria-label="Multi-chain USDT lookup">
          <WalletLookup />
        </section>

        {/* Row 4 — Gas heatmap */}
        <section aria-label="Gas heatmap">
          <GasHeatmap />
        </section>

        {/* Row 5 — Historical gas readings */}
        <GasHistory />

      </main>

      <footer className="text-center py-5 text-xs border-t"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
        <span className="font-semibold" style={{ color: 'var(--color-text-base)' }}>Global Gas</span>
        <span className="mx-2 opacity-30">·</span>
        Powered by Alchemy · TronGrid · CryptoCompare · ChangeNOW · LI.FI · Supabase
        <span className="mx-2 opacity-30">|</span>
        Gas refreshes every 60 s
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  )
}
