import { useState, useEffect, useCallback } from 'react'
import {
  DollarSign, Zap, CheckCircle2, XCircle, RefreshCw,
  TrendingDown, AlertTriangle, ArrowRight, Fuel,
  Calculator, ChevronDown, ChevronUp,
} from 'lucide-react'
import { GasService } from '../lib/GasService'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n, d = 2) {
  if (n == null) return '—'
  return n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
}

function GaugeBar({ pct, worthIt }) {
  const fill   = Math.min(pct * 100, 100)
  const color  = worthIt           ? 'from-emerald-500 to-cyan-400'
               : fill > 50         ? 'from-red-600 to-rose-400'
               :                     'from-amber-500 to-yellow-400'
  return (
    <div className="relative h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
      <div
        className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
        style={{ width: `${fill}%` }}
      />
      {/* 5 % threshold marker */}
      <div className="absolute inset-y-0 left-[5%] w-px bg-white/40" />
    </div>
  )
}

// ── Rule 2: Formula Breakdown ─────────────────────────────────────────────────
// Shows:  Estimated Cost = Gas Limit × Gas Price × ETH Price
// with each factor clearly labelled and the product visible at each step.

function FormulaBreakdown({ gasGwei, ethPrice, gasLimit, gasCost }) {
  const [open, setOpen] = useState(false)
  if (!gasGwei || !ethPrice) return null

  const gasCostETH = (gasGwei * gasLimit) / 1e9

  const rows = [
    {
      factor : 'Gas Limit',
      value  : gasLimit.toLocaleString(),
      unit   : 'gas units',
      note   : gasLimit === GasService.GAS_LIMIT_ERC20
               ? 'typical ERC-20/TRC-20 transfer'
               : 'standard ETH transfer',
    },
    {
      factor : 'Gas Price',
      value  : `${gasGwei}`,
      unit   : 'Gwei',
      note   : `${gasGwei} × 10⁻⁹ ETH per unit`,
    },
    {
      factor : 'ETH Price',
      value  : `$${fmt(ethPrice, 0)}`,
      unit   : 'USD / ETH',
      note   : 'live CryptoCompare price',
    },
  ]

  return (
    <div className="rounded-xl border border-white/[0.06] overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5
          text-xs text-slate-500 hover:text-slate-300 hover:bg-white/[0.03] transition-all"
      >
        <span className="flex items-center gap-1.5">
          <Calculator size={11} />
          Cost formula breakdown
        </span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {/* Expanded formula */}
      <div className={`overflow-hidden transition-all duration-300
        ${open ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="border-t border-white/[0.05] px-4 py-4 space-y-3
          bg-[#07070f]/60 font-mono text-xs">

          {/* Formula line */}
          <div className="flex items-center gap-2 flex-wrap text-slate-600">
            <span className="text-slate-400">Cost</span>
            <span>=</span>
            <span className="text-indigo-400">Gas Limit</span>
            <span className="text-slate-700">×</span>
            <span className="text-yellow-400">Gas Price</span>
            <span className="text-slate-700">×</span>
            <span className="text-emerald-400">ETH Price</span>
          </div>

          {/* Factor rows */}
          <div className="space-y-2">
            {rows.map(({ factor, value, unit, note }, i) => (
              <div key={i} className="grid grid-cols-[90px_1fr] gap-2 items-start">
                <span className={`font-semibold
                  ${i === 0 ? 'text-indigo-400'
                  : i === 1 ? 'text-yellow-400'
                  :           'text-emerald-400'}`}>
                  {factor}
                </span>
                <div>
                  <span className="text-white">{value}</span>
                  <span className="text-slate-600 ml-1">{unit}</span>
                  <p className="text-[10px] text-slate-700 mt-0.5 font-sans">{note}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Step-by-step arithmetic */}
          <div className="border-t border-white/[0.05] pt-3 space-y-1 text-[11px]">
            <div className="flex gap-2 text-slate-600">
              <span>=</span>
              <span>
                {gasLimit.toLocaleString()}
                <span className="text-slate-700 mx-1">×</span>
                {gasGwei} Gwei
                <span className="text-slate-700 mx-1">×</span>
                ${fmt(ethPrice, 0)}
              </span>
            </div>
            <div className="flex gap-2 text-slate-500">
              <span>=</span>
              <span>
                {gasCostETH.toFixed(8)} ETH
                <span className="text-slate-700 mx-1">×</span>
                ${fmt(ethPrice, 0)}
              </span>
            </div>
            <div className="flex gap-2 font-bold text-white">
              <span>=</span>
              <span>
                <span className="text-cyan-400">${fmt(gasCost, 4)}</span>
                <span className="text-slate-600 font-normal ml-2 font-sans">paid in gas</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function WorthItCalculator() {
  const [txAmount, setTxAmount]     = useState('')
  const [gasLimit, setGasLimit]     = useState('erc20')
  const [gasGwei, setGasGwei]       = useState(null)
  const [ethPrice, setEthPrice]     = useState(null)
  const [loading, setLoading]       = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError]           = useState(null)

  const refresh = useCallback(async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true)
    setError(null)
    try {
      const [g, p] = await Promise.all([
        GasService.fetchCurrentGasGwei(),
        GasService.fetchEthPriceUSD(),
      ])
      setGasGwei(Math.round(g * 10) / 10)
      setEthPrice(p)
    } catch {
      setError('Could not fetch live data. Check your Alchemy API key.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const limit     = gasLimit === 'erc20' ? GasService.GAS_LIMIT_ERC20 : GasService.GAS_LIMIT_TRANSFER
  const gasCost   = gasGwei && ethPrice ? GasService.calcGasCostUSD(gasGwei, ethPrice, limit) : null
  const txNum     = parseFloat(txAmount) || 0
  const result    = gasCost && txNum > 0 ? GasService.evaluateWorthIt(txNum, gasCost) : null

  return (
    <div className="glass-card p-6 space-y-5 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56
        rounded-full bg-indigo-600/8 blur-3xl" />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/25">
              <Fuel size={14} className="text-indigo-400" />
            </div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              "Worth It?" Calculator
            </h2>
          </div>
          <p className="text-xs text-slate-600">Gas fee vs. your transaction — 5% threshold</p>
        </div>
        <button
          onClick={() => refresh(true)}
          disabled={refreshing}
          className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-all"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Live prices */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: <Zap size={11} className="text-yellow-400" />,   label: 'Gas Price',  val: gasGwei ? `${gasGwei} Gwei`   : '—', width: 'w-20' },
          { icon: <DollarSign size={11} className="text-emerald-400" />, label: 'ETH Price', val: ethPrice ? `$${fmt(ethPrice, 0)}` : '—', width: 'w-24' },
        ].map(({ icon, label, val, width }) => (
          <div key={label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 space-y-1">
            <p className="text-xs text-slate-600 flex items-center gap-1.5">{icon} {label}</p>
            {loading ? (
              <div className={`h-5 ${width} rounded bg-white/5 animate-pulse`} />
            ) : (
              <p className="text-sm font-bold text-white">{val}</p>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-amber-400
          bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
          <AlertTriangle size={13} /> {error}
        </div>
      )}

      {/* Inputs */}
      <div className="space-y-3">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-sm">$</span>
          <input
            type="number" min="0" step="any"
            value={txAmount}
            onChange={e => setTxAmount(e.target.value)}
            placeholder="Transaction amount in USD"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-8 pr-4 py-3
              text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/60
              focus:border-indigo-500/40 transition-all"
          />
        </div>

        <div className="flex gap-2">
          {[
            { id: 'erc20',    label: 'Token Transfer', sub: '65,000 gas' },
            { id: 'transfer', label: 'ETH Transfer',   sub: '21,000 gas' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setGasLimit(opt.id)}
              className={`flex-1 rounded-xl px-3 py-2.5 text-xs font-medium transition-all border
                ${gasLimit === opt.id
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                  : 'bg-white/[0.03] border-white/[0.06] text-slate-500 hover:text-slate-300'}`}
            >
              {opt.label}
              <span className="block text-[10px] opacity-60 mt-0.5 font-mono">{opt.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Rule 2: Formula Breakdown ──────────────────────────────────────── */}
      <FormulaBreakdown
        gasGwei={gasGwei}
        ethPrice={ethPrice}
        gasLimit={limit}
        gasCost={gasCost}
      />

      {/* Result */}
      {result ? (
        <div className={`rounded-2xl border p-5 space-y-4 transition-all duration-500
          ${result.worthIt
            ? 'bg-emerald-500/5 border-emerald-500/20'
            : 'bg-red-500/5 border-red-500/20'}`}
        >
          <div className="flex items-center gap-3">
            {result.worthIt
              ? <CheckCircle2 size={26} className="text-emerald-400 shrink-0" />
              : <XCircle     size={26} className="text-red-400 shrink-0" />
            }
            <div>
              <p className={`text-lg font-black ${result.worthIt ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.worthIt ? 'Worth It!' : 'Not Worth It'}
              </p>
              <p className="text-xs text-slate-500">
                Gas is <strong className="text-white">{(result.gasPct * 100).toFixed(2)}%</strong> of
                your <strong className="text-white">${fmt(txNum)}</strong> transaction
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-slate-700">
              <span>0%</span>
              <span className="text-white/30">— 5% limit —</span>
              <span>100%+</span>
            </div>
            <GaugeBar pct={result.gasPct} worthIt={result.worthIt} />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm border-t border-white/[0.05] pt-4">
            <div>
              <p className="text-[10px] text-slate-600 uppercase tracking-wide">Gas cost (USD)</p>
              <p className="font-bold text-white mt-0.5">${fmt(gasCost, 4)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-600 uppercase tracking-wide">Your amount</p>
              <p className="font-bold text-white mt-0.5">${fmt(txNum)}</p>
            </div>
          </div>

          {!result.worthIt && (
            <div className="flex items-start gap-2 text-xs
              bg-white/[0.03] rounded-lg px-3 py-2.5 border border-white/[0.06]">
              <TrendingDown size={13} className="text-cyan-400 mt-0.5 shrink-0" />
              <span className="text-slate-400">
                Minimum transaction for ≤ 5% gas:&nbsp;
                <span className="text-cyan-400 font-semibold">${fmt(result.minTxUSD)}</span>
              </span>
            </div>
          )}
          {!result.worthIt && gasGwei > 20 && (
            <p className="flex items-center gap-1.5 text-[11px] text-amber-400/80">
              <ArrowRight size={11} className="shrink-0" />
              Gas is elevated — off-peak window is 02:00–07:00 UTC
            </p>
          )}
        </div>
      ) : (
        !loading && (
          <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02]
            p-5 text-center text-slate-700 text-sm space-y-1">
            <p className="text-2xl">💸</p>
            <p>Enter a transaction amount to evaluate the gas cost</p>
          </div>
        )
      )}
    </div>
  )
}
