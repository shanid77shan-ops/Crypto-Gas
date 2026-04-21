import { useState } from 'react'
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

  const hint = input.length > 0 && !isValid
    ? 'Enter a valid EVM address (0x…) or TRON address (T…)'
    : input.startsWith('0x')
    ? 'EVM address — will query Ethereum & BNB Chain'
    : input.startsWith('T')
    ? 'TRON address — will query TRON network'
    : null

  return (
    <div className="space-y-6">
      <div className="card-glass p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
            Multi-Chain USDT Lookup
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            Paste any EVM (0x…) or TRON (T…) wallet address
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="0x… or T…"
            spellCheck={false}
            className="flex-1 bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3
              text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500
              focus:border-transparent transition-all font-mono"
          />
          <button
            type="submit"
            disabled={!isValid || loading}
            className="px-6 py-3 rounded-xl font-semibold text-sm transition-all
              bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed
              active:scale-95 whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Fetching…
              </span>
            ) : 'Check Balances'}
          </button>
        </form>

        {hint && (
          <p className={`text-xs ${isValid ? 'text-indigo-400' : 'text-amber-400'}`}>
            {hint}
          </p>
        )}
      </div>

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
        <div className="text-center py-10 text-gray-700">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">Enter a wallet address above to see USDT balances</p>
        </div>
      )}
    </div>
  )
}
