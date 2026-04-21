import { useState, useEffect, useMemo } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, Cell, ReferenceLine,
} from 'recharts'
import { Clock, TrendingDown, Info } from 'lucide-react'
import { GasService } from '../lib/GasService'

// --------------------------------------------------------------------------
// Config
// --------------------------------------------------------------------------

const DAYS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 24 }, (_, i) =>
  i === 0 ? '12am' : i < 12 ? `${i}am` : i === 12 ? '12pm' : `${i - 12}pm`
)

function gweiColor(gwei) {
  if (gwei < 15)  return '#10b981'  // emerald — very cheap
  if (gwei < 20)  return '#34d399'  // light emerald — cheap
  if (gwei < 30)  return '#fbbf24'  // amber — moderate
  if (gwei < 50)  return '#f97316'  // orange — expensive
  return              '#ef4444'     // red — very expensive
}

function gweiOpacity(gwei, max) {
  return 0.25 + (gwei / max) * 0.75
}

// --------------------------------------------------------------------------
// Custom Tooltip for Bar chart
// --------------------------------------------------------------------------

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { hour, gwei } = payload[0].payload
  const label = gwei < 20 ? '🟢 Cheap' : gwei < 50 ? '🟡 Average' : '🔴 Expensive'
  return (
    <div className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs shadow-2xl">
      <p className="text-slate-400 mb-1">{HOURS[hour]}</p>
      <p className="text-white font-bold">{gwei.toFixed(1)} Gwei</p>
      <p className="text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}

// --------------------------------------------------------------------------
// Heatmap cell grid
// --------------------------------------------------------------------------

function HeatmapGrid({ data, selectedDay, onSelectDay }) {
  // Build a Map keyed by "day-hour" for O(1) lookups
  const cellMap = useMemo(() => {
    const m = new Map()
    data.forEach(d => m.set(`${d.day}-${d.hour}`, d.gwei))
    return m
  }, [data])

  const maxGwei = useMemo(() => Math.max(...data.map(d => d.gwei), 1), [data])

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[520px]">
        {/* Hour labels */}
        <div className="flex mb-1 ml-10">
          {HOURS.map((h, i) => (
            <div key={i} className="flex-1 text-center text-[11px] text-slate-700 truncate px-px">
              {i % 3 === 0 ? h : ''}
            </div>
          ))}
        </div>

        {/* Day rows */}
        {DAYS.map((day, dayIdx) => (
          <div key={day} className="flex items-center gap-0 mb-1">
            <button
              onClick={() => onSelectDay(dayIdx === selectedDay ? null : dayIdx)}
              className={`w-9 text-[10px] text-right pr-2 shrink-0 transition-colors
                ${selectedDay === dayIdx ? 'text-indigo-400 font-bold' : 'text-slate-600 hover:text-slate-400'}`}
            >
              {day}
            </button>

            {Array.from({ length: 24 }, (_, hour) => {
              const gwei = cellMap.get(`${dayIdx}-${hour}`) ?? 0
              const color = gweiColor(gwei)
              const opacity = gweiOpacity(gwei, maxGwei)
              const isSelected = selectedDay === dayIdx

              return (
                <div
                  key={hour}
                  className={`flex-1 aspect-square rounded-sm transition-all duration-200 cursor-default
                    ${isSelected ? 'ring-1 ring-white/20 scale-y-110' : ''}`}
                  style={{
                    backgroundColor: color,
                    opacity,
                    margin: '0 1px',
                  }}
                  title={`${day} ${HOURS[hour]}: ${gwei.toFixed(1)} Gwei`}
                />
              )
            })}
          </div>
        ))}

        {/* Colour legend */}
        <div className="flex items-center gap-3 mt-3 ml-10 flex-wrap">
          {[
            { label: 'Very cheap (<15)', color: '#10b981' },
            { label: 'Cheap (<20)',      color: '#34d399' },
            { label: 'Moderate (<30)',   color: '#fbbf24' },
            { label: 'High (<50)',       color: '#f97316' },
            { label: 'Very high (50+)',  color: '#ef4444' },
          ].map(({ label, color }) => (
            <span key={label} className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------
// Hourly bar chart for selected day (or all-week average)
// --------------------------------------------------------------------------

function HourlyBarChart({ data, selectedDay }) {
  const chartData = useMemo(() => {
    const rows = selectedDay !== null
      ? data.filter(d => d.day === selectedDay)
      : Object.values(
          data.reduce((acc, d) => {
            if (!acc[d.hour]) acc[d.hour] = { hour: d.hour, gwei: 0, count: 0 }
            acc[d.hour].gwei  += d.gwei
            acc[d.hour].count += 1
            return acc
          }, {})
        ).map(r => ({ hour: r.hour, gwei: Math.round((r.gwei / r.count) * 10) / 10 }))

    return rows.sort((a, b) => a.hour - b.hour).map(r => ({
      ...r,
      label: HOURS[r.hour],
    }))
  }, [data, selectedDay])

  const cheapest = chartData.reduce((best, r) => r.gwei < best.gwei ? r : best, chartData[0])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {selectedDay !== null ? `${DAYS[selectedDay]} hourly avg` : 'All-week hourly avg'}
        </p>
        {cheapest && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <TrendingDown size={11} />
            Best: {cheapest.label} · {cheapest.gwei} Gwei
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={chartData} barCategoryGap="8%" margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: '#6b7280', fontSize: 9 }}
            tickLine={false}
            axisLine={false}
            interval={2}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 9 }}
            tickLine={false}
            axisLine={false}
            width={32}
            tickFormatter={v => `${v}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <ReferenceLine y={20} stroke="#34d399" strokeDasharray="3 3" strokeOpacity={0.4} />
          <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.4} />
          <Bar dataKey="gwei" radius={[3, 3, 0, 0]} maxBarSize={18}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={gweiColor(entry.gwei)} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex gap-4 text-[10px] text-slate-600">
        <span className="flex items-center gap-1">
          <span className="w-6 border-t border-dashed border-emerald-500/50 inline-block" /> 20 Gwei
        </span>
        <span className="flex items-center gap-1">
          <span className="w-6 border-t border-dashed border-red-500/50 inline-block" /> 50 Gwei
        </span>
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------
// Main export
// --------------------------------------------------------------------------

export default function GasHeatmap() {
  const [data, setData]             = useState([])
  const [selectedDay, setSelectedDay] = useState(null)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    GasService.fetchHeatmapData().then(d => {
      setData(d)
      setLoading(false)
    })
  }, [])

  // Find cheapest window (3 consecutive hours with lowest average)
  const bestWindow = useMemo(() => {
    if (!data.length) return null
    const hourAvg = Array.from({ length: 24 }, (_, h) => {
      const slice = data.filter(d => d.hour === h)
      return { hour: h, avg: slice.reduce((s, d) => s + d.gwei, 0) / (slice.length || 1) }
    })
    const windows = hourAvg.map((_, i) => ({
      start : i,
      avg   : (hourAvg[i].avg + hourAvg[(i+1)%24].avg + hourAvg[(i+2)%24].avg) / 3,
    }))
    return windows.reduce((best, w) => w.avg < best.avg ? w : best, windows[0])
  }, [data])

  return (
    <div className="glass-card p-6 space-y-6 relative overflow-hidden">
      {/* Neon bleed */}
      <div className="pointer-events-none absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-cyan-600/8 blur-3xl" />

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/25">
              <Clock size={14} className="text-cyan-400" />
            </div>
            <h2 className="text-base font-bold text-slate-100">Gas Heatmap</h2>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Best times to transact — click a day to drill down
          </p>
        </div>

        {bestWindow && (
          <div className="flex items-center gap-2 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            <TrendingDown size={12} className="text-emerald-400" />
            <span className="text-emerald-300">
              Best window: <strong>{HOURS[bestWindow.start]}–{HOURS[(bestWindow.start + 3) % 24]}</strong> UTC
              &nbsp;·&nbsp;~{bestWindow.avg.toFixed(0)} Gwei
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center text-slate-700 text-sm animate-pulse">
          Loading heatmap data…
        </div>
      ) : (
        <>
          <HeatmapGrid
            data={data}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />
          <div className="h-px w-full bg-white/[0.05]" />
          <HourlyBarChart data={data} selectedDay={selectedDay} />
        </>
      )}

      <div className="flex items-center gap-1.5 text-[10px] text-slate-700">
        <Info size={10} />
        {data.length && data[0].day !== undefined
          ? 'Heatmap powered by Supabase historical data or seeded estimates'
          : 'Seeded estimates based on typical Ethereum gas patterns'}
      </div>
    </div>
  )
}
