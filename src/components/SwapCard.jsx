import { useState, useCallback } from 'react'
import {
  ArrowLeftRight, ChevronDown, Loader2, Repeat2,
  AlertCircle, Layers,
} from 'lucide-react'
import {
  BRIDGE_CHAINS, BRIDGE_TOKENS,
  getTokensForChain, fetchBridgeQuote,
} from '../lib/bridgeService'
import FeeBreakdown from './FeeBreakdown'

// ── Chain selector pill ───────────────────────────────────────────────────────

function ChainTokenSelect({ label, chainKey, tokenKey, onChainChange, onTokenChange, availableTokens }) {
  const chain = BRIDGE_CHAINS[chainKey]
  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-widest text-slate-600">{label}</p>

      {/* Chain dropdown */}
      <div className="relative">
        <select
          value={chainKey}
          onChange={e => onChainChange(e.target.value)}
          className="w-full appearance-none rounded-xl bg-white/[0.05] border border-white/[0.08]
            pl-10 pr-8 py-3 text-sm font-semibold text-slate-100
            focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
        >
          {Object.values(BRIDGE_CHAINS).map(c => (
            <option key={c.key} value={c.key} className="bg-slate-900">
              {c.name}
            </option>
          ))}
        </select>
        {/* Chain icon */}
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base">
          {chain.icon}
        </span>
        <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-600" />
      </div>

      {/* Token dropdown */}
      <div className="relative">
        <select
          value={tokenKey}
          onChange={e => onTokenChange(e.target.value)}
          className="w-full appearance-none rounded-xl bg-white/[0.05] border border-white/[0.08]
            px-4 pr-8 py-2.5 text-sm font-mono text-indigo-300
            focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
        >
          {availableTokens.map(t => (
            <option key={t} value={t} className="bg-slate-900 font-mono">{t}</option>
          ))}
        </select>
        <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-600" />
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SwapCard() {
  const [fromChain, setFromChain] = useState('ETH')
  const [toChain,   setToChain]   = useState('ARB')
  const [fromToken, setFromToken] = useState('USDT')
  const [toToken,   setToToken]   = useState('USDT')
  const [amount,    setAmount]    = useState('')
  const [quote,     setQuote]     = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [flipping,  setFlipping]  = useState(false)

  // Keep token valid whenever chain changes
  function handleFromChainChange(chainKey) {
    setFromChain(chainKey)
    const tokens = getTokensForChain(chainKey)
    if (!tokens.includes(fromToken)) setFromToken(tokens[0] ?? 'USDT')
    setQuote(null)
    setError(null)
  }

  function handleToChainChange(chainKey) {
    setToChain(chainKey)
    const tokens = getTokensForChain(chainKey)
    if (!tokens.includes(toToken)) setToToken(tokens[0] ?? 'USDT')
    setQuote(null)
    setError(null)
  }

  // Animated flip
  function handleFlip() {
    setFlipping(true)
    setTimeout(() => {
      setFromChain(toChain)
      setToChain(fromChain)
      setFromToken(toToken)
      setToToken(fromToken)
      setQuote(null)
      setError(null)
      setFlipping(false)
    }, 200)
  }

  const handleGetQuote = useCallback(async () => {
    const num = parseFloat(amount)
    if (!num || num <= 0) { setError('Enter a valid amount'); return }
    if (fromChain === toChain) { setError('Source and destination must differ'); return }

    setLoading(true)
    setError(null)
    setQuote(null)

    try {
      const q = await fetchBridgeQuote({ fromChain, toChain, fromToken, toToken, amount })
      setQuote(q)
    } catch (err) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Quote failed — try a different route')
    } finally {
      setLoading(false)
    }
  }, [fromChain, toChain, fromToken, toToken, amount])

  const fromTokens = getTokensForChain(fromChain)
  const toTokens   = getTokensForChain(toChain)
  const srcChain   = BRIDGE_CHAINS[fromChain]
  const dstChain   = BRIDGE_CHAINS[toChain]

  return (
    <div className="glass-card p-6 space-y-6 relative overflow-hidden">
      {/* Neon bleed */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64
        rounded-full bg-indigo-600/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-64 h-64
        rounded-full bg-violet-600/8 blur-3xl" />

      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/25">
          <Layers size={14} className="text-indigo-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-100">Bridge Estimator</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Cross-chain fee preview — powered by LI.FI
          </p>
        </div>
      </div>

      {/* From / Flip / To row */}
      <div className="grid grid-cols-[1fr_40px_1fr] items-end gap-3">
        <ChainTokenSelect
          label="From"
          chainKey={fromChain}
          tokenKey={fromToken}
          onChainChange={handleFromChainChange}
          onTokenChange={t => { setFromToken(t); setQuote(null); setError(null) }}
          availableTokens={fromTokens}
        />

        {/* Flip button */}
        <div className="flex justify-center pb-1">
          <button
            onClick={handleFlip}
            disabled={loading}
            className={`p-2.5 rounded-full border transition-all
              bg-white/[0.05] border-white/[0.10] text-slate-400
              hover:bg-indigo-600/20 hover:border-indigo-500/40 hover:text-indigo-300
              active:scale-90 disabled:opacity-40
              ${flipping ? 'rotate-180 opacity-50' : ''}`}
            style={{ transition: 'transform 0.2s, opacity 0.2s' }}
            title="Swap direction"
          >
            <Repeat2 size={16} />
          </button>
        </div>

        <ChainTokenSelect
          label="To"
          chainKey={toChain}
          tokenKey={toToken}
          onChainChange={handleToChainChange}
          onTokenChange={t => { setToToken(t); setQuote(null); setError(null) }}
          availableTokens={toTokens}
        />
      </div>

      {/* Route summary pill */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
        <span className="font-medium text-slate-300">{srcChain.icon} {srcChain.shortName}</span>
        <ArrowLeftRight size={12} className="text-slate-700" />
        <span className="font-medium text-slate-300">{dstChain.icon} {dstChain.shortName}</span>
        <span className="mx-1 text-slate-700">·</span>
        <span className="font-mono text-indigo-400">{fromToken} → {toToken}</span>
      </div>

      {/* Amount input */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
          {BRIDGE_TOKENS[fromToken]?.symbol ?? fromToken}
        </span>
        <input
          type="number"
          min="0"
          step="any"
          value={amount}
          onChange={e => { setAmount(e.target.value); setQuote(null); setError(null) }}
          placeholder="Amount to bridge"
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl
            pl-16 pr-4 py-3.5 text-sm text-slate-100 placeholder-slate-600
            focus:outline-none focus:ring-2 focus:ring-indigo-500/60
            focus:border-indigo-500/40 transition-all"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-400
          bg-rose-400/8 border border-rose-400/20 rounded-lg px-3 py-2.5">
          <AlertCircle size={13} className="shrink-0" /> {error}
        </div>
      )}

      {/* Get Quote button */}
      <button
        onClick={handleGetQuote}
        disabled={loading || !amount}
        className="w-full py-3.5 rounded-xl text-sm font-bold transition-all
          bg-gradient-to-r from-indigo-600 to-violet-600
          hover:from-indigo-500 hover:to-violet-500
          disabled:opacity-40 disabled:cursor-not-allowed
          active:scale-[0.98] text-white shadow-lg shadow-indigo-900/30"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={15} className="animate-spin" /> Fetching route…
          </span>
        ) : (
          'Get Bridge Quote'
        )}
      </button>

      {/* Loading pulse skeleton */}
      {loading && (
        <div className="space-y-3 animate-pulse">
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 rounded-xl bg-white/[0.04]" />
            <div className="h-20 rounded-xl bg-white/[0.04]" />
          </div>
          <div className="h-32 rounded-xl bg-white/[0.04]" />
        </div>
      )}

      {/* Fee breakdown */}
      {!loading && quote && (
        <div className="border-t border-white/[0.05] pt-5">
          <FeeBreakdown quote={quote} />
        </div>
      )}
    </div>
  )
}
