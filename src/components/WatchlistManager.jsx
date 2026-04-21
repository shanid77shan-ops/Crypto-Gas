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
    setInput(''); setLabel(''); setError(null); setShowForm(false)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-500/15 border border-violet-500/25">
            <Eye size={16} className="text-violet-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Watch-Only Portfolio</h2>
            <p className="text-sm text-slate-500 mt-0.5">No wallet connect needed — just paste an address</p>
          </div>
        </div>

        <button
          onClick={() => { setShowForm(f => !f); setError(null) }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
            transition-all border
            ${showForm
              ? 'bg-slate-800/60 border-slate-700/50 text-slate-300'
              : 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30'}`}
        >
          <PlusCircle size={15} />
          {showForm ? 'Cancel' : 'Add Address'}
        </button>
      </div>

      {/* Add form */}
      <div className={`overflow-hidden transition-all duration-300 ${showForm ? 'max-h-72' : 'max-h-0'}`}>
        <form onSubmit={handleAdd} className="glass-card p-6 space-y-4 border-indigo-500/20">
          <input
            type="text"
            value={input}
            onChange={e => { setInput(e.target.value); setError(null) }}
            placeholder="Wallet address (0x… or T…)"
            spellCheck={false}
            className="w-full bg-slate-800/50 border border-slate-700/60 rounded-xl px-4 py-3.5
              text-sm font-mono text-slate-100 placeholder-slate-600
              focus:outline-none focus:ring-2 focus:ring-indigo-500/50
              focus:border-indigo-500/40 transition-all"
          />
          <input
            type="text"
            value={labelInput}
            onChange={e => setLabel(e.target.value)}
            placeholder="Label (optional — e.g. Cold Wallet)"
            className="w-full bg-slate-800/50 border border-slate-700/60 rounded-xl px-4 py-3
              text-sm text-slate-100 placeholder-slate-600
              focus:outline-none focus:ring-2 focus:ring-indigo-500/50
              focus:border-indigo-500/40 transition-all"
          />

          {input && (
            <p className={`text-sm flex items-center gap-1.5
              ${isValid ? 'text-indigo-400' : 'text-amber-400'}`}>
              <AlertCircle size={13} />
              {isValid
                ? (isEvmAddress(input.trim()) ? 'EVM — queries ETH & BNB Chain' : 'TRON — queries TRON network')
                : 'Must be a valid EVM (0x…) or TRON (T…) address'}
            </p>
          )}
          {formError && (
            <p className="text-sm text-red-400 flex items-center gap-1.5">
              <AlertCircle size={13} /> {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={!isValid}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all
              bg-indigo-600 hover:bg-indigo-500 text-white
              disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            Watch this address
          </button>
        </form>
      </div>

      {/* Wallet grid */}
      {list.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center gap-4 text-center">
          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/40">
            <Wallet size={32} className="text-slate-600" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-400">No addresses watched yet</p>
            <p className="text-sm text-slate-600 mt-1">
              Add any public EVM or TRON address — no sign-in required
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="mt-1 px-5 py-2.5 rounded-xl text-sm font-medium
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
        <p className="text-xs text-slate-600 text-center">
          {list.length} address{list.length > 1 ? 'es' : ''} watched · Balances fetched on demand · Stored locally
        </p>
      )}
    </div>
  )
}
