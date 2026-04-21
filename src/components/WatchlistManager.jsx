/**
 * WatchlistManager — Rule 3: Add / view watched addresses without wallet connect.
 * Users paste any public address; balances are fetched on demand per card.
 */

import { useState } from 'react'
import { PlusCircle, Eye, AlertCircle, Wallet } from 'lucide-react'
import { useWatchlist } from '../hooks/useWatchlist'
import { isEvmAddress, isTronAddress } from '../lib/chains'
import WatchedWallet from './WatchedWallet'

export default function WatchlistManager() {
  const { list, addAddress, removeAddress, updateLabel } = useWatchlist()

  const [input, setInput]       = useState('')
  const [labelInput, setLabel]  = useState('')
  const [formError, setError]   = useState(null)
  const [showForm, setShowForm] = useState(false)

  const isValid = isEvmAddress(input.trim()) || isTronAddress(input.trim())

  function handleAdd(e) {
    e.preventDefault()
    const err = addAddress(input.trim(), labelInput.trim())
    if (err) { setError(err); return }
    setInput('')
    setLabel('')
    setError(null)
    setShowForm(false)
  }

  function handleInputChange(val) {
    setInput(val)
    setError(null)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-500/15 border border-violet-500/25">
            <Eye size={14} className="text-violet-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Watch-Only Portfolio</h2>
            <p className="text-xs text-gray-600">No wallet connect needed — just paste an address</p>
          </div>
        </div>

        <button
          onClick={() => { setShowForm(f => !f); setError(null) }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
            transition-all border
            ${showForm
              ? 'bg-white/[0.06] border-white/[0.1] text-gray-300'
              : 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30'}`}
        >
          <PlusCircle size={13} />
          {showForm ? 'Cancel' : 'Add Address'}
        </button>
      </div>

      {/* Add form (slide open) */}
      <div className={`overflow-hidden transition-all duration-300 ${showForm ? 'max-h-64' : 'max-h-0'}`}>
        <form
          onSubmit={handleAdd}
          className="glass-card p-5 space-y-3 border-indigo-500/20"
        >
          <div className="space-y-2">
            <input
              type="text"
              value={input}
              onChange={e => handleInputChange(e.target.value)}
              placeholder="Wallet address  (0x… or T…)"
              spellCheck={false}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3
                text-sm font-mono placeholder-gray-600 focus:outline-none
                focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/40 transition-all"
            />
            <input
              type="text"
              value={labelInput}
              onChange={e => setLabel(e.target.value)}
              placeholder="Label (optional — e.g. Cold Wallet)"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5
                text-sm placeholder-gray-600 focus:outline-none
                focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/40 transition-all"
            />
          </div>

          {/* Validation hint */}
          {input && (
            <p className={`text-xs flex items-center gap-1.5
              ${isValid ? 'text-indigo-400' : 'text-amber-400'}`}>
              {isValid ? (
                <><Eye size={11} /> {isEvmAddress(input.trim()) ? 'EVM — queries ETH & BNB Chain' : 'TRON — queries TRON network'}</>
              ) : (
                <><AlertCircle size={11} /> Must be a valid EVM (0x…) or TRON (T…) address</>
              )}
            </p>
          )}

          {formError && (
            <p className="text-xs text-red-400 flex items-center gap-1.5">
              <AlertCircle size={11} /> {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={!isValid}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all
              bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed
              active:scale-[0.98]"
          >
            Watch this address
          </button>
        </form>
      </div>

      {/* Wallet cards */}
      {list.length === 0 ? (
        <div className="glass-card p-10 flex flex-col items-center justify-center gap-3 text-center">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <Wallet size={28} className="text-gray-700" />
          </div>
          <div>
            <p className="text-sm text-gray-500">No addresses watched yet</p>
            <p className="text-xs text-gray-700 mt-1">
              Add any public EVM or TRON address — no sign-in required
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 px-4 py-2 rounded-xl text-xs font-medium
              bg-indigo-600/20 border border-indigo-500/30 text-indigo-300
              hover:bg-indigo-600/30 transition-all"
          >
            + Add your first address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map(entry => (
            <WatchedWallet
              key={entry.id}
              entry={entry}
              onRemove={removeAddress}
              onLabelUpdate={updateLabel}
            />
          ))}
        </div>
      )}

      {list.length > 0 && (
        <p className="text-[10px] text-gray-700 text-center">
          {list.length} address{list.length > 1 ? 'es' : ''} watched · Balances fetched on demand · Data stored locally
        </p>
      )}
    </div>
  )
}
