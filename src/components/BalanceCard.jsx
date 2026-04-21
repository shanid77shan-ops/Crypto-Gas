import { CHAINS } from '../lib/chains'

const STATUS_MSG = {
  ok           : null,
  error        : 'Failed to fetch',
  incompatible : 'Address format not supported on this chain',
}

export default function BalanceCard({ chainId, data }) {
  const chain                = CHAINS[chainId]
  const { balance, status }  = data ?? { balance: null, status: 'unknown' }
  const msg                  = STATUS_MSG[status]

  const statusBadge =
    status === 'ok'           ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/25'
    : status === 'incompatible' ? 'bg-slate-800/60 text-slate-600 border-slate-700/40'
    : status === 'error'      ? 'bg-red-400/10 text-red-400 border-red-400/25'
    :                           'bg-slate-800/60 text-slate-600 border-slate-700/40'

  const statusLabel =
    status === 'ok' ? 'Live' : status === 'incompatible' ? 'N/A' : status === 'error' ? 'Error' : '—'

  return (
    <div className={`glass-card glass-card-interactive p-5 border ${chain.border} flex flex-col gap-3`}>

      {/* Chain identity */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl leading-none">{chain.icon}</span>
          <div>
            <p className="text-sm font-semibold text-slate-100">{chain.name}</p>
            <p className="text-xs text-slate-500">{chain.symbol} Network</p>
          </div>
        </div>
        <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${statusBadge}`}>
          {statusLabel}
        </span>
      </div>

      {/* Gradient divider */}
      <div className={`h-px w-full bg-gradient-to-r ${chain.gradient} opacity-25`} />

      {/* Balance */}
      {status === 'ok' ? (
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
            USDT Balance
          </p>
          <p cl