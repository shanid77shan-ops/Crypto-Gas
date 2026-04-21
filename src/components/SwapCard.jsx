import { useState, useEffect, useRef, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  ArrowUpDown, Copy, CheckCheck, Loader2,
  AlertCircle, CheckCircle2, XCircle, RefreshCw, ExternalLink,
} from 'lucide-react'
import {
  PAIRS, PAIR_LABELS, STEPS, STATUS_STEP,
  fetchEstimate, fetchMinAmount, createSwap, fetchSwapStatus,
} from '../lib/SwapProvider'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n, d = 4) {
  if (n == null) return '—'
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: d })
}

// ── Copy button ───────────────────────────────────────────────────────────────

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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
              {/* Node */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center
                text-xs font-bold transition-all duration-500 border-2
                ${isError  ? 'bg-red-500/20 border-red-500 text-red-400'
                : done     ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                : active   ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 ring-2 ring-indigo-500/30'
                :             'bg-white/[0.03] border-slate-700 text-slate-600'}`}
              >
                {isError  ? <XCircle     size={14} />
                : done    ? <CheckCircle2 size={14} />
                : active  ? <Loader2 size={14} className="animate-spin" />
                :           i + 1}
              </div>
              {/* Label */}
              <span className={`text-[9px] uppercase tracking-wide font-semibold
                ${isError ? 'text-red-400' : done ? 'text-emerald-400' : active ? 'text-indigo-300' : 'text-slate-600'}`}>
                {label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Connector line */}
      <div className="relative h-0.5 bg-slate-800 rounded-full mx-3.5 -mt-7 -z-10">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700
            ${failed ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-400'}`}
          style={{ width: `${Math.max(0, Math.min(step / (STEPS.length - 1), 1)) * 100}%` }}
        />
      </div>
    </div>
  )
}

// ── Deposit panel (shown after swap created) ──────────────────────────────────

function DepositPanel({ tx, status, step, failed }) {
  const explorerBase = tx.fromCurrency === PAIRS.TRC20
    ? 'https://tronscan.org/#/transaction/'
    : 'https://etherscan.io/tx/'

  return (
    <div className="space-y-5">
      {/* Progress */}
      <ProgressBar step={step} failed={failed} />

      {/* Status badge */}
      {status && (
        <div className={`text-center text-xs font-semibold py-2 rounded-lg border
          ${failed
            ? 'bg-red-500/10 border-red-500/25 text-red-400'
            : step === 4
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
              : 'bg-indigo-500/10 border-indigo-500/25 text-indigo-300'}`}
        >
          {failed ? `Transaction ${status.status}` : step === 4 ? 'Swap complete!' : `Status: ${status.status}…`}
        </div>
      )}

      {/* QR + deposit address */}
      {step < 4 && !failed && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-4">
          <p className="text-xs text-slate-500 text-center">
            Send exactly <span className="text-white font-bold">{tx.amount} {PAIR_LABELS[tx.fromCurrency]?.short}</span> to:
          </p>

          {/* QR code */}
          <div className="flex justify-center">
            <div className="p-3 bg-white rounded-xl">
              <QRCodeSVG
                value={tx.payinAddress}
                size={160}
                bgColor="#ffffff"
                fgColor="#020617"
                level="M"
              />
            </div>
          </div>

          {/* Address */}
          <div className="rounded-lg bg-slate-900/60 border border-slate-700/60 px-3 py-2.5
            flex items-center gap-2">
            <p className="flex-1 text-xs font-mono text-slate-200 break-all leading-relaxed">
              {tx.payinAddress}
            </p>
            <CopyButton text={tx.payinAddress} />
          </div>

          <p className="text-[10px] text-slate-600 text-center">
            This address expires — send only once, exact amount only
          </p>
        </div>
      )}

      {/* Success summary */}
      {step === 4 && !failed && (
        <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/25 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <p className="text-sm font-bold text-emerald-300">Exchange complete</p>
          </div>
          {status?.amountReceive && (
            <p className="text-xs text-slate-400">
              Received:&nbsp;
              <span className="text-white font-bold">{fmt(status.amountReceive)} {PAIR_LABELS[tx.toCurrency]?.short}</span>
            </p>
          )}
          {status?.payoutHash && (
            <a
              href={`${explorerBase}${status.payoutHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View on explorer <ExternalLink size={10} />
            </a>
          )}
        </div>
      )}

      {/* TX ID reference */}
      <div className="flex items-center justify-between text-[10px] text-slate-700">
        <span>TX ID: <span className="font-mono">{tx.id?.slice(0, 16)}…</span></span>
        <CopyButton text={tx.id} />
      </div>
    </div>
  )
}

// ── Main SwapCard ─────────────────────────────────────────────────────────────

export default function SwapCard() {
  const [fromPair,   setFromPair]   = useState(PAIRS.TRC20)
  const [toPair,     setToPair]     = useState(PAIRS.ERC20)
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
  const [tx,     setTx]     = useState(null)  // ChangeNOW tx object
  const [status, setStatus] = useState(null)  // latest status object
  const [step,   setStep]   = useState(0)
  const [failed, setFailed] = useState(false)

  const debounceRef = useRef(null)
  const pollRef     = useRef(null)

  // ── Load min amount on direction change ─────────────────────────────────────
  useEffect(() => {
    setEstimate(null)
    fetchMinAmount(fromPair, toPair)
      .then(min => setMinAmount(Number(min)))
      .catch(() => setMinAmount(null))
  }, [fromPair, toPair])

  // ── Debounced live estimate ──────────────────────────────────────────────────
  useEffect(() => {
    const num = parseFloat(amount)
    if (!num || num <= 0) { setEstimate(null); return }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setEstLoading(true)
      setError(null)
      try {
        const result = await fetchEstimate(num, fromPair, toPair)
        setEstimate(result)
      } catch (e) {
        setEstimate(null)
        setError(e?.response?.data?.message ?? 'Could not fetch estimate')
      } finally {
        setEstLoading(false)
      }
    }, 600)

    return () => clearTimeout(debounceRef.current)
  }, [amount, fromPair, toPair])

  // ── Status polling (every 20s) ───────────────────────────────────────────────
  const pollStatus = useCallback(async (txId) => {
    try {
      const s = await fetchSwapStatus(txId)
      setStatus(s)
      const newStep = STATUS_STEP[s.status] ?? 0
      if (newStep >= 0) setStep(newStep)
      if (newStep < 0) { setFailed(true); clearInterval(pollRef.current) }
      if (s.status === 'finished') clearInterval(pollRef.current)
    } catch { /* keep polling */ }
  }, [])

  useEffect(() => {
    if (!tx) return
    pollStatus(tx.id)
    pollRef.current = setInterval(() => pollStatus(tx.id), 20_000)
    return () => clearInterval(pollRef.current)
  }, [tx, pollStatus])

  // ── Flip direction ───────────────────────────────────────────────────────────
  function handleFlip() {
    setFromPair(toPair)
    setToPair(fromPair)
    setEstimate(null)
    setError(null)
  }

  // ── Create swap ──────────────────────────────────────────────────────────────
  async function handleSwap() {
    const num = parseFloat(amount)
    if (!num || num <= 0)    { setError('Enter a valid amount'); return }
    if (!address.trim())     { setError('Enter your receiving address'); return }
    if (minAmount && num < minAmount) {
      setError(`Minimum is ${minAmount} USDT`)
      return
    }

    setSwapping(true)
    setError(null)
    try {
      const result = await createSwap({
        from          : fromPair,
        to            : toPair,
        address       : address.trim(),
        amount        : num,
        refundAddress : refund.trim() || undefined,
      })
      setTx(result)
      setStep(0)
      setFailed(false)
    } catch (e) {
      setError(e?.response?.data?.message ?? 'Swap creation failed — check your API key and address')
    } finally {
      setSwapping(false)
    }
  }

  function handleReset() {
    clearInterval(pollRef.current)
    setTx(null); setStatus(null); setStep(0); setFailed(false)
    setAmount(''); setAddress(''); setRefund('')
    setEstimate(null); setError(null)
  }

  const fromLabel = PAIR_LABELS[fromPair]
  const toLabel   = PAIR_LABELS[toPair]
  const numAmount = parseFloat(amount) || 0
  const belowMin  = minAmount && numAmount > 0 && numAmount < minAmount

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="glass-card p-6 space-y-6 relative overflow-hidden">
      {/* Neon bleed */}
      <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64
        rounded-full bg-violet-600/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 w-64 h-64
        rounded-full bg-cyan-600/8 blur-3xl" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-violet-500/15 border border-violet-500/25">
            <ArrowUpDown size={14} className="text-violet-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">USDT Cross-Chain Swap</h2>
            <p className="text-xs text-slate-500 mt-0.5">TRC-20 ↔ ERC-20 · Powered by ChangeNOW</p>
          </div>
        </div>
        {tx && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300
              bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 rounded-lg transition-all"
          >
            <RefreshCw size={11} /> New Swap
          </button>
        )}
      </div>

      {/* ── Pre-swap form ── */}
      {!tx && (
        <div className="space-y-4">

          {/* From / Flip / To */}
          <div className="grid grid-cols-[1fr_36px_1fr] items-center gap-2">
            {/* From */}
            <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] p-3 space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-slate-600">From</p>
              <p className={`text-sm font-bold ${fromLabel.color}`}>{fromLabel.short}</p>
              <p className="text-[10px] text-slate-600">{fromLabel.network}</p>
            </div>

            {/* Flip */}
            <button
              onClick={handleFlip}
              className="mx-auto flex items-center justify-center w-8 h-8 rounded-full
                bg-white/[0.05] border border-white/[0.10] text-slate-400
                hover:bg-violet-600/20 hover:border-violet-500/40 hover:text-violet-300
                active:scale-90 transition-all"
            >
              <ArrowUpDown size={14} />
            </button>

            {/* To */}
            <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] p-3 space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-slate-600">To</p>
              <p className={`text-sm font-bold ${toLabel.color}`}>{toLabel.short}</p>
              <p className="text-[10px] text-slate-600">{toLabel.network}</p>
            </div>
          </div>

          {/* Amount input */}
          <div className="space-y-1.5">
            <div className="relative">
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={e => { setAmount(e.target.value); setError(null) }}
                placeholder="Amount to swap"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl
                  pl-4 pr-20 py-3.5 text-sm text-slate-100 placeholder-slate-600
                  focus:outline-none focus:ring-2 focus:ring-violet-500/60
                  focus:border-violet-500/40 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2
                text-xs font-mono font-bold text-slate-500">
                USDT
              </span>
            </div>
            {minAmount && (
              <p className={`text-[11px] ${belowMin ? 'text-rose-400' : 'text-slate-600'}`}>
                Minimum: {minAmount} USDT
              </p>
            )}
          </div>

          {/* Live estimate */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3
            flex items-center justify-between min-h-[52px]">
            <p className="text-xs text-slate-500">You will receive</p>
            {estLoading ? (
              <Loader2 size={14} className="animate-spin text-slate-600" />
            ) : estimate ? (
              <div className="text-right">
                <p className="text-sm font-black text-emerald-400">
                  {fmt(estimate.estimatedAmount)} USDT
                </p>
                <p className="text-[10px] text-slate-600">{toLabel.short}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-700">Enter amount above</p>
            )}
          </div>

          {/* Receiving address */}
          <div className="space-y-2">
            <label className="text-xs text-slate-500">
              Your {toLabel.network} receiving address
            </label>
            <input
              type="text"
              value={address}
              onChange={e => { setAddress(e.target.value); setError(null) }}
              placeholder={toLabel.network === 'TRON' ? 'T… (TRON address)' : '0x… (Ethereum address)'}
              spellCheck={false}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl
                px-4 py-3 text-sm font-mono text-slate-100 placeholder-slate-600
                focus:outline-none focus:ring-2 focus:ring-violet-500/60
                focus:border-violet-500/40 transition-all"
            />
          </div>

          {/* Optional refund address toggle */}
          <button
            onClick={() => setShowRefund(r => !r)}
            className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors"
          >
            {showRefund ? '− Hide' : '+ Add'} refund address (optional)
          </button>
          {showRefund && (
            <input
              type="text"
              value={refund}
              onChange={e => setRefund(e.target.value)}
              placeholder="Refund address (same network as source)"
              spellCheck={false}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl
                px-4 py-3 text-sm font-mono text-slate-100 placeholder-slate-600
                focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
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
            disabled={swapping || !amount || !address || belowMin}
            className="w-full py-3.5 rounded-xl text-sm font-bold transition-all
              bg-gradient-to-r from-violet-600 to-indigo-600
              hover:from-violet-500 hover:to-indigo-500
              disabled:opacity-40 disabled:cursor-not-allowed
              active:scale-[0.98] text-white shadow-lg shadow-violet-900/30"
          >
            {swapping ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={15} className="animate-spin" /> Creating swap…
              </span>
            ) : (
              `Swap ${amount || '—'} USDT ${fromLabel.short} → ${toLabel.short}`
            )}
          </button>

          {/* Disclaimer */}
          <p className="text-[10px] text-slate-700 text-center">
            Rates provided by ChangeNOW · No custody of funds · Min. network fees apply
          </p>
        </div>
      )}

      {/* ── Post-swap deposit panel ── */}
      {tx && (
        <DepositPanel
          tx={tx}
          status={status}
          step={step}
          failed={failed}
        />
      )}
    </div>
  )
}
