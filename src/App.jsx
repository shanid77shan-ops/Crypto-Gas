import { ThemeProvider, useTheme } from './lib/ThemeContext'
import Header            from './components/Header'
import GasTrafficLight   from './components/GasTrafficLight'
import WalletLookup      from './components/WalletLookup'
import GasHistory        from './components/GasHistory'
import WorthItCalculator from './components/WorthItCalculator'
import GasHeatmap        from './components/GasHeatmap'
import WatchlistManager  from './components/WatchlistManager'
import SwapCard          from './components/SwapCard'

function AmbientOrbs() {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      {dark ? (
        <>
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full
            bg-red-900/20 blur-[180px]" />
          <div className="absolute bottom-0 right-0 w-[520px] h-[520px] rounded-full
            bg-red-800/12 blur-[160px]" />
          <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full
            bg-red-900/10 blur-[140px]" />
        </>
      ) : (
        <>
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full
            bg-red-100/60 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[460px] h-[460px] rounded-full
            bg-red-50/80 blur-[100px]" />
          <div className="absolute top-1/2 left-1/3 w-[360px] h-[360px] rounded-full
            bg-red-100/40 blur-[90px]" />
        </>
      )}
      {/* Dot-grid */}
      <div className={`absolute inset-0
        bg-[radial-gradient(${dark
          ? 'rgba(220,38,38,0.07)'
          : 'rgba(220,38,38,0.05)'}
        _1px,transparent_1px)]
        bg-[size:32px_32px]`} />
    </div>
  )
}

function AppShell() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      <AmbientOrbs />
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        <section aria-label="Cross-chain swap"><SwapCard /></section>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <GasTrafficLight />
          <WorthItCalculator />
        </div>

        <section aria-label="Watch-only portfolio"><WatchlistManager /></section>
        <section aria-label="Multi-chain USDT lookup"><WalletLookup /></section>
        <section aria-label="Gas heatmap"><GasHeatmap /></section>
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
