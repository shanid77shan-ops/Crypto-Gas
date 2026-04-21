/**
 * bridgeService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Wraps the LI.FI API (https://li.quest/v1) for cross-chain bridge estimation.
 *
 * LI.FI aggregates 30+ bridges (Stargate, Hop, Across, Connext …) across EVM
 * chains.  TRON is a non-EVM chain and is NOT supported by LI.FI — those routes
 * return a { type: 'non-evm' } sentinel so the UI can show a CEX-bridge notice.
 */

import axios from 'axios'

const LIFI_BASE      = 'https://li.quest/v1'
const CC_BASE        = 'https://min-api.cryptocompare.com/data/price'
const ALCHEMY_KEY    = import.meta.env.VITE_ALCHEMY_API_KEY ?? ''
const ALCHEMY_RPC    = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`

// Gas units consumed by a USDT "claim" redemption on Ethereum mainnet
const ETH_CLAIM_GAS_UNITS = 100_000

// A known, non-sensitive placeholder address used for fee estimation only.
// LI.FI needs fromAddress to compute gas accurately but won't execute anything.
const ESTIMATION_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

// Integrator fee config — 0.5% collected on every EVM bridge quote
const INTEGRATOR      = 'CryptoGas'
const FEE_PERCENT     = 0.005   // 0.5% expressed as a decimal
const FEE_RECIPIENT   = '0x874c6292d2df7cf1b04e260ada777e396d79259e'

// ─── Live price helpers ───────────────────────────────────────────────────────

async function fetchPriceUSD(symbol) {
  const { data } = await axios.get(CC_BASE, {
    params: { fsym: symbol, tsyms: 'USD' },
    timeout: 8_000,
  })
  return data?.USD ?? 0
}

async function fetchEthGasGwei() {
  const { data } = await axios.post(ALCHEMY_RPC, {
    jsonrpc: '2.0', id: 1, method: 'eth_gasPrice', params: [],
  }, { timeout: 8_000 })
  const hex = data?.result ?? '0x0'
  return parseInt(hex, 16) / 1e9
}

// ─── Chain registry ──────────────────────────────────────────────────────────
export const BRIDGE_CHAINS = {
  ETH: {
    key: 'ETH', lifiId: 1,     name: 'Ethereum',  shortName: 'ETH',
    nativeGas: 'ETH',
    icon: '⟠',
    gradient: 'from-blue-500 to-indigo-600',
    accent: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/25',
    nonEvm: false,
  },
  ARB: {
    key: 'ARB', lifiId: 42161, name: 'Arbitrum',  shortName: 'ARB',
    nativeGas: 'ETH',
    icon: '🔵',
    gradient: 'from-sky-400 to-blue-600',
    accent: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/25',
    nonEvm: false,
  },
  POL: {
    key: 'POL', lifiId: 137,   name: 'Polygon',   shortName: 'POL',
    nativeGas: 'POL',
    icon: '⬡',
    gradient: 'from-violet-500 to-purple-600',
    accent: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/25',
    nonEvm: false,
  },
  OPT: {
    key: 'OPT', lifiId: 10,    name: 'Optimism',  shortName: 'OP',
    nativeGas: 'ETH',
    icon: '🔴',
    gradient: 'from-red-500 to-rose-600',
    accent: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/25',
    nonEvm: false,
  },
  BSC: {
    key: 'BSC', lifiId: 56,    name: 'BNB Chain', shortName: 'BSC',
    nativeGas: 'BNB',
    icon: '⬢',
    gradient: 'from-yellow-400 to-amber-600',
    accent: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/25',
    nonEvm: false,
  },
  TRX: {
    key: 'TRX', lifiId: null,  name: 'TRON',      shortName: 'TRX',
    nativeGas: 'TRX',
    icon: '◈',
    gradient: 'from-red-600 to-rose-800',
    accent: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/25',
    nonEvm: true,
  },
}

// ─── Token registry ──────────────────────────────────────────────────────────
export const BRIDGE_TOKENS = {
  USDT: {
    symbol: 'USDT', name: 'Tether USD', decimals: 6,
    addresses: {
      ETH: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      ARB: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      POL: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      OPT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      BSC: '0x55d398326f99059fF775485246999027B3197955',
      TRX: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    },
  },
  ETH: {
    symbol: 'ETH', name: 'Ethereum', decimals: 18,
    addresses: {
      ETH: '0x0000000000000000000000000000000000000000',
      ARB: '0x0000000000000000000000000000000000000000',
      POL: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      OPT: '0x0000000000000000000000000000000000000000',
    },
  },
  USDC: {
    symbol: 'USDC', name: 'USD Coin', decimals: 6,
    addresses: {
      ETH: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      ARB: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      POL: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      OPT: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      BSC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    },
  },
}

/** Returns token keys available on a given chain */
export function getTokensForChain(chainKey) {
  return Object.keys(BRIDGE_TOKENS).filter(
    t => BRIDGE_TOKENS[t].addresses[chainKey] !== undefined
  )
}

// ─── Main quote function ─────────────────────────────────────────────────────

/**
 * @param {{ fromChain: string, toChain: string, fromToken: string, toToken: string, amount: string }}
 * @returns {QuoteResult}
 */
export async function fetchBridgeQuote({ fromChain, toChain, fromToken, toToken, amount }) {
  const srcChain = BRIDGE_CHAINS[fromChain]
  const dstChain = BRIDGE_CHAINS[toChain]
  const srcToken = BRIDGE_TOKENS[fromToken]
  const dstToken = BRIDGE_TOKENS[toToken]

  if (!srcToken || !dstToken) throw new Error('Unknown token')

  // ── Non-EVM route (TRON involved) ─────────────────────────────────────────
  if (srcChain.nonEvm || dstChain.nonEvm) {
    return buildNonEvmResult(fromChain, toChain, fromToken, toToken, amount, srcChain, dstChain)
  }


  const srcAddress = srcToken.addresses[fromChain]
  const dstAddress = dstToken.addresses[toChain]

  if (!srcAddress || !dstAddress) {
    throw new Error(`${fromToken} is not available on ${srcChain.name} or ${dstChain.name}`)
  }

  const amountInSmallest = BigInt(
    Math.floor(parseFloat(amount) * 10 ** srcToken.decimals)
  ).toString()

  const { data } = await axios.get(`${LIFI_BASE}/quote`, {
    params: {
      fromChain  : srcChain.lifiId,
      toChain    : dstChain.lifiId,
      fromToken  : srcAddress,
      toToken    : dstAddress,
      fromAmount : amountInSmallest,
      fromAddress: ESTIMATION_ADDRESS,
      integrator : INTEGRATOR,
      fee        : FEE_PERCENT,
      referrer   : FEE_RECIPIENT,
    },
    timeout: 15_000,
    headers: { Accept: 'application/json' },
  })

  return parseEvmQuote(data, srcToken, dstToken, srcChain, dstChain)
}

// ─── Response parsers ────────────────────────────────────────────────────────

function parseEvmQuote(raw, srcToken, dstToken, srcChain, dstChain) {
  const est = raw.estimate ?? {}

  const toAmount    = parseFloat(est.toAmount    ?? '0') / 10 ** dstToken.decimals
  const toAmountMin = parseFloat(est.toAmountMin ?? '0') / 10 ** dstToken.decimals
  const fromAmount  = parseFloat(est.fromAmount  ?? '0') / 10 ** srcToken.decimals

  // Source-chain gas (type 'SEND' or first entry)
  const gasList = est.gasCosts ?? []
  const feeList = est.feeCosts ?? []

  const sourceGasUSD = gasList
    .filter(g => g.type === 'SEND' || gasList.length === 1)
    .reduce((s, g) => s + parseFloat(g.amountUSD || 0), 0)

  const destGasUSD = gasList
    .filter(g => g.type !== 'SEND' && gasList.length > 1)
    .reduce((s, g) => s + parseFloat(g.amountUSD || 0), 0)

  const bridgeFeeUSD = feeList.reduce((s, f) => s + parseFloat(f.amountUSD || 0), 0)

  const totalFeesUSD = gasList.reduce((s, g) => s + parseFloat(g.amountUSD || 0), 0)
                     + bridgeFeeUSD

  const durationSec  = est.executionDuration ?? 300
  const durationText = formatDuration(durationSec)

  return {
    type          : 'evm',
    bridgeName    : raw.toolDetails?.name ?? raw.tool ?? 'Bridge',
    bridgeLogo    : raw.toolDetails?.logoURI ?? null,
    fromAmount,
    toAmount,
    toAmountMin,
    fromTokenSymbol: srcToken.symbol,
    toTokenSymbol  : dstToken.symbol,
    fromChainName  : srcChain.name,
    toChainName    : dstChain.name,
    fromChainGas   : srcChain.nativeGas,
    toChainGas     : dstChain.nativeGas,
    sourceGasUSD,
    destGasUSD,
    bridgeFeeUSD,
    totalFeesUSD,
    durationSec,
    durationText,
    slippage       : fromAmount > 0
                     ? ((fromAmount - toAmountMin) / fromAmount) * 100
                     : 0,
  }
}

async function buildNonEvmResult(fromChain, toChain, fromToken, toToken, amount, srcChain, dstChain) {
  const isTronSrc = srcChain.nonEvm

  // TRON "Trigger Smart Contract" for a USDT transfer costs ~13.5 TRX in energy/bandwidth
  const TRON_TRIGGER_TRX = 13.5
  // ETH claim gas units (redeeming USDT on Ethereum mainnet)
  const ETH_CLAIM_GAS    = ETH_CLAIM_GAS_UNITS

  // Fetch live prices concurrently; fall back gracefully on failure
  let trxPrice = 0, ethPrice = 0, gasGwei = 20
  try {
    ;[trxPrice, ethPrice, gasGwei] = await Promise.all([
      fetchPriceUSD('TRX'),
      fetchPriceUSD('ETH'),
      fetchEthGasGwei(),
    ])
  } catch { /* silently use fallback values */ }

  const tronTriggerUSD  = TRON_TRIGGER_TRX * trxPrice
  const ethClaimFeeUSD  = (gasGwei * ETH_CLAIM_GAS / 1e9) * ethPrice
  const totalFeesUSD    = tronTriggerUSD + ethClaimFeeUSD

  return {
    type              : 'non-evm',
    fromChain,
    toChain,
    fromToken,
    toToken,
    amount            : parseFloat(amount),
    fromChainName     : srcChain.name,
    toChainName       : dstChain.name,
    sourceGasToken    : srcChain.nativeGas,
    destGasToken      : dstChain.nativeGas,
    tronIsSrc         : isTronSrc,
    // Live fee breakdown
    tronTriggerTRX    : TRON_TRIGGER_TRX,
    tronTriggerUSD,
    ethClaimGasUnits  : ETH_CLAIM_GAS,
    ethClaimGasGwei   : Math.round(gasGwei * 10) / 10,
    ethClaimFeeUSD,
    totalFeesUSD,
    // Denominator prices used (shown in UI for transparency)
    trxPriceUSD       : trxPrice,
    ethPriceUSD       : ethPrice,
    // Typical duration
    typicalMinutesMin : 5,
    typicalMinutesMax : 30,
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(seconds) {
  if (seconds < 60)  return `~${seconds}s`
  if (seconds < 3600) return `~${Math.round(seconds / 60)} min`
  return `~${(seconds / 3600).toFixed(1)} hr`
}

export function fmtUSD(n) {
  if (!n && n !== 0) return '—'
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
}

export function fmtToken(n, symbol, decimals = 4) {
  if (!n && n !== 0) return '—'
  return `${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: decimals })} ${symbol}`
}
