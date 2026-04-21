import { useRef, useEffect } from 'react'
import { TrendingDown, X, RefreshCw, Clock } from 'lucide-react'
import { useGasPrice } from '../hooks/useGasPrice'

const LEVELS = {
  cheap : {
    label : 'Low Gas',
    bulb  : 'bg-emerald-400',
    glow  : 'traffic-glow-green',
    text  : 'text-emerald-400',
    badge : 'bg-emerald-400/15 text-emerald-400 border-emerald-400/35',
    ring  : 'ring-emerald-400/30',
  },
  average : {
    label : 'Average',
    bulb  : 'bg-amber-400',
    glow  : 'traffic-glow-yellow',
    text  : 'text-amber-400',
    badge : 'bg-amber-400/15 text-amber-400 border-amber-400/35',
    ring  : 'ring-amber-400/30',
  },
  expensive : {
    label : 'High Gas',
    bulb  : 'bg-red-400',
    glow  : 'traffic-glow-red',
    text  : 'text-red-400',
    badge : 'bg-red-400/15 text-red-400 border-red-400/35',
    ring  : 'ring-red-400/30',
  },
  unknown : {
    label : '…',
    bulb  : 'bg-slate-600',
    glow  : '',
    text  : 'text-slate-400',
    badge : 'bg-slate-700/60 text-slate-400 border-slate-600/40',
    ring  : '',
  },
}

function Bulb({ active, bulb, glow, ring }) {
  return (
    <div className={[
      'w-14 h-14 rounded-full transition-all duration-500 ring-2',
      active
        ? `${bulb} ${glow} scale-110 ring-offset-2 ring-offset-slate-950 ${ring}`
        : 'bg-slate-800/60 opacity-20 ring-transparent',
    ].join(' ')} />
  )
}

function PriceDropBanner({ visible, dropPct, prevGwei, currGwei, onDismiss }) {
  return (
    <div className={[
      'overflow-hidden transition-all duration-500 ease-out w-full',
      visible ? 'max-h-24 opacity-100 mb-1' : 'max-h-0 opacity-0 mb-0',
    ].join(' ')}>
      <div className="flex items-center justify-between gap-3 px-4 py-3
        rounded-xl bg-emerald-400/8 border border-emerald-400/25">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center
            w-8 h-8 rounded-lg bg-emerald-400/15 border border-emerald-400/30 shrink-0">
            <TrendingDown size={15} className="text-emerald-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full
              bg-emerald-400 animate-ping" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-400">
              ⬇ Gas dropped {(dropPct * 100).toFixed(1)}%
            </p>
            {prevGwei && currGwei && (
              <p className="text-xs text-emerald-600 mt-0.5">
                {prevGwei} → {currGwei} Gwei — good time to transact!
              </p>
            )}
          </div>
        </div>
        <button onClick={onDismiss} className="text-emerald-700 hover:text-emerald-400 p-1">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}

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
    if (!priceDrop) prevRef.current = null
  }, [priceDrop, lastGasPrice])

  return (
    <div className={[
      'glass-card p-6 flex flex-col items-center gap-5 relative overflow-hidden transition-all duration-700',
      priceDrop ? 'card-glow-emerald border-emerald-400/20' : '',
    ].join(' ')}>

      {priceDrop && (
        <div className="pointer-events-none absolute inset-0 rounded-[1.25rem]
          border border-emerald-400/20 shadow-[0_0_32px_rgba(52,211,153,.06)_inset]" />
      )}

      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div>
          <p className="text-base font-bold text-slate-100 tracking-wide">ETH Gas</p>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Clock size={11} /> Refreshes every 60s
          </p>
        </div>
        <button
          onClick={refresh}
          className="p-2 rounded-lg hover:bg-slate-800/60 text-slate-500
            hover:text-slate-200 transition-all active:scale-90"
          title="Refresh now"
        >
          <RefreshCw size={14} />
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

      {/* Traffic light housing */}
      <div className="w-full bg-slate-950/70 border border-slate-800/60
        rounded-3xl px-6 py-7 flex flex-col items-center gap-5 shadow-inner">
        <Bulb active={level === 'expensive'} {...LEVELS.expensive} />
        <Bulb active={level === 'average'}   {...LEVELS.average}   />
        <Bulb active={level === 'cheap'}     {...LEVELS.cheap}     />
      </div>

      {/* Reading */}
      {loading && !gasGwei ? (
        <div className="w-full space-y-2 flex flex-col items-center">
          <div className="h-12 w-32 rounded-lg bg-slate-800/60 animate-pulse" />
          <div className="h-7 w-24 rounded-full bg-slate-800/60 animate-pulse" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-400 text-center">{error}</p>
      ) : (
        <div className="text-center space-y-2.5 w-full">
          <p className={`text-5xl font-black tabular-nums tracking-tighter ${meta.text}`}>
            {gasGwei}
            <span className="text-lg font-normal text-slate-500 ml-2">Gwei</span>
          </p>
          <span className={`inline-flex items-center px-4 py-1.5 rounded-full
            text-sm font-semibold border ${meta.badge}`}>
            {meta.label}
          </span>
        </div>
      )}

      {/* Legend */}
      <div className="w-full grid grid-cols-3 text-center
        border-t border-slate-800/60 pt-4 gap-1">
        {[
          { range: '< 20',  label: 'Low',  cls: 'text-emerald-400' },
          { range: '20–50', label: 'Avg',  cls: 'text-amber-400'   },
          { range: '> 50',  label: 'High', cls: 'text-red-400'     },
        ].map(({ range, label, cls }) => (
          <div key={label} className="space-y-1">
            <p className={`text-sm font-bold ${cls}`}>{range}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
