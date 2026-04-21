import { Clock, Zap, DollarSign, AlertTriangle, ExternalLink } from 'lucide-react'
import { fmtToken } from '../lib/bridgeService'

function fmtUSD(n, decimals = 2) {
  if (!n && n !== 0) return '—'
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals === 0 ? 0 : 4,
  })
}

// ── EVM fee breakdown ─────────────────────────────────────────────────────────

function EvmBreakdown({ quote }) {
  const rows = [
    {
      icon : <Zap size={12} className="text-yellow-400" />,
      label: `Source Gas (${quote.fromChainGas})`,
      value: quote.sourceGasUSD > 0 ? `$${fmtUSD(quote.sourceGasUSD)}` : '—',
      sub  : `Paid on ${quote.fromChainName}`,
    },
    {
      icon : <DollarSign size={12} className="text-violet-400" />,
      label: 'Bridge Fee',
      value: `$${fmtUSD(quote.bridgeFeeUSD)}`,
      sub  : quote.bridgeName,
    },
    {
      icon : <Zap size={12} className="text-blue-400" />,
      label: `Dest Gas (${quote.toChainGas})`,
      value: quote.destGasUSD > 0 ? `$${fmtUSD(quote.destGasUSD)}` : 'Included',
      sub  : `Paid on ${quote.toChainName}`,
    },
  ]

  return (
    <div className="space-y-4">
      {/* Net receive + time */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/20 p-3.5 space-y-1">
          <p className="text-xs text-slate-500 uppercase tracking-wide">You receive</p>
          <p className="text-lg font-black text-emerald-400">
            {fmtToken(quote.toAmount, quote.toTokenSymbol)}
          </p>
          {quote.toAmountMin < quote.toAmount && (
            <p className="text-[10px] text-slate-600">
              Min: {fmtToken(quote.toAmountMin, quote.toTokenSymbol)}
            </p>
          )}
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3.5 space-y-1">
          <p className="text-xs text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <Clock size={10} /> Est. Time
          </p>
          <p className="text-lg font-black text-slate-100">{quote.durationText}</p>
          <p className="text-[10px] text-slate-600">via {quote.bridgeName}</p>
        </div>
      </div>

      {/* Fee rows */}
      <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
        {rows.map(({ icon, label, value, sub }) => (
          <div key={label}
            className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02]">
            <div className="flex items-center gap-2 min-w-0">
              {icon}
              <div className="min-w-0">
                <p className="text-xs text-slate-300 truncate">{label}</p>
                <p className="text-[10px] text-slate-600 truncate">{sub}</p>
              </div>
            </div>
            <p className="text-xs font-semibold text-white ml-3 shrink-0">{value}</p>
          </div>
        ))}

        {/* Total */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/[0.04]">
          <p className="text-xs font-bold text-slate-300">Total Fees</p>
          <p className="text-sm font-black text-white">${fmtUSD(quote.totalFeesUSD)}</p>
        </div>
      </div>

      {/* Slippage warning */}
      {quote.slippage > 1 && (
        <div className="flex items-center gap-2 text-xs text-amber-400
          bg-amber-400/8 border border-amber-400/20 rounded-lg px-3 py-2">
          <AlertTriangle size={12} className="shrink-0" />
          {quote.slippage.toFixed(2)}% slippage — consider splitting into smaller amounts
        </div>
      )}
    </div>
  )
}

// ── Non-EVM (TRON ↔ ETH) fee breakdown ────────────────────────────────────────

function NonEvmNotice({ quote }) {
  const cexLinks = [
    { name: 'Binance', href: 'https://www.binance.com/en/trade' },
    { name: 'OKX',     href: 'https://www.okx.com/trade-spot' },
    { name: 'Bybit',   href: 'https://www.bybit.com/en/trade/spot' },
  ]

  const hasFees = quote.totalFeesUSD > 0

  return (
    <div className="space-y-4">
      {/* CEX notice banner */}
      <div className="rounded-xl bg-amber-500/8 border border-amber-500/25 p-4 space-y-1.5">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-400 shrink-0" />
          <p className="text-sm font-semibold text-amber-300">
            TRON ↔ EVM requires a CEX bridge
          </p>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Decentralised bridges (LI.FI, Hop, Stargate) do not support TRON.
          Use a centralised exchange to transfer. Fee estimate below is based on live prices.
        </p>
      </div>

      {/* Fee table */}
      <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">

        {/* TRON side */}
        <div className="px-4 py-2 bg-white/[0.02]">
          <p className="text-[10px] uppercase tracking-widest text-slate-600">
            Source — {quote.fromChainName}
          </p>
        </div>
        <div className="flex items-start justify-between px-4 py-3 bg-white/[0.02] gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="mt-1 w-2 h-2 rounded-full bg-red-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200">
                Trigger Smart Contract
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                ~{quote.tronTriggerTRX} TRX consumed as energy / bandwidth
                {quote.trxPriceUSD > 0 && (
                  <span className="text-slate-600 ml-1">
                    (1 TRX ≈ ${fmtUSD(quote.trxPriceUSD)})
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-bold text-white">
              {quote.tronTriggerTRX} TRX
            </p>
            {hasFees && (
              <p className="text-[11px] text-slate-500 mt-0.5">
                ≈ ${fmtUSD(quote.tronTriggerUSD)}
              </p>
            )}
          </div>
        </div>

        {/* ETH side */}
        <div className="px-4 py-2 bg-white/[0.02]">
          <p className="text-[10px] uppercase tracking-widest text-slate-600">
            Destination — {quote.toChainName}
          </p>
        </div>
        <div className="flex items-start justify-between px-4 py-3 bg-white/[0.02] gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="mt-1 w-2 h-2 rounded-full bg-blue-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200">
                Claim Fee (ETH gas)
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                ~{quote.ethClaimGasUnits?.toLocaleString()} gas units
                {quote.ethClaimGasGwei > 0 && (
                  <span> @ {quote.ethClaimGasGwei} Gwei</span>
                )}
                {quote.ethPriceUSD > 0 && (
                  <span className="text-slate-600 ml-1">
                    (ETH ≈ ${fmtUSD(quote.ethPriceUSD, 0)})
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            {hasFees ? (
              <>
                <p className="text-xs font-bold text-white">
                  ${fmtUSD(quote.ethClaimFeeUSD)}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">in ETH</p>
              </>
            ) : (
              <p className="text-xs text-slate-500">—</p>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-white/[0.04]">
          <p className="text-sm font-bold text-slate-200">Total Est. Fees</p>
          <div className="text-right">
            {hasFees ? (
              <p className="text-base font-black text-white">
                ${fmtUSD(quote.totalFeesUSD)}
              </p>
            ) : (
              <p className="text-sm text-slate-500">Fetching prices…</p>
            )}
          </div>
        </div>
      </div>

      {/* Duration */}
      <div className="flex items-center gap-2 text-xs text-slate-500 bg-white/[0.02]
        border border-white/[0.05] rounded-lg px-3 py-2">
        <Clock size={11} className="text-slate-600 shrink-0" />
        Typical transfer time:&nbsp;
        <span className="text-slate-300 font-semibold">
          {quote.typicalMinutesMin}–{quote.typicalMinutesMax} min
        </span>
        &nbsp;via CEX withdrawal + deposit
      </div>

      {/* CEX links */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-slate-600">
          Recommended exchanges
        </p>
        <div className="flex flex-wrap gap-2">
          {cexLinks.map(({ name, href }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs px-3 py-1.5
                rounded-lg bg-white/[0.04] border border-white/[0.08]
                text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all"
            >
              {name}
              <ExternalLink size={10} className="text-slate-600" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function FeeBreakdown({ quote }) {
  if (!quote) return null
  return quote.type === 'evm'
    ? <EvmBreakdown quote={quote} />
    : <NonEvmNotice quote={quote} />
}
