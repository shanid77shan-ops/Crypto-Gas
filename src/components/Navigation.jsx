import { NavLink } from 'react-router-dom'
import { Home, ArrowLeftRight, Flame, Briefcase } from 'lucide-react'

const LINKS = [
  { to: '/',          label: 'Home',      icon: Home           },
  { to: '/swap',      label: 'Swap',      icon: ArrowLeftRight },
  { to: '/gas',       label: 'Gas',       icon: Flame          },
  { to: '/portfolio', label: 'Portfolio', icon: Briefcase      },
]

// ── Shared link styles ────────────────────────────────────────────────────────

function SidebarLink({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm
         transition-all duration-150 group
         ${isActive
           ? 'text-white'
           : 'text-slate-400 hover:text-white'}`
      }
      style={({ isActive }) => isActive ? {
        background  : 'linear-gradient(135deg,rgba(255,32,32,0.25),rgba(180,0,0,0.15))',
        border      : '1px solid rgba(255,32,32,0.50)',
        boxShadow   : '0 0 16px rgba(255,32,32,0.15)',
      } : {
        background  : 'transparent',
        border      : '1px solid transparent',
      }}
    >
      {({ isActive }) => (
        <>
          <Icon size={18} style={{ color: isActive ? 'var(--red)' : undefined }} />
          <span className="font-black">{label}</span>
        </>
      )}
    </NavLink>
  )
}

function BottomLink({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className="flex flex-col items-center justify-center gap-1 py-2 flex-1 transition-all"
    >
      {({ isActive }) => (
        <>
          <div
            className="p-1.5 rounded-lg transition-all"
            style={isActive ? {
              background: 'rgba(255,32,32,0.25)',
              border    : '1px solid rgba(255,32,32,0.50)',
            } : {
              background: 'transparent',
              border    : '1px solid transparent',
            }}
          >
            <Icon size={18} style={{ color: isActive ? 'var(--red)' : '#94a3b8' }} />
          </div>
          <span
            className="text-[10px] font-black uppercase tracking-wide"
            style={{ color: isActive ? 'var(--red)' : '#94a3b8' }}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  )
}

// ── Sidebar (desktop ≥ lg) ────────────────────────────────────────────────────

export function Sidebar() {
  return (
    <aside
      className="hidden lg:flex flex-col w-56 shrink-0 sticky top-16 h-[calc(100vh-4rem)]
        pt-6 pb-8 px-3 border-r overflow-y-auto"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
    >
      <nav className="space-y-1">
        {LINKS.map(l => <SidebarLink key={l.to} {...l} />)}
      </nav>

      {/* Brand footer */}
      <div className="mt-auto pt-6 px-4">
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--red)' }}>
          Global Gas
        </p>
        <p className="text-[10px] font-bold text-slate-600 mt-0.5">Layer 2 Ecosystem</p>
      </div>
    </aside>
  )
}

// ── Bottom bar (mobile < lg) ─────────────────────────────────────────────────

export function BottomNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch
        border-t backdrop-blur-2xl"
      style={{
        backgroundColor: 'var(--color-bg)',
        borderColor: 'var(--color-border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {LINKS.map(l => <BottomLink key={l.to} {...l} />)}
    </nav>
  )
}
