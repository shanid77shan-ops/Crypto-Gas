import SwapCard from '../components/SwapCard'
import { ArrowLeftRight } from 'lucide-react'

export default function Swap() {
  return (
    <div className="space-y-6 max-w-xl mx-auto">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <ArrowLeftRight size={22} style={{ color: 'var(--red)' }} />
          Cross-Chain Swap
        </h1>
        <p className="text-sm font-bold text-slate-400 mt-1">
          Swap 700+ crypto pairs · Powered by ChangeNOW · Non-custodial
        </p>
      </div>

      <SwapCard />

    </div>
  )
}
