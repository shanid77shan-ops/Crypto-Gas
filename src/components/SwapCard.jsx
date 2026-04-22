import { useState, useEffect, useRef, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  ArrowUpDown, Copy, CheckCheck, Loader2, Search,
  AlertCircle, CheckCircle2, XCircle, RefreshCw,
  ExternalLink, History, ArrowRight, Trash2, ChevronDown, X, Info,
} from 'lucide-react'
import {
  STEPS, STATUS_STEP, POPULAR_TICKERS, coinImageUrl,
  fetchCurrencies, fetchEstimate, fetchMinAmount, createSwap, fetchSwapStatus,
} from '../lib/SwapProvider'

// ── localStorage helpers ──────────────────────────────────────────────────────

const HISTORY_KEY = 'gg_swap_history'

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') }
  catch { return [] }
}
function persistHistory(entries) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 50)))
}
function addHistoryEntry(tx, fromCoin, toCoin) {
  const entries = loadHistory()
  entries.unshift({
    id           : tx.id,
    fromTicker   : fromCoin.ticker,
    fromName     : fromCoin.name,
    toTicker     : toCoin.ticker,
    toName       : toCoin.name,
    amount       : tx.amount,
    estimated    : tx.estimatedAmount,
    payinAddress : tx.payinAddress,
    payoutAddress: tx.payoutAddress,
    createdAt    : new Date().toISOString(),
    status       : 'waiting',
  })
  persistHistory(entries)
}
function updateHistoryStatus(id, status) {
  const entries = loadHistory()
  const idx = entries.findIndex(e => e.id === id)
  if (idx !== -1) { entries[idx].status = status; persistHistory(entries) }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n, d = 4) {
  if (n == null) return '—'
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: d })
}
function timeAgo(iso) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// ── Coin image with fallback ──────────────────────────────────────────────────

function CoinIcon({ ticker, size = 24 }) {
  const [err, setErr] = useState(false)
  if (err) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-full bg-slate-700 flex items-center justify-center
          text-[9px] font-bold text-slate-400 shrink-0"
      >
        {ticker?.slice(0, 2).toUpperCase()}
      </div>
    )
  }
  return (
    <img
      src={coinImageUrl(ticker)}
      alt={ticker}
      width={size}
      height={size}
      className="rounded-full shrink-0"
      onError={() => setErr(true)}
    />
  )
}

// ── Copy button ───────────────────────────────────────────────────────────────

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-200 transition-all"
      title="Copy"
    >
      {copied ? <CheckCheck size={13} className="text-emerald-400" /> : <Copy size={13} />}
    </button>
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLE = {
  waiting   : 'bg-slate-700/50 text-slate-400 border-slate-600/50',
  confirming: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
  verifying : 'bg-blue-500/10 text-blue-400 border-blue-500/25',
  exchanging: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  sending   : 'bg-violet-500/10 text-violet-400 border-violet-500/25',
  finished  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  failed    : 'bg-red-500/25 text-red-300 border-red-400/60',
  expired   : 'bg-red-500/25 text-red-300 border-red-400/60',
  refunded  : 'bg-orange-500/10 text-orange-400 border-orange-500/25',
}
function StatusBadge({ status }) {
  const cls = STATUS_STYLE[status] ?? STATUS_STYLE.waiting
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${cls}`}>
      {status ?? 'waiting'}
    </span>
  )
}

// ── Coin selector (dropdown) ──────────────────────────────────────────────────

function CoinSelector({ value, onChange, currencies, excludeTicker, loading }) {
  const [open,   setOpen]   = useState(false)
  const [search, setSearch] = useState('')
  const ref   = useRef(null)
  const input = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => input.current?.focus(), 50)
  }, [open])

  const selected = currencies.find(c => c.ticker === value)

  const filtered = (() => {
    const q = search.trim().toLowerCase()
    const pool = currencies.filter(c => c.ticker !== excludeTicker)
    if (!q) {
      const pop = POPULAR_TICKERS
        .map(t => pool.find(c => c.ticker === t))
        .filter(Boolean)
      const rest = pool.filter(c => !POPULAR_TICKERS.includes(c.ticker))
      return { popular: pop, rest: [] }
    }
    const matched = pool.filter(c =>
      c.ticker.includes(q) || c.name.toLowerCase().includes(q)
    ).slice(0, 60)
    return { popular: [], rest: matched }
  })()

  function select(coin) {
    onChange(coin)
    setOpen(false)
    setSearch('')
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        disabled={loading}
        className="w-full flex items-center gap-2 px-3 py-3 rounded-xl
          bg-white/[0.04] border border-white/[0.08]
          hover:bg-white/[0.07] hover:border-white/[0.14]
          active:scale-[0.98] transition-all text-left"
      >
        {loading ? (
          <Loader2 size={20} className="animate-spin text-slate-600" />
        ) : selected ? (
          <CoinIcon ticker={selected.ticker} size={24} />
        ) : (
          <div className="w-6 h-6 rounded-full bg-slate-700" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-100 truncate">
            {selected ? selected.ticker.toUpperCase() : 'Select'}
          </p>
          {selected && (
            <p className="text-[10px] text-slate-500 truncate">{selected.name}</p>
          )}
        </div>
        <ChevronDown size={14} className={`text-slate-500 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0
          bg-slate-900 border border-white/[0.10] rounded-xl shadow-2xl overflow-hidden">

          {/* Search */}
          <div className="p-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 bg-white/[0.05] rounded-lg px-3 py-2">
              <Search size={13} className="text-slate-500 shrink-0" />
              <input
                ref={input}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search coin or ticker…"
                className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-600
                  outline-none min-w-0"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-slate-600 hover:text-slate-400">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-56 p-1.5">
            {filtered.popular.length > 0 && (
              <>
                <p className="text-[10px] text-slate-600 uppercase tracking-widest px-2 py-1">Popular</p>
                {filtered.popular.map(c => (
                  <CoinRow key={c.ticker} coin={c} onSelect={select} active={c.ticker === value} />
                ))}
                {filtered.rest.length > 0 && (
                  <div className="border-t border-white/[0.05] my-1" />
                )}
              </>
            )}
            {filtered.rest.length > 0 && filtered.popular.length > 0 && (
              <p className="text-[10px] text-slate-600 uppercase tracking-widest px-2 py-1">All coins</p>
            )}
            {filtered.rest.map(c => (
              <CoinRow key={c.ticker} coin={c} onSelect={select} active={c.ticker === value} />
            ))}
            {filtered.popular.length === 0 && filtered.rest.length === 0 && (
              <p className="text-xs text-slate-600 text-center py-6">No coins found</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function CoinRow({ coin, onSelect, active }) {
  return (
    <button
      onClick={() => onSelect(coin)}
      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors text-left
        ${active ? 'bg-red-500/30 text-white font-bold' : 'hover:bg-white/[0.05] text-slate-200'}`}
    >
      <CoinIcon ticker={coin.ticker} size={22} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate">{coin.ticker.toUpperCase()}</p>
        <p className="text-[10px] text-slate-500 truncate">{coin.name}</p>
      </div>
    </button>
  )
}

// ── Fee breakdown ─────────────────────────────────────────────────────────────

const COMMISSION_PCT = 0.5   // Global Gas service fee %

function FeeBreakdown({ amount, estimate, fromCoin, toCoin }) {
  const [open, setOpen] = useState(false)
  if (!estimate?.estimatedAmount || !amount) return null

  const sent        = parseFloat(amount)
  const received    = parseFloat(estimate.estimatedAmount)
  const feePct      = ((sent - received) / sent) * 100

  // Isolate our commission vs third-party costs
  const networkAndExchangePct = Math.max(0, feePct - COMMISSION_PCT)

  // Detect high-gas source networks
  const fromNet   = fromCoin?.network?.toLowerCase() ?? ''
  const toNet     = toCoin?.network?.toLowerCase()   ?? ''
  const isEthFrom = fromNet.includes('eth') || fromCoin?.ticker?.includes('erc20')
  const isEthTo   = toNet.includes('eth')   || toCoin?.ticker?.includes('erc20')
  const highGas   = isEthFrom || isEthTo

  const feeColor = feePct > 5 ? 'text-rose-400' : feePct > 2 ? 'text-amber-400' : 'text-slate-400'

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      {/* Summary row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5
          hover:bg-white/[0.03] transition-colors text-left"
      >
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Info size={11} className="shrink-0" /> Fee breakdown
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-bold ${feeColor}`}>
            −{fmt(Math.abs(feePct), 2)}%
          </span>
          <ChevronDown size={12} className={`text-slate-600 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Expanded rows */}
      {open && (
        <div className="border-t border-white/[0.05] px-4 py-3 space-y-2.5">

          {/* You send */}
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">You send</span>
            <span className="text-slate-200 font-mono">{fmt(sent, 4)} {fromCoin?.ticker?.toUpperCase()}</span>
          </div>

          {/* You receive */}
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">You receive</span>
            <span className="text-emerald-400 font-mono font-bold">{fmt(received, 4)} {toCoin?.ticker?.toUpperCase()}</span>
          </div>

          <div className="border-t border-white/[0.05]" />

          {/* Service fee — our commission */}
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-500">
              Global Gas service fee
              <span className="text-[9px] px-1.5 py-0.5 rounded-full
                bg-red-500/30 border border-red-400/70 text-white font-black">
                {COMMISSION_PCT}%
              </span>
            </span>
            <span className="text-red-300 font-mono font-black">
              {fmt(sent * COMMISSION_PCT / 100, 4)} {fromCoin?.ticker?.toUpperCase()}
            </span>
          </div>

          {/* ChangeNOW + network */}
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">ChangeNOW + network</span>
            <span className={`font-mono ${highGas ? 'text-amber-400' : 'text-slate-400'}`}>
              ~{fmt(networkAndExchangePct, 2)}%{highGas ? ' (ETH gas)' : ''}
            </span>
          </div>

          {/* Total cost */}
          <div className="flex justify-between text-xs font-bold border-t border-white/[0.05] pt-2">
            <span className="text-slate-400">Total cost</span>
            <span className={feeColor}>{fmt(Math.abs(feePct), 2)}% of amount</span>
          </div>

          {/* Gas warning */}
          {highGas && (
            <div className="rounded-lg bg-amber-500/8 border border-amber-500/20 px-3 py-2 text-[10px] text-amber-300 leading-relaxed">
              {isEthFrom
                ? 'Ethereum gas fees are included in this rate. Fees are fixed regardless of amount — larger swaps are more cost-efficient.'
                : 'The destination network (Ethereum) charges gas to receive funds. This is included in the rate shown.'}
              <span className="block mt-1 text-amber-500">Tip: swap larger amounts to lower the % cost.</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── 4-step progress bar ───────────────────────────────────────────────────────

function ProgressBar({ step, failed }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {STEPS.map((label, i) => {
          const done    = !failed && step > i
          const active  = !failed && step === i
          const isError = failed && step === i
          return (
            <div key={label} className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center
                text-xs font-bold transition-all duration-500 border-2
                ${isError  ? 'bg-red-500/35 border-red-400 text-white'
                : done     ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                : active   ? 'bg-red-500/35 border-red-400 text-white ring-2 ring-red-400/50'
                :             'bg-white/[0.03] border-slate-700 text-slate-600'}`}
              >
                {isError  ? <XCircle      size={14} />
                : done    ? <CheckCircle2 size={14} />
                : active  ? <Loader2 size={14} className="animate-spin" />
                :           i + 1}
              </div>
              <span className={`text-[9px] uppercase tracking-wide font-semibold
                ${isError ? 'text-red-300 font-black' : done ? 'text-emerald-400 font-black' : active ? 'text-white font-black' : 'text-slate-600'}`}>
                {label}
              </span>
            </div>
          )
        })}
      </div>
      <div className="relative h-0.5 bg-slate-800 rounded-full mx-3.5 -mt-7 -z-10">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700
            ${failed ? 'bg-red-500' : 'bg-gradient-to-r from-red-500 to-emerald-400'}`}
          style={{ width: `${Math.max(0, Math.min(step / (STEPS.length - 1), 1)) * 100}%` }}
        />
      </div>
    </div>
  )
}

// ── Deposit panel ─────────────────────────────────────────────────────────────

function DepositPanel({ tx, status, step, failed }) {
  return (
    <div className="space-y-5">
      <ProgressBar step={step} failed={failed} />

      {status && (
        <div className={`text-center text-xs font-semibold py-2 rounded-lg border
          ${failed
            ? 'bg-red-500/25 border-red-400/60 text-red-300 font-black'
            : step === 4
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
              : 'bg-red-500/20 border-red-400/50 text-white font-bold'}`}
        >
          {failed ? `Transaction ${status.status}` : step === 4 ? 'Swap complete!' : `Status: ${status.status}…`}
        </div>
      )}

      {step < 4 && !failed && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-4">
          <p className="text-xs text-slate-500 text-center">
            Send exactly{' '}
            <span className="text-white font-bold">
              {tx.amount} {tx.fromTicker?.toUpperCase()}
            </span>{' '}
            to:
          </p>
          <div className="flex justify-center">
            <div className="p-3 bg-white rounded-xl">
              <QRCodeSVG value={tx.payinAddress} size={160} bgColor="#ffffff" fgColor="#020617" level="M" />
            </div>
          </div>
          <div className="rounded-lg bg-slate-900/60 border border-slate-700/60 px-3 py-2.5 flex items-center gap-2">
            <p className="flex-1 text-xs font-mono text-slate-200 break-all leading-relaxed">{tx.payinAddress}</p>
            <CopyButton text={tx.payinAddress} />
          </div>
          <p className="text-[10px] text-slate-600 text-center">
            This address expires — send only once, exact amount only
          </p>
        </div>
      )}

      {step === 4 && !failed && (
        <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/25 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <p className="text-sm font-bold text-emerald-300">Exchange complete</p>
          </div>
          {status?.amountReceive && (
            <p className="text-xs text-slate-400">
              Received:{' '}
              <span className="text-white font-bold">
                {fmt(status.amountReceive)} {tx.toTicker?.toUpperCase()}
              </span>
            </p>
          )}
          <a
            href={`https://changenow.io/exchange/txs/${tx.id}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            View on ChangeNOW <ExternalLink size={10} />
          </a>
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] text-slate-700">
        <span>TX ID: <span className="font-mono">{tx.id?.slice(0, 16)}…</span></span>
        <CopyButton text={tx.id} />
      </div>
    </div>
  )
}

// ── History panel ─────────────────────────────────────────────────────────────

function HistoryPanel({ entries, onClear }) {
  const [expanded, setExpanded] = useState(null)

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-600">
        <History size={32} className="opacity-30" />
        <p className="text-sm">No swaps yet</p>
        <p className="text-xs text-slate-700">Your completed swaps will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-500">{entries.length} swap{entries.length !== 1 ? 's' : ''}</p>
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-rose-400 transition-colors"
        >
          <Trash2 size={11} /> Clear history
        </button>
      </div>

      {entries.map(entry => {
        const isExpanded = expanded === entry.id
        return (
          <div key={entry.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <button
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors text-left"
              onClick={() => setExpanded(isExpanded ? null : entry.id)}
            >
              {/* Coin icons */}
              <div className="flex items-center gap-1 shrink-0">
                <CoinIcon ticker={entry.fromTicker} size={18} />
                <ArrowRight size={10} className="text-slate-600" />
                <CoinIcon ticker={entry.toTicker} size={18} />
              </div>

              {/* Direction labels + amount */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-100 truncate">
                  {fmt(entry.amount, 4)} {entry.fromTicker?.toUpperCase()}
                </p>
                <p className="text-[10px] text-slate-600 truncate">
                  → {entry.toTicker?.toUpperCase()}
                  {entry.estimated ? ` · ≈ ${fmt(entry.estimated, 4)} out` : ''}
                </p>
              </div>

              {/* Status + time */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <StatusBadge status={entry.status} />
                <span className="text-[10px] text-slate-700">{timeAgo(entry.createdAt)}</span>
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-white/[0.05] px-4 py-3 space-y-2.5 bg-black/10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-600">TX ID</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono text-slate-400">{entry.id?.slice(0, 20)}…</span>
                    <CopyButton text={entry.id} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-600">Deposit address</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono text-slate-400">{entry.payinAddress?.slice(0, 14)}…</span>
                    <CopyButton text={entry.payinAddress} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-600">Created</span>
                  <span className="text-[10px] text-slate-400">{new Date(entry.createdAt).toLocaleString()}</span>
                </div>
                <a
                  href={`https://changenow.io/exchange/txs/${entry.id}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] text-red-400 hover:text-red-300 transition-colors pt-0.5"
                >
                  Track on ChangeNOW <ExternalLink size={10} />
                </a>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Main SwapCard ─────────────────────────────────────────────────────────────

export default function SwapCard() {
  const [tab,      setTab]      = useState('swap')
  const [history,  setHistory]  = useState(() => loadHistory())

  // Currency list
  const [currencies,  setCurrencies]  = useState([])
  const [currLoading, setCurrLoading] = useState(true)

  // Selected coins (full coin objects)
  const [fromCoin, setFromCoin] = useState(null)
  const [toCoin,   setToCoin]   = useState(null)

  const [amount,     setAmount]     = useState('')
  const [address,    setAddress]    = useState('')
  const [refund,     setRefund]     = useState('')
  const [showRefund, setShowRefund] = useState(false)
  const [minAmount,  setMinAmount]  = useState(null)
  const [estimate,   setEstimate]   = useState(null)
  const [estLoading, setEstLoading] = useState(false)
  const [swapping,   setSwapping]   = useState(false)
  const [error,      setError]      = useState(null)

  // Post-swap state
  const [tx,     setTx]     = useState(null)
  const [status, setStatus] = useState(null)
  const [step,   setStep]   = useState(0)
  const [failed, setFailed] = useState(false)

  const debounceRef = useRef(null)
  const pollRef     = useRef(null)

  // ── Load currencies once ─────────────────────────────────────────────────────
  useEffect(() => {
    fetchCurrencies()
      .then(list => {
        setCurrencies(list)
        const find = t => list.find(c => c.ticker === t)
        setFromCoin(find('btc') ?? list[0] ?? null)
        setToCoin(find('eth')   ?? list[1] ?? null)
      })
      .catch(() => {})
      .finally(() => setCurrLoading(false))
  }, [])

  // ── Min amount on pair change ────────────────────────────────────────────────
  useEffect(() => {
    setEstimate(null)
    if (!fromCoin || !toCoin) return
    fetchMinAmount(fromCoin.ticker, toCoin.ticker)
      .then(min => setMinAmount(Number(min)))
      .catch(() => setMinAmount(null))
  }, [fromCoin, toCoin])

  // ── Debounced estimate ───────────────────────────────────────────────────────
  useEffect(() => {
    const num = parseFloat(amount)
    if (!num || num <= 0 || !fromCoin || !toCoin) { setEstimate(null); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setEstLoading(true); setError(null)
      try {
        const result = await fetchEstimate(num, fromCoin.ticker, toCoin.ticker)
        setEstimate(result)
      } catch (e) {
        setEstimate(null)
        setError(e?.response?.data?.message ?? 'Could not fetch estimate')
      } finally { setEstLoading(false) }
    }, 600)
    return () => clearTimeout(debounceRef.current)
  }, [amount, fromCoin, toCoin])

  // ── Status polling ───────────────────────────────────────────────────────────
  const pollStatus = useCallback(async (txId) => {
    try {
      const s = await fetchSwapStatus(txId)
      setStatus(s)
      const newStep = STATUS_STEP[s.status] ?? 0
      if (newStep >= 0) setStep(newStep)
      if (newStep < 0)  { setFailed(true); clearInterval(pollRef.current) }
      if (s.status === 'finished') clearInterval(pollRef.current)
      updateHistoryStatus(txId, s.status)
      setHistory(loadHistory())
    } catch { /* keep polling */ }
  }, [])

  useEffect(() => {
    if (!tx) return
    pollStatus(tx.id)
    pollRef.current = setInterval(() => pollStatus(tx.id), 20_000)
    return () => clearInterval(pollRef.current)
  }, [tx, pollStatus])

  // ── Actions ──────────────────────────────────────────────────────────────────
  function handleFlip() {
    setFromCoin(toCoin); setToCoin(fromCoin)
    setEstimate(null); setError(null)
  }

  function handleFromChange(coin) {
    setFromCoin(coin); setEstimate(null); setError(null)
  }
  function handleToChange(coin) {
    setToCoin(coin); setEstimate(null); setError(null)
  }

  async function handleSwap() {
    const num = parseFloat(amount)
    if (!num || num <= 0)             { setError('Enter a valid amount'); return }
    if (!address.trim())              { setError('Enter your receiving address'); return }
    if (minAmount && num < minAmount) { setError(`Minimum is ${minAmount} ${fromCoin?.ticker?.toUpperCase()}`); return }

    setSwapping(true); setError(null)
    try {
      const result = await createSwap({
        from         : fromCoin.ticker,
        to           : toCoin.ticker,
        address      : address.trim(),
        amount       : num,
        refundAddress: refund.trim() || undefined,
      })
      result.fromTicker = fromCoin.ticker
      result.toTicker   = toCoin.ticker
      setTx(result); setStep(0); setFailed(false)
      addHistoryEntry(result, fromCoin, toCoin)
      setHistory(loadHistory())
    } catch (e) {
      setError(e?.response?.data?.message ?? 'Swap creation failed — check address and try again')
    } finally { setSwapping(false) }
  }

  function handleReset() {
    clearInterval(pollRef.current)
    setTx(null); setStatus(null); setStep(0); setFailed(false)
    setAmount(''); setAddress(''); setRefund('')
    setEstimate(null); setError(null)
  }

  function handleClearHistory() { persistHistory([]); setHistory([]) }

  const numAmount = parseFloat(amount) || 0
  const belowMin  = minAmount && numAmount > 0 && numAmount < minAmount

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="glass-card p-6 space-y-5 relative overflow-hidden">
      {/* Neon bleed */}
      <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-red-600/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-red-700/20 blur-3xl" />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-red-500/25 border border-red-500/60">
              <ArrowUpDown size={14} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Cross-Chain Swap</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {currencies.length > 0 ? `${currencies.length} coins · ` : ''}Powered by ChangeNOW
              </p>
            </div>
          </div>
          {tx && tab === 'swap' && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300
                bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 rounded-lg transition-all"
            >
              <RefreshCw size={11} /> New Swap
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
          {[
            { key: 'swap',    label: 'Swap' },
            { key: 'history', label: `History${history.length ? ` (${history.length})` : ''}` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${tab === t.key
                  ? 'bg-red-500/30 border border-red-400/70 text-white font-black'
                  : 'text-slate-500 hover:text-slate-300'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Swap form ── */}
      {tab === 'swap' && !tx && (
        <div className="space-y-4">

          {/* From selector */}
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-widest text-slate-600 pl-1">From</p>
            <CoinSelector
              value={fromCoin?.ticker}
              onChange={handleFromChange}
              currencies={currencies}
              excludeTicker={toCoin?.ticker}
              loading={currLoading}
            />
          </div>

          {/* Amount input */}
          <div className="space-y-1.5">
            <div className="relative">
              <input
                type="number" min="0" step="any"
                value={amount}
                onChange={e => { setAmount(e.target.value); setError(null) }}
                placeholder="Amount to send"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl
                  pl-4 pr-24 py-3.5 text-sm text-slate-100 placeholder-slate-600
                  focus:outline-none focus:ring-2 focus:ring-red-500/70
                  focus:border-red-500/80 transition-all"
              />
              {fromCoin && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2
                  text-xs font-mono font-bold text-slate-500 truncate max-w-[72px]">
                  {fromCoin.ticker.toUpperCase()}
                </span>
              )}
            </div>
            {minAmount && (
              <p className={`text-[11px] pl-1 ${belowMin ? 'text-rose-400' : 'text-slate-600'}`}>
                Minimum: {minAmount} {fromCoin?.ticker?.toUpperCase()}
              </p>
            )}
          </div>

          {/* Swap direction button */}
          <div className="flex justify-center -my-1">
            <button
              onClick={handleFlip}
              className="flex items-center justify-center w-9 h-9 rounded-full
                bg-white/[0.05] border border-white/[0.10] text-slate-400
                hover:bg-red-500/25 hover:border-red-400/70 hover:text-white
                active:scale-90 transition-all"
            >
              <ArrowUpDown size={15} />
            </button>
          </div>

          {/* To selector */}
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-widest text-slate-600 pl-1">To</p>
            <CoinSelector
              value={toCoin?.ticker}
              onChange={handleToChange}
              currencies={currencies}
              excludeTicker={fromCoin?.ticker}
              loading={currLoading}
            />
          </div>

          {/* Estimate */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3
            flex items-center justify-between min-h-[52px]">
            <p className="text-xs text-slate-500">You will receive</p>
            {estLoading ? (
              <Loader2 size={14} className="animate-spin text-slate-600" />
            ) : estimate?.estimatedAmount ? (
              <div className="text-right">
                <p className="text-sm font-black text-emerald-400">
                  {fmt(estimate.estimatedAmount)} {toCoin?.ticker?.toUpperCase()}
                </p>
                <p className="text-[10px] text-slate-600">{toCoin?.name}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-700">Enter amount above</p>
            )}
          </div>

          {/* Fee breakdown */}
          <FeeBreakdown
            amount={amount}
            estimate={estimate}
            fromCoin={fromCoin}
            toCoin={toCoin}
          />

          {/* Receiving address */}
          <div className="space-y-2">
            <label className="text-xs text-slate-500">
              Your {toCoin?.name ?? 'receiving'} address
            </label>
            <input
              type="text" value={address} spellCheck={false}
              onChange={e => { setAddress(e.target.value); setError(null) }}
              placeholder={`${toCoin?.ticker?.toUpperCase() ?? 'Coin'} address`}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl
                px-4 py-3 text-sm font-mono text-slate-100 placeholder-slate-600
                focus:outline-none focus:ring-2 focus:ring-red-500/70
                focus:border-red-500/80 transition-all"
            />
          </div>

          {/* Refund address */}
          <button
            onClick={() => setShowRefund(r => !r)}
            className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors"
          >
            {showRefund ? '− Hide' : '+ Add'} refund address (optional)
          </button>
          {showRefund && (
            <input
              type="text" value={refund} spellCheck={false}
              onChange={e => setRefund(e.target.value)}
              placeholder={`Refund address (${fromCoin?.ticker?.toUpperCase() ?? 'source'} network)`}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl
                px-4 py-3 text-sm font-mono text-slate-100 placeholder-slate-600
                focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all"
            />
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-400
              bg-rose-400/8 border border-rose-400/20 rounded-lg px-3 py-2.5">
              <AlertCircle size={13} className="shrink-0" /> {error}
            </div>
          )}

          {/* Swap button */}
          <button
            onClick={handleSwap}
            disabled={swapping || !amount || !address || belowMin || !fromCoin || !toCoin}
            className="w-full py-3.5 rounded-xl text-sm font-bold transition-all
              bg-gradient-to-r from-red-500 to-red-600
              hover:from-red-400 hover:to-red-500
              disabled:opacity-40 disabled:cursor-not-allowed
              active:scale-[0.98] text-white shadow-lg shadow-red-600/50"
          >
            {swapping ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={15} className="animate-spin" /> Creating swap…
              </span>
            ) : (
              `Swap ${amount || '—'} ${fromCoin?.ticker?.toUpperCase() ?? '?'} → ${toCoin?.ticker?.toUpperCase() ?? '?'}`
            )}
          </button>

          <p className="text-[10px] text-slate-700 text-center">
            Rates by ChangeNOW · Non-custodial · Network fees apply
          </p>
        </div>
      )}

      {/* ── Deposit panel ── */}
      {tab === 'swap' && tx && (
        <DepositPanel tx={tx} status={status} step={step} failed={failed} />
      )}

      {/* ── History tab ── */}
      {tab === 'history' && (
        <HistoryPanel entries={history} onClear={handleClearHistory} />
      )}
    </div>
  )
}
