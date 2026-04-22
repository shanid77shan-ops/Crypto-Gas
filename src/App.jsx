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
          <div className="absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full
            bg-red-600/20 blur-[200px]" />
          <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full
            bg-red-700/15 blur-[180px]" />
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full
            bg-red-800/10 blur-[150px]" />
        </>
      ) : (
        <>
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full
            bg-red-200/50 blur-[120px]" />
          <div className="absolute -bottom-24 -right-24 w-[460px] h-[460px] rounded-full
            bg-red-100/60 blur-[100px]" />
        </>
      )}
      <div
        className="absolute inset-0 bg-[size:28px_28px]"
        style={{
          backgroundImage: `radial-gradient(${dark
            ? 'rgba(255,30,30,0.10)'
            : 'rgba(220,20,20,0.06)'} 1px, transparent 1px)`,
        }}
      />
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
        <section aria-label="Multi-chain lookup"><WalletLookup /></section>
        <section aria-label="Gas heatmap"><GasHeatmap /></section>
        <GasHistory />
      </main>

      <footer
        className="text-center py-5 text-xs font-bold border-t"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
      >
        <span className="font-black" style={{ color: 'var(--red)' }}>Global Gas</span>
        <span className="mx-2 opacity-30">·</span>
        Powered by Alchemy · TronGrid · CryptoCompare · ChangeNOW · LI.FI
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
