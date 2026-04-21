/**
 * useWatchlist — Rule 3: "Pseudo-Portfolio" / Watch-Only addresses.
 *
 * Persists a list of watched wallet addresses to localStorage.
 * No wallet connection required — purely read-only.
 */

import { useState, useCallback } from 'react'
import { isEvmAddress, isTronAddress } from '../lib/chains'

const LS_KEY = 'gas_tracker_watchlist'

function load() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]')
  } catch {
    return []
  }
}

function save(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list))
}

/**
 * @typedef {{ id: string, address: string, label: string, addedAt: string }} WatchEntry
 */

export function useWatchlist() {
  const [list, setList] = useState(() => load())

  /** Add a new address. Returns an error string if invalid/duplicate, null on success. */
  const addAddress = useCallback((address, label = '') => {
    const trimmed = address.trim()

    if (!isEvmAddress(trimmed) && !isTronAddress(trimmed)) {
      return 'Invalid address — must be an EVM (0x…) or TRON (T…) address'
    }
    if (list.some(e => e.address.toLowerCase() === trimmed.toLowerCase())) {
      return 'Address already in watchlist'
    }

    const entry = {
      id      : `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      address : trimmed,
      label   : label.trim() || shortenAddress(trimmed),
      addedAt : new Date().toISOString(),
    }
    const next = [entry, ...list]
    setList(next)
    save(next)
    return null
  }, [list])

  /** Remove an entry by id */
  const removeAddress = useCallback((id) => {
    const next = list.filter(e => e.id !== id)
    setList(next)
    save(next)
  }, [list])

  /** Update the label for an entry */
  const updateLabel = useCallback((id, label) => {
    const next = list.map(e => e.id === id ? { ...e, label } : e)
    setList(next)
    save(next)
  }, [list])

  return { list, addAddress, removeAddress, updateLabel }
}

export function shortenAddress(addr) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}
