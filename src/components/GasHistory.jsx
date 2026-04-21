import { useState, useEffect } from 'react'
import { History } from 'lucide-react'
import { fetchGasHistory } from '../lib/supabase'

// ── Sparkline SVG ─────────────────────────────────────────────────────────────
function Sparkline({ data }) {
  if (!data.length) return null
  const vals = data.map(r => Number(r.gas_gwei))
  const min  = Math.min(...vals)
  const max  = Math.max(...vals) || 1
  const W = 300, H = 48, P = 4

  const pts = vals.slice().reverse().map((v, i) => {
    const x = P + (i / (vals.length - 1 || 1)) * (W - P * 2)
    const y = P + ((max - v) / (max - min || 1)) * (H - P * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-12" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%"   stopColor="#6366f1" stopOpacity=".7" />
          <stop offset="100%" stopColor="#34d399" stopOpacity=".9" />
        </linearGradient>
      </defs>
      <polyline
        points={pts}
        fill="none"
        stroke="url(#sparkGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ── Badge colours — emerald-400 for low gas ───────────────────────────────────
function gweiBadge(gwei) {
  if (gwei < 20)  return 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
  if (gwei <= 50) return 'bg-amber-400/10  text-amber-400  border border-amber-400/20'
  return                 'bg-red-400/10    text-red-400    border border-red-400/20'
}

// ── Main component ────────────────────────────────────────────────────────────
export default function GasHistory() {
  const [history, setHistory] = useState([])
  const [ready, setReady]     = useState(false)

  useEffect(() => {
    fetchGasHistory(20).then(data => {
      setHistory(data ?? [])
      setReady(true)
    })
  }, [])

  if (!ready) return null

  if (!history.length) {
    return (
      <div className="glass-card p-6 text-center text-slate-600 text-sm">
        Gas history will appear here once Supabase is configured and readings accumulate.
      </div>
    )
  }

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/25">
            <History size={13} className="text-indigo-400" />
          </div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Gas History
          </h2>
        </div>
        <span className="text-xs text-slate-600">Last {history.length} readings</span>
      </div>

      {/* Trend sparkline */}
      <div className="rounded-xl bg-slate-900/50 border border-slate-800/60 p-3">
        <Sparkline data={history} />
      </div>

      {/* Reading list */}
      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {history.map(row => (
          <div
            key={row.id}
            className="flex items-center justify-between py-1 px-2 rounded-lg
              hover:bg-slate-800/30 transition-colors text-xs"
          >
            <span className="text-slate-500 tabular-nums">
              {new Date(row.recorded_at).toLocaleTimeString([], {
                hour   : '2-digit',
                minute : '2-digit',
              })}
            </span>
            <span className={`px-2 py-0.5 rounded-full font-semibold tabular-nums
              ${gweiBadge(Number(row.gas_gwei))}`}>
              {Number(row.gas_gwei).toFixed(1)} Gwei
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
