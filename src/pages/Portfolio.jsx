import WatchlistManager from '../components/WatchlistManager'
import WalletLookup     from '../components/WalletLookup'
import { Briefcase } from 'lucide-react'

export default function Portfolio() {
  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Briefcase size={22} style={{ color: 'var(--red)' }} />
          Portfolio
        </h1>
        <p className="text-sm font-bold text-slate-400 mt-1">
          Watch-only wallet tracker · Multi-chain lookup · No sign-in required
        </p>
      </div>

      <WatchlistManager />
      <WalletLookup />

    </div>
  )
}
