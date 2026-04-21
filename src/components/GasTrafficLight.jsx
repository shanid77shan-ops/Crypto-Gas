import { useRef, useEffect } from 'react'
import { TrendingDown, X, RefreshCw, Clock } from 'lucide-react'
import { useGasPrice } from '../hooks/useGasPrice'

// ── Level config — emerald-400 for Low Gas per design spec ───────────────────
const LEVELS = {
  cheap : {
    label  : 'Low Gas',
    bulb   : 'bg-emerald-400',
    glow   : 'traffic-glow-green',
    text   : 'text-emerald-400',
    badge  : 'bg-emerald-400/15 text-emerald-400 border-emerald-400/35',
    ring   : 'ring-emerald-400/30',
  },
  average : {
    label  : 'Average',
    bulb   : 'bg-amber-400',
    glow   : 'traffic-glow-yellow',
    text   : 'text-amber-400',
    badge  : 'bg-amber-400/15 text-amber-400 border-amber-400/35',
    ring   : 'ring-amber-400/30',
  },
  expensive : {
    label  : 'High Gas',
    bulb   : 'bg-red-400',
    glow   : 'traffic-glow-red',
    text   : 'text-red-400',
    badge  : 'bg-red-400/15 text-red-400 border-red-400/35',
    ring   : 'ring-red-400/30',
  },
  unknown : {
    label  : '…',
    bulb   : 'bg-slate-600',
    glow   : '',
    text   : 'text-slate-400',
    badge  : 'bg-slate-700/60 text-slate-500 border-slate-600/40',
    ring   : '',
  },
}

// ── Bulb ─────────────────────────────────────────────────────────────────────
function Bulb({ active, bulb, glow, ring }) {
  return (
    <div className={[
      'w-12 h-12 rounded-full transition-all duration-500 ring-2',
      active
        ? `${bulb} ${glow} scale-110 ring-offset-2 ring-offset-slate-950 ${ring}`
        : 'bg-slate-800/60 opacity-20 ring-transparent',
    ].join(' ')} />
  )
}

// ── Price-drop banner ─────────────────────────────────────────────────────────
function PriceDropBanner({ visible, dropPct, prevGwei, currGwei, onDismiss }) {
  return (
    <div className={[
      'overflow-hidden transition-all duration-500 ease-out',
      visible ? 'max-h-20 opacity-100 mb-1' : 'max-h-0 opacity-0 mb-0',
    ].join(' ')}>
      <div className="flex items-center justify-between gap-3 px-4 py-2.5
        rounded-xl bg-emerald-400/8 border border-emerald-400/25
        shadow-[0_0_24px_rgba(52,211,153,.10)]">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center
            w-7 h-7 rounded-lg bg-emerald-400/15 border border-emerald-400/30 shrink-0">
            <TrendingDown size={14} className="text-emerald-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full
              bg-emerald-400 animate-ping" />
          </div>
          <div className="leading-tight">
            <p className="text-xs font-bold text-emerald-400">
              ⬇ Gas dropped {(dropPct * 100).toFixed(1)}%
            </p>
            {prevGwei && currGwei && (
              <p className="text-[10px] text-emerald-600 mt-0.5">
                {prevGwei} → {currGwei} Gwei — good time to transact!
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-emerald-700 hover:text-emerald-400 transition-colors shrink-0 p-1"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function GasTrafficLight() {
  const {
    gasGwei, level, loading, error,
    priceDrop, dropPct, lastGasPrice,
    dismissDrop, refresh,
  } = useGasPrice()

  const meta    = LEVELS[level] ?? LEVELS.unknown
  const prevRef = useRef(null)

  useEffect(() => {
    if (priceDrop && lastGasPrice !== null) prevRef.current = lastGasPrice
    if (!priceDrop)                          prevRef.current = null
  }, [priceDrop, lastGasPrice])

  return (
    <div className={[
      'glass-card p-5 flex flex-col items-center gap-4 relative overflow-hidden',
      'transition-all duration-700',
      priceDrop ? 'card-glow-emerald border-emerald-400/20' : '',
    ].join(' ')}>

      {/* Neon inner edge when price drops */}
      {priceDrop && (
        <div className="pointer-events-none absolute inset-0 rounded-[1.25rem]
          border border-emerald-400/20 shadow-[0_0_32px_rgba(52,211,153,.06)_inset]" />
      )}

      {/* Header row */}
      <div className="w-full flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            ETH Gas
          </p>
          <p className="text-[10px] text-slate-600 mt-0.5 flex items-center gap-1">
            <Clock size={9} /> 60 s refresh
          </p>
        </div>
        <button
          onClick={refresh}
          className="p-1.5 rounded-lg hover:bg-slate-800/60 text-slate-600
            hover:text-slate-300 transition-all active:scale-90"
          title="Refresh now"
        >
          <RefreshCw size={12} />
        </button>
      </div>

      {/* Price-drop banner */}
      <PriceDropBanner
        visible={priceDrop}
        dropPct={dropPct}
        prevGwei={prevRef.current}
        currGwei={gasGwei}
        onDismiss={dismissDrop}
      />

      {/* Traffic-light housing */}
      <div className="w-full bg-slate-950/70 border border-slate-800/60
        rounded-3xl px-5 py-6 flex flex-col items-center gap-4 shadow-inner">
        <Bulb active={level === 'expensive'} {...LEVELS.expensive} />
        <Bulb active={level === 'average'}   {...LEVELS.average}   />
        <Bulb active={level === 'cheap'}     {...LEVELS.cheap}     />
      </div>

      {/* Live reading */}
      {loading && !gasGwei ? (
        <div className="w-full space-y-2 flex flex-col items-center">
          <div className="h-9 w-28 rounded-lg bg-slate-800/60 animate-pulse" />
          <div className="h-5 w-20 rounded-full bg-slate-800/60 animate-pulse" />
        </div>
      ) : error ? (
        <p className="text-xs text-red-400 text-center">{error}</p>
      ) : (
        <div className="text-center space-y-2 w-full">
          <p className={`text-4xl font-black tabular-nums tracking-tighter ${meta.text}`}>
            {gasGwei}
            <span className="text-base font-normal text-slate-600 ml-1.5">Gwei</span>
          </p>
          <span className={`inline-flex items-center px-3 py-1 rounded-full
            text-xs font-semibold border ${meta.badge}`}>
            {meta.label}
          </span>
        </div>
      )}

      {/* Threshold legend */}
      <div className="w-full grid grid-cols-3 text-center
        border-t border-slate-800/60 pt-3 gap-0.5">
        {[
          { range: '< 20',  label: 'Low',  cls: 'text-emerald-400' },
          { range: '20–50', label: 'Avg',  cls: 'text-amber-400'   },
          { range: '> 50',  label: 'High', cls: 'text-red-400'     },
        ].map(({ range, label, cls }) => (
          <div key={label} className="space-y-0.5">
            <p className={`text-[10px] font-bold ${cls}`}>{range}</p>
            <p className="text-[9px] text-slate-700">{label}</p>
          </div>
        ))}
