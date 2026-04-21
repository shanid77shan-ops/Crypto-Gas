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
        Gas history will appear here once Supabase is configured and readings accumula