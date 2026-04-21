export const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
]

export const CHAINS = {
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: '⟠',
    gradient: 'from-blue-500 to-indigo-600',
    border: 'border-blue-500/30',
    usdtAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    getRpc: () =>
      `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY || 'demo'}`,
  },
  bsc: {
    id: 'bsc',
    name: 'BNB Chain',
    symbol: 'BNB',
    icon: '⬡',
    gradient: 'from-yellow-400 to-amber-600',
    border: 'border-yellow-400/30',
    usdtAddress: '0x55d398326f99059fF775485246999027B3197955',
    decimals: 18,
    getRpc: () => 'https://bsc-dataseed1.binance.org/',
  },
  tron: {
    id: 'tron',
    name: 'TRON',
    symbol: 'TRX',
    icon: '◈',
    gradient: 'from-red-500 to-rose-700',
    border: 'border-red-500/30',
    usdtAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    decimals: 6,
    getRpc: () => null,
  },
}

export function isEvmAddress(addr) {
  return /^0x[0-9a-fA-F]{40}$/.test(addr)
}

export function isTronAddress(addr) {
  return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(addr)
}
