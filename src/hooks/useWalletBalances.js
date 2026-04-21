import { useState, useCallback } from 'react'
import { ethers } from 'ethers'
import axios from 'axios'
import { CHAINS, ERC20_ABI, isEvmAddress, isTronAddress } from '../lib/chains'

// Exported so WatchedWallet and other consumers can reuse without the hook
export async function fetchEvmUsdtBalance(chain, address) {
  const provider = new ethers.JsonRpcProvider(chain.getRpc())
  const contract = new ethers.Contract(chain.usdtAddress, ERC20_ABI, provider)
  const raw = await contract.balanceOf(address)
  return parseFloat(ethers.formatUnits(raw, chain.decimals))
}

export async function fetchTronUsdtBalance(address) {
  const url = `https://api.trongrid.io/v1/accounts/${address}/tokens?token_id=${CHAINS.tron.usdtAddress}&only_confirmed=true`
  const { data } = await axios.get(url, { timeout: 10_000 })
  const token = data?.data?.[0]
  if (!token) return 0
  return token.balance / Math.pow(10, CHAINS.tron.decimals)
}

export function useWalletBalances() {
  const [balances, setBalances] = useState({})
  const [loading, setLoading] = useState(false)
  const [queried, setQueried] = useState(false)

  const fetchBalances = useCallback(async (address) => {
    setLoading(true)
    setQueried(true)
    setBalances({})

    const evmAddr = isEvmAddress(address)
    const tronAddr = isTronAddress(address)

    const results = {}

    const jobs = [
      evmAddr
        ? fetchEvmUsdtBalance(CHAINS.ethereum, address)
            .then(b => { results.ethereum = { balance: b, status: 'ok' } })
            .catch(() => { results.ethereum = { balance: null, status: 'error' } })
        : Promise.resolve().then(() => { results.ethereum = { balance: null, status: 'incompatible' } }),

      evmAddr
        ? fetchEvmUsdtBalance(CHAINS.bsc, address)
            .then(b => { results.bsc = { balance: b, status: 'ok' } })
            .catch(() => { results.bsc = { balance: null, status: 'error' } })
        : Promise.resolve().then(() => { results.bsc = { balance: null, status: 'incompatible' } }),

      tronAddr
        ? fetchTronUsdtBalance(address)
            .then(b => { results.tron = { balance: b, status: 'ok' } })
            .catch(() => { results.tron = { balance: null, status: 'error' } })
        : Promise.resolve().then(() => { results.tron = { balance: null, status: 'incompatible' } }),
    ]

    await Promise.allSettled(jobs)
    setBalances(results)
    setLoading(false)
  }, [])

  return { balances, loading, queried, fetchBalances }
}
