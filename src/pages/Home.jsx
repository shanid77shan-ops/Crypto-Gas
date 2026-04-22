import { useNavigate } from 'react-router-dom'
import { ArrowRight, Zap, Shield, TrendingUp, Globe } from 'lucide-react'
import GasTrafficLight from '../components/GasTrafficLight'

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="glass-card p-5 flex items-center gap-4">
      <div className="p-3 rounded-xl shrink-0"
        style={{ background: 'rgba(255,32,32,0.15)', border: '1px solid rgba(255,32,32,0.40)' }}>
        <Icon size={20} style={{ color: 'var(--red)' }} />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-xl font-black text-white mt-0.5">{value}</p>
        {sub && <p className="text-xs font-bold text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="space-y-8">

      {/* Hero */}
      <div className="glass-card p-8 sm:p-12 relative overflow-hidden text-center">
        {/* bg bleed */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2
          w-[500px] h-[300px] rounded-full bg-red-600/20 blur-[120px]" />

        <div className="relative space-y-4">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest
            border" style={{ background: 'rgba(255,32,32,0.15)', borderColor: 'var(--color-border)', color: 'var(--red)' }}>
            ⚡ Live · Multi-Chain
          </span>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Global<br />
            <span style={{ color: 'var(--red)' }}>Gas</span>
          </h1>

          <p className="text-base sm:text-lg font-bold text-slate-300 max-w-md mx-auto leading-relaxed">
            Real-time gas tracking, cross-chain swaps, and portfolio management — all in one place.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/swap')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm text-white
                transition-all active:scale-95 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, var(--red), #cc0000)',
                boxShadow: '0 8px 32px rgba(255,32,32,0.40)',
              }}
            >
              Start Swapping <ArrowRight size={15} />
            </button>
            <button
              onClick={() => navigate('/gas')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm
                border transition-all active:scale-95"
              style={{
                background: 'rgba(255,32,32,0.08)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-base)',
              }}
            >
              Check Gas <Zap size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Globe}      label="Networks"       value="10+"      sub="Chains supported" />
        <StatCard icon={TrendingUp} label="Swap Pairs"     value="700+"     sub="via ChangeNOW" />
        <StatCard icon={Shield}     label="Non-custodial"  value="100%"     sub="You hold your keys" />
      </div>

      {/* Live gas */}
      <div>
        <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2">
          <Zap size={16} style={{ color: 'var(--red)' }} />
          Live Gas
        </h2>
        <GasTrafficLight />
      </div>

      {/* Feature grid */}
      <div>
        <h2 className="text-lg font-black text-white mb-3">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              title : 'Cross-Chain Swap',
              desc  : 'Swap 700+ crypto pairs instantly with real-time rate estimates and full fee transparency.',
              path  : '/swap',
              label : 'Open Swap',
            },
            {
              title : 'Gas Tracker',
              desc  : 'Live Ethereum gas prices, historical heatmap, and "Is it worth it?" calculator.',
              path  : '/gas',
              label : 'Check Gas',
            },
            {
              title : 'Portfolio',
              desc  : 'Watch-only wallet tracker across ETH, BSC, TRON, Solana, and more.',
              path  : '/portfolio',
              label : 'View Portfolio',
            },
            {
              title : 'Wallet Lookup',
              desc  : 'Instantly look up any wallet address across multiple chains — no sign-in needed.',
              path  : '/portfolio',
              label : 'Look Up Wallet',
            },
          ].map(f => (
            <div key={f.title} className="glass-card p-5 space-y-3 glass-card-interactive cursor-pointer"
              onClick={() => navigate(f.path)}>
              <h3 className="font-black text-white text-base">{f.title}</h3>
              <p className="text-sm font-bold text-slate-400 leading-relaxed">{f.desc}</p>
              <button
                className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wide transition-colors"
                style={{ color: 'var(--red)' }}
              >
                {f.label} <ArrowRight size={11} />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
