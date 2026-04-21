/**
 * WatchedWallet — Rule 3: shows USDT balances for a single watched address.
 * Fetches data lazily (on demand) to avoid hammering APIs on page load.
 * No wallet connect required — read-only.
 */

import { useState, useCallback } from 'react'
import { RefreshCw, Trash2, Edit2, Check, X, ExternalLink, Eye } from 'lucide-react'
import { CHAINS, isEvmAddress, isTronAddress } from '../lib/chains'
import { fetchEvmUsdtBalance, fetchTronUsdtBalance } from '../hooks/useWalletBalances'
import { shortenAddress } from '../hooks/useWatchlist'

// ── Chain pill ────────────────────────────────────────────────────────────────

function ChainBadge({ chain, data, loading }) {
  const { name, icon, gradient, border } = CHAINS[chain]
  const { balance, status } = data ?? {}

  const valueStr =
    loading                   ? null
    : status === 'ok'         ? `$${balance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : status === 'incompatible' ? '—'
    : status === 'error'      ? 'err'
    :                           '…'

  return (
    <div className={`flex-1 min-w-0 rounded-xl border ${border} bg-white/[0.025] p-3 space-y-1`}>
      <div className="flex items-center gap-1.5">
        <span className="text-sm">{icon}</span>
        <span className="text-[10px] text-gray-500 truncate">{name}</span>
      </div>
      {loading ? (
        <div className="h-4 w-14 rounded bg-white/5 animate-pulse" />
      ) : (
        <p className={`text-sm font-bold tabular-nums
          ${status === 'ok' ? 'text-white' : 'text-gray-700'}`}>
          {valueStr}
          {status === 'ok' && (
            <span className="text-[9px] text-gray-600 font-normal ml-1">USDT</span>
          )}
        </p>
      )}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function WatchedWallet({ entry, onRemove, onLabelUpdate }) {
  const { id, address, label, addedAt } = entry

  const [balances, setBalances]     = useState(null)   // null = never fetched
  const [loading, setLoading]       = useState(false)
  const [fetchedAt, setFetchedAt]   = useState(null)
  const [editingLabel, setEditing]  = useState(false)
  const [draft, setDraft]           = useState(label)

  const isEvm  = isEvmAddress(address)
  const isTron = isTronAddress(address)

  const fetch = useCallback(async () => {
    setLoading(true)
    const results = {}

    await Promise.allSettled([
      isEvm
        ? fetchEvmUsdtBalance(CHAINS.ethereum, address)
            .then(b  => { results.ethereum = { balance: b, status: 'ok' } })
            .catch(() => { results.ethereum = { balance: null, status: 'error' } })
        : Promise.resolve().then(() => { results.ethereum = { balance: null, status: 'incompatible' } }),

      isEvm
        ? fetchEvmUsdtBalance(CHAINS.bsc, address)
            .then(b  => { results.bsc = { balance: b, status: 'ok' } })
            .catch(() => { results.bsc = { balance: null, status: 'error' } })
        : Promise.resolve().then(() => { results.bsc = { balance: null, status: 'incompatible' } }),

      isTron
        ? fetchTronUsdtBalance(address)
            .then(b  => { results.tron = { balance: b, status: 'ok' } })
            .catch(() => { results.tron = { balance: null, status: 'error' } })
        : Promise.resolve().then(() => { results.tron = { balance: null, status: 'incompatible' } }),
    ])

    setBalances(results)
    setFetchedAt(new Date())
    setLoading(false)
  }, [address, isEvm, isTron])

  // Total visible USDT
  const total = balances
    ? Object.values(balances).reduce((sum, d) => sum + (d?.balance ?? 0), 0)
    : null

  function saveLabel() {
    onLabelUpdate(id, draft.trim() || shortenAddress(address))
    setEditing(false)
  }

  const explorerUrl = isEvm
    ? `https://etherscan.io/address/${address}`
    : `https://tronscan.org/#/address/${address}`

  return (
    <div className="glass-card p-4 space-y-4 group">
      {/* Address row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          {/* Editable label */}
          {editingLabel ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveLabel(); if (e.key === 'Escape') setEditing(false) }}
                className="flex-1 bg-white/[0.05] border border-indigo-500/40 rounded-lg
                  px-2 py-1 text-xs text-white focus:outline-none"
              />
              <button onClick={saveLabel}    className="text-emerald-400 hover:text-emerald-300"><Check size={13} /></button>
              <button onClick={() => setEditing(false)} className="text-gray-600 hover:text-gray-400"><X size={13} /></button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-white truncate">{label}</p>
              <button
                onClick={() => { setDraft(label); setEditing(true) }}
                className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-gray-300
                  transition-opacity"
              >
                <Edit2 size={11} />
              </button>
            </div>
          )}

          {/* Address + network tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] text-gray-600">{shortenAddress(address)}</span>
            <div className="flex gap-1">
              {isEvm  && <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[9px] border border-blue-500/20">EVM</span>}
              {isTron && <span className="px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[9px] border border-red-500/20">TRON</span>}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <a
            href={explorerUrl}
            target="_blank" rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-gray-700 hover:text-gray-300 hover:bg-white/5 transition-all"
            title="View on explorer"
          >
            <ExternalLink size={13} />
          </a>
          <button
            onClick={fetch}
            disabled={loading}
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all"
            title="Refresh balances"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => onRemove(id)}
            className="p-1.5 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Remove from watchlist"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Balances */}
      {balances === null ? (
        /* Never fetched */
        <button
          onClick={fetch}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
            border border-dashed border-white/[0.08] text-xs text-gray-600
            hover:text-gray-300 hover:border-white/[0.15] hover:bg-white/[0.02]
            transition-all"
        >
          <Eye size={13} />
          Click to fetch USDT balances
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            {['ethereum', 'bsc', 'tron'].map(c => (
              <ChainBadge
                key={c}
                chain={c}
                data={balances[c]}
                loading={loading}
              />
            ))}
          </div>

          {/* Total */}
          {total !== null && (
            <div className="flex items-center justify-between text-xs border-t border-white/[0.05] pt-2">
              <span className="text-gray-600">Total USDT (visible chains)</span>
              <span className="font-bold text-white tabular-nums">
                ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {fetchedAt && (
            <p className="text-[10px] text-gray-700">
              Updated {fetchedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
