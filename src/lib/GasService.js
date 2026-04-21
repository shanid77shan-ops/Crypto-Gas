/**
 * GasService — centralised utility for all gas-related API calls.
 *
 * Responsibilities:
 *  • Fetch live ETH gas price via Alchemy JSON-RPC
 *  • Fetch live ETH/USD price via CryptoCompare (no API key required)
 *  • Calculate gas cost in USD for a standard ERC-20 transfer
 *  • Evaluate the "worth it" threshold (gas < N% of transaction)
 *  • Generate/fetch heatmap data (hourly gas averages by day-of-week)
 *  • Persist gas readings to Supabase
 */

import { ethers } from 'ethers'
import axios from 'axios'
import { supabase } from './supabase'

// --------------------------------------------------------------------------
// Constants
// --------------------------------------------------------------------------

/** Gas units consumed by a standard ETH transfer; ERC-20 transfers use ~65k */
export const GAS_LIMIT_TRANSFER = 21_000
export const GAS_LIMIT_ERC20    = 65_000

const ALCHEMY_RPC = () =>
  `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY || 'demo'}`

const ETH_PRICE_URL =
  'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD'

// --------------------------------------------------------------------------
// Core API helpers
// --------------------------------------------------------------------------

/**
 * Returns current base gas price in Gwei.
 */
async function fetchCurrentGasGwei() {
  const provider = new ethers.JsonRpcProvider(ALCHEMY_RPC())
  const feeData  = await provider.getFeeData()
  return parseFloat(ethers.formatUnits(feeData.gasPrice, 'gwei'))
}

/**
 * Returns current ETH price in USD.
 * Falls back to a cached value or 0 on failure.
 */
async function fetchEthPriceUSD() {
  try {
    const { data } = await axios.get(ETH_PRICE_URL, { timeout: 5_000 })
    return data?.USD ?? 0
  } catch {
    return 0
  }
}

/**
 * Calculates the total gas cost in USD for a transaction.
 *
 * @param {number} gasGwei      - Current gas price in Gwei
 * @param {number} ethPriceUSD  - ETH price in USD
 * @param {number} gasLimit     - Gas units (default: ERC-20 transfer)
 * @returns {number} Gas cost in USD
 */
function calcGasCostUSD(gasGwei, ethPriceUSD, gasLimit = GAS_LIMIT_ERC20) {
  const gasCostETH = (gasGwei * gasLimit) / 1e9
  return gasCostETH * ethPriceUSD
}

/**
 * Determines if a transaction is "worth it" — i.e. gas is less than
 * `thresholdPct` (default 5%) of the transaction value.
 *
 * @returns {{ worthIt: boolean, gasPct: number, minTxUSD: number }}
 */
function evaluateWorthIt(txAmountUSD, gasCostUSD, thresholdPct = 0.05) {
  const gasPct   = txAmountUSD > 0 ? gasCostUSD / txAmountUSD : Infinity
  const minTxUSD = gasCostUSD / thresholdPct
  return {
    worthIt  : gasPct <= thresholdPct,
    gasPct   : Math.min(gasPct, 9.99),      // cap for display
    minTxUSD,
  }
}

// --------------------------------------------------------------------------
// Heatmap data
// --------------------------------------------------------------------------

/**
 * Generates deterministic mock heatmap data mirroring real Ethereum gas
 * patterns (peak: Mon–Fri 13–21 UTC, trough: 02–07 UTC, weekends lower).
 * Used when no Supabase history is available.
 */
function generateMockHeatmap() {
  const rows = []
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const isWeekend  = day >= 5
      const isPeak     = hour >= 13 && hour <= 21
      const isOffPeak  = hour >= 2  && hour <= 7
      const base       = isWeekend ? 15 : 28
      const peak       = isPeak    ? (isWeekend ? 12 : 28) : 0
      const trough     = isOffPeak ? -12 : 0
      // Deterministic noise via sin/cos so SSR and client match
      const noise      = Math.sin(day * 7 + hour) * 4 + Math.cos(day + hour * 3) * 2
      const gwei       = Math.max(4, base + peak + trough + noise)
      rows.push({ day, hour, gwei: Math.round(gwei * 10) / 10 })
    }
  }
  return rows
}

/**
 * Fetches hourly gas averages from Supabase `gas_hourly_stats`.
 * Falls back to mock data if the table is empty or Supabase is unconfigured.
 */
async function fetchHeatmapData() {
  if (!supabase) return generateMockHeatmap()

  const { data, error } = await supabase
    .from('gas_hourly_stats')
    .select('hour_of_day, day_of_week, avg_gwei')

  if (error || !data?.length) return generateMockHeatmap()

  return data.map(r => ({
    day  : r.day_of_week,
    hour : r.hour_of_day,
    gwei : Number(r.avg_gwei),
  }))
}

// --------------------------------------------------------------------------
// Persistence
// --------------------------------------------------------------------------

/**
 * Logs a gas reading to Supabase `gas_history` and updates the hourly
 * aggregate in `gas_hourly_stats` (upsert).
 */
async function logGasReading(gasGwei) {
  if (!supabase) return

  const now        = new Date()
  const hourOfDay  = now.getUTCHours()
  const dayOfWeek  = now.getUTCDay() === 0 ? 6 : now.getUTCDay() - 1 // Mon=0 … Sun=6

  await supabase.from('gas_history').insert({ gas_gwei: gasGwei })

  // Upsert hourly aggregate
  const { data: existing } = await supabase
    .from('gas_hourly_stats')
    .select('avg_gwei, sample_count')
    .eq('hour_of_day', hourOfDay)
    .eq('day_of_week', dayOfWeek)
    .maybeSingle()

  if (existing) {
    const newCount = existing.sample_count + 1
    const newAvg   = ((existing.avg_gwei * existing.sample_count) + gasGwei) / newCount
    await supabase
      .from('gas_hourly_stats')
      .update({ avg_gwei: newAvg, sample_count: newCount, updated_at: now.toISOString() })
      .eq('hour_of_day', hourOfDay)
      .eq('day_of_week', dayOfWeek)
  } else {
    await supabase.from('gas_hourly_stats').insert({
      hour_of_day  : hourOfDay,
      day_of_week  : dayOfWeek,
      avg_gwei     : gasGwei,
      sample_count : 1,
    })
  }
}

// --------------------------------------------------------------------------
// Public API
// --------------------------------------------------------------------------

export const GasService = {
  fetchCurrentGasGwei,
  fetchEthPriceUSD,
  calcGasCostUSD,
  evaluateWorthIt,
  fetchHeatmapData,
  logGasReading,
  GAS_LIMIT_TRANSFER,
  GAS_LIMIT_ERC20,
}
