import GasHeatmap        from '../components/GasHeatmap'
import GasHistory        from '../components/GasHistory'
import WorthItCalculator from '../components/WorthItCalculator'
import { Flame } from 'lucide-react'

export default function Gas() {
  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Flame size={22} style={{ color: 'var(--red)' }} />
          Gas Tracker
        </h1>
        <p className="text-sm font-bold text-slate-400 mt-1">
          Live Ethereum gas · Historical heatmap · Cost calculator
        </p>
      </div>

      <WorthItCalculator />
      <GasHeatmap />
      <GasHistory />

    </div>
  )
}
