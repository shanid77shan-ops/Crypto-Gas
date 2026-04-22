/**
 * SwapProvider.js — ChangeNOW API wrapper (all calls through Vercel proxies)
 *
 *   /api/cn-currencies  →  GET  /v1/currencies
 *   /api/cn-estimate    →  GET  /v1/exchange-amount/{amount}/{pair}
 *   /api/cn-min         →  GET  /v1/min-amount
 *   /api/cn-swap        →  POST /v1/transactions
 *   /api/cn-status      →  GET  /v1/transactions/{id}
 */

import axios from 'axios'

const api = axios.create({ timeout: 15_000 })

// ── Status step mapping ───────────────────────────────────────────────────────

export const STATUS_STEP = {
  waiting   : 0,
  confirming: 1,
  verifying : 1,
  exchanging: 2,
  sending   : 3,
  finished  : 4,
  failed    : -1,
  expired   : -1,
  refunded  : -1,
}

export const STEPS = ['Waiting', 'Confirming', 'Exchanging', 'Sending', 'Done']

// ── Popular tickers (shown before search) ─────────────────────────────────────

export const POPULAR_TICKERS = [
  'btc', 'eth', 'usdterc20', 'usdttrc20', 'sol', 'bnb', 'xrp',
  'trx', 'ltc', 'ada', 'doge', 'matic', 'avax', 'dot', 'link',
]

// ── Coin image URL ────────────────────────────────────────────────────────────

export function coinImageUrl(ticker) {
  return `https://changenow.io/images/sprite/currencies/${ticker}.svg`
}

// ── Step 0 — Available currencies ────────────────────────────────────────────

export async function fetchCurrencies() {
  const { data } = await api.get('/api/cn-currencies')
  return data // array of { ticker, name, image, network, ... }
}

// ── Step A — Live rate estimate ───────────────────────────────────────────────

export async function fetchEstimate(amount, fromCurrency, toCurrency) {
  const pair = `${fromCurrency}_${toCurrency}`
  const { data } = await api.get('/api/cn-estimate', {
    params: { amount, pair },
  })
  return {
    estimatedAmount: data.estimatedAmount,
    minAmount      : data.minAmount ?? null,
  }
}

// ── Step A — Minimum exchange amount ─────────────────────────────────────────

export async function fetchMinAmount(fromCurrency, toCurrency) {
  const { data } = await api.get('/api/cn-min', {
    params: { from: fromCurrency, to: toCurrency },
  })
  return data.minAmount
}

// ── Step B — Create transaction ───────────────────────────────────────────────

export async function createSwap({ from, to, address, amount, refundAddress }) {
  const body = { from, to, address, amount: String(amount) }
  if (refundAddress) body.refundAddress = refundAddress
  const { data } = await api.post('/api/cn-swap', body)
  return data
}

// ── Step C — Poll transaction status ─────────────────────────────────────────

export async function fetchSwapStatus(txId) {
  const { data } = await api.get('/api/cn-status', {
    params: { id: txId },
  })
  return data
}
