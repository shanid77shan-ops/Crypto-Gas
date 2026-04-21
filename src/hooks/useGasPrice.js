import { useState, useEffect, useCallback, useRef } from 'react'
import { ethers } from 'ethers'
import { GasService } from '../lib/GasService'

const REFRESH_INTERVAL = 60_000 // Rule 1: poll every 60 seconds
const DROP_THRESHOLD   = 0.10   // Rule 1: 10 % lower triggers animation
const DROP_DISMISS_MS  = 7_000  // auto-hide the price-drop banner after 7 s

export function useGasPrice() {
  const [gasGwei, setGasGwei]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [priceDrop, setPriceDrop]   = useState(false)  // true while banner is visible
  const [dropPct, setDropPct]       = useState(0)       // how much it dropped (0–1)

  // Persists the last confirmed price between renders/calls
  const lastGasPrice = useRef(null)
  const lastSavedAt  = useRef(0)
  const dismissTimer = useRef(null)

  const fetchGas = useCallback(async () => {
    try {
      const gwei    = await GasService.fetchCurrentGasGwei()
      const rounded = Math.round(gwei * 10) / 10

      // ── Rule 1: 10% drop detection ──────────────────────────────────────
      if (lastGasPrice.current !== null && rounded < lastGasPrice.current * (1 - DROP_THRESHOLD)) {
        const drop = (lastGasPrice.current - rounded) / lastGasPrice.current
        setDropPct(drop)
        setPriceDrop(true)
        clearTimeout(dismissTimer.current)
        dismissTimer.current = setTimeout(() => setPriceDrop(false), DROP_DISMISS_MS)
      }

      lastGasPrice.current = rounded
      setGasGwei(rounded)
      setError(null)

      // Persist to Supabase + update heatmap aggregate (at most once per minute)
      const now = Date.now()
      if (now - lastSavedAt.current > 60_000) {
        lastSavedAt.current = now
        GasService.logGasReading(rounded)
      }
    } catch {
      setError('Could not fetch gas price')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGas()
    const id = setInterval(fetchGas, REFRESH_INTERVAL)
    return () => {
      clearInterval(id)
      clearTimeout(dismissTimer.current)
    }
  }, [fetchGas])

  const dismissDrop = useCallback(() => {
    clearTimeout(dismissTimer.current)
    setPriceDrop(false)
  }, [])

  const level =
    gasGwei === null ? 'unknown'
    : gasGwei < 20   ? 'cheap'
    : gasGwei <= 50  ? 'average'
    :                  'expensive'

  return {
    gasGwei,
    level,
    loading,
    error,
    priceDrop,
    dropPct,
    lastGasPrice: lastGasPrice.current,
    dismissDrop,
    refresh: fetchGas,
  }
}
