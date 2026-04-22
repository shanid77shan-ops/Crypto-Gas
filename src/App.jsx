import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider, useTheme }       from './lib/ThemeContext'
import Header                            from './components/Header'
import { Sidebar, BottomNav }            from './components/Navigation'
import SupportChat                        from './components/SupportChat'
import Home                              from './pages/Home'
import Swap                              from './pages/Swap'
import Gas                               from './pages/Gas'
import Portfolio                         from './pages/Portfolio'

// ── Ambient background orbs ───────────────────────────────────────────────────
function AmbientOrbs() {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      {dark ? (
        <>
          <div className="absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full bg-red-600/18 blur-[220px]" />
          <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-red-700/12 blur-[190px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-red-900/8 blur-[160px]" />
        </>
      ) : (
        <>
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-red-200/50 blur-[130px]" />
          <div className="absolute -bottom-24 -right-24 w-[460px] h-[460px] rounded-full bg-red-100/60 blur-[110px]" />
        </>
      )}
      <div
        className="absolute inset-0 bg-[size:28px_28px]"
        style={{
          backgroundImage: `radial-gradient(${
            dark ? 'rgba(255,30,30,0.09)' : 'rgba(220,20,20,0.05)'
          } 1px, transparent 1px)`,
        }}
      />
    </div>
  )
}

// ── App shell (needs to be inside BrowserRouter for NavLink) ─────────────────
function AppShell() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      <AmbientOrbs />

      {/* Sticky top header */}
      <Header />

      {/* Body = sidebar + page content */}
      <div className="flex flex-1 w-full max-w-7xl mx-auto px-0 lg:px-4">

        {/* Desktop sidebar */}
        <Sidebar />

        {/* Page content */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 sm:py-8
          pb-24 lg:pb-10">
          <Routes>
            <Route path="/"          element={<Home />}      />
            <Route path="/swap"      element={<Swap />}      />
            <Route path="/gas"       element={<Gas />}       />
            <Route path="/portfolio" element={<Portfolio />} />
            {/* Fallback → Home */}
            <Route path="*"          element={<Home />}      />
          </Routes>
        </main>

      </div>

      {/* Mobile bottom nav */}
      <BottomNav />

      {/* Support chat */}
      <SupportChat />

      {/* Footer */}
      <footer
        className="hidden lg:block text-center py-4 text-xs font-bold border-t"
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

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </BrowserRouter>
  )
}
