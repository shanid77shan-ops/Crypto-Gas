import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { useWalletBalances } from '../hooks/useWalletBalances'
import BalanceCard from './BalanceCard'
import { isEvmAddress, isTronAddress } from '../lib/chains'

export default function WalletLookup() {
  const [input, setInput] = useState('')
  const { balances, loading, queried, fetchBalances } = useWalletBalances()

  const isValid = isEvmAddress(input) || isTronAddress(input)

  function handleSubmit(e) {
    e.preventDefault()
    if (isValid) fetchBalances(input.trim())
  }

  const hint =
    input.length > 0 && !isValid   ? 'Enter a valid EVM address (0x…) or TRON address (T…)'
    : input.startsWith('0x')       ? 'EVM address — will query Ethereum & BNB Chain'
    : input.startsWith('T')        ? 'TRON address — will query TRON network'
    : null

  const hintColor = isValid ? 'text-indigo-400' : 'text-amber-400'

  return (
    <div className="space-y-5">
      {/* ── Search card ──────────────────────────────────────────────────── */}
      <div className="glass-card p-6 space-y-4">

        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Multi-Chain USDT Lookup
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            One-shot query — EVM (0x…) or TRON (T…) address
          </p>
        </div>

        {/* Input + button row — stacks to column on mobile */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none"
            />
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="0x… or T…"
              spellCheck={false}
              className="w-full bg-slate-800/50 border border-slate-700/60 rounded-xl
                pl-9 pr-4 py-3 text-sm font-mono text-slate-100 placeholder-slate-600
                focus:outline-none focus:ring-2 focus:ring-indigo-500/50
                focus:border-indigo-500/40 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!isValid || loading}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl
              font-semibold text-sm transition-all whitespace-nowrap
              bg-indigo-600 hover:bg-indigo-500 text-white
              disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin" /> Fetching…</>
            ) : (
              'Check Balances'
            )}
          </button>
        </form>

        {hint && (
          <p className={`text-xs ${hintColor}`}>{hint}</p>
        )}
      </div>

      {/* ── Balance cards grid ────────────────────────────────────────────
           Mobile : 1 column (stacks)
           ≥640 px: 3 columns side-by-side                               */}
      {queried && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {['ethereum', 'bsc', 'tron'].map(chainId => (
            <BalanceCard
              key={chainId}
              chainId={chainId}
              data={balances[chainId] ?? (loading ? null : { balance: null, status: 'unknown' })}
            />
          ))}
        </div>
      )}

      {!queried && (
        <div className="glass-card py-12 flex flex-col items-center gap-3 text-center">
          <span className="text-4xl">🔍</span>
          <p className="text-sm text-slate-600">
            Enter a wallet address above to see USDT balances across chains
          </p>
        </div>
      )}
    </div>
  )
}
