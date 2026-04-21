/**
 * SwapProvider.js
 * ─────────────────────────────────────────────────────────────────────────────
 * ChangeNOW API wrapper for USDT TRC-20 ↔ USDT ERC-20 swaps.
 * Docs: https://documenter.getpostman.com/view/8180765/SVYxnEmD
 */

import axios from 'axios'

const CN_BASE = 'https://api.changenow.io/v1'
const API_KEY = import.meta.env.VITE_CHANGENOW_API_KEY ?? ''

const cn = axios.create({
  baseURL: CN_BASE,
  timeout: 15_000,
  headers: { 'x-changenow-api-key': API_KEY },
})

// ── Pair constants ────────────────────────────────────────────────────────────

export const PAIRS = {
  TRC20: 'usdttrc20',
  ERC20: 'usdterc20',
}

export const PAIR_LABELS = {
  usdttrc20: { label: 'USDT (TRC-20)', short: 'USDT·TRC20', network: 'TRON',     color: 'text-red-400'    },
  usdterc20: { label: 'USDT (ERC-20)', short: 'USDT·ERC20', network: 'Ethereum', color: 'text-blue-400'   },
}

// ── Status step mapping ───────────────────────────────────────────────────────
// Maps ChangeNOW status strings → 0-based step index for the progress bar

export const STATUS_STEP = {
  waiting   : 0,
  confirming: 1,
  exchanging: 2,
  sending   : 3,
  finished  : 4,
  failed    : -1,
  expired   : -1,
  refunded  : -1,
  verifying : 1,
}

export const STEPS = ['Waiting', 'Confirming', 'Exchanging', 'Sending', 'Done']

// ── Step A — Get live rate estimate ──────────────────────────────────────────
/**
 * Returns { estimatedAmount, minAmount } or throws.
 * pair: e.g. 'usdttrc20_usdterc20'
 */
export async function fetchEstimate(amount, fromCurrency, toCurrency) {
  const pair = `${fromCurrency}_${toCurrency}`
  const { data } = await cn.get(`/exchange-amount/${amount}/${pair}`)
  return {
    estimatedAmount: data.estimatedAmount,
    minAmount      : data.minAmount ?? null,
  }
}

// ── Step A — Get minimum exchange amount ─────────────────────────────────────
export async function fetchMinAmount(fromCurrency, toCurrency) {
  const { data } = await cn.get('/min-amount', {
    params: { from: fromCurrency, to: toCurrency },
  })
  return data.minAmount
}

// ── Step B — Create transaction ───────────────────────────────────────────────
/**
 * @param {{ from, to, address, amount, refundAddress? }} opts
 * @returns ChangeNOW transaction object including payinAddress, id, etc.
 */
export async function createSwap({ from, to, address, amount, refundAddress }) {
  const body = { from, to, address, amount: String(amount) }
  if (refundAddress) body.refundAddress = refundAddress

  const { data } = await cn.post('/transactions', body, {
    params: { api_key: API_KEY },
  })
  return data
}

// ── Step C — Poll transaction status ─────────────────────────────────────────
/**
 * @param {string} txId  ChangeNOW transaction ID
 * @returns {{ status, payinHash, payoutHash, amountSend, amountReceive, updatedAt }}
 */
export async function fetchSwapStatus(txId) {
  const { data } = await cn.get(`/transactions/${txId}/status`)
  return data
}
