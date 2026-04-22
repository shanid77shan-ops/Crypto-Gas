import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, CheckCircle2, ChevronDown } from 'lucide-react'

export default function SupportChat() {
  const [open,      setOpen]      = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [name,      setName]      = useState('')
  const [contact,   setContact]   = useState('')
  const [message,   setMessage]   = useState('')
  const [sending,   setSending]   = useState(false)
  const popupRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return
    setSending(true)
    // Simulate a brief send delay for realism
    await new Promise(r => setTimeout(r, 1200))
    setSending(false)
    setSubmitted(true)
  }

  function handleClose() {
    setOpen(false)
    // Reset after animation finishes
    setTimeout(() => { setSubmitted(false); setName(''); setContact(''); setMessage('') }, 300)
  }

  const inputCls = `w-full px-4 py-2.5 rounded-xl text-sm font-bold
    outline-none transition-all resize-none
    bg-white/[0.06] border border-white/[0.10] text-white
    placeholder-slate-500
    focus:bg-white/[0.09] focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20`

  return (
    <>
      {/* ── Popup ───────────────────────────────────────────────────────────── */}
      <div
        ref={popupRef}
        className="fixed z-50 w-[340px] max-w-[calc(100vw-2rem)]"
        style={{
          bottom       : 'calc(env(safe-area-inset-bottom, 0px) + 88px)',
          right        : '16px',
          pointerEvents: open ? 'auto' : 'none',
          opacity      : open ? 1 : 0,
          transform    : open ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.96)',
          transition   : 'opacity 0.22s ease, transform 0.22s ease',
        }}
      >
        <div
          className="rounded-2xl overflow-hidden shadow-2xl border"
          style={{
            background  : '#0d0d0d',
            borderColor : 'rgba(255,32,32,0.40)',
            boxShadow   : '0 24px 64px rgba(0,0,0,0.70), 0 0 0 1px rgba(255,32,32,0.12)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ background: 'linear-gradient(135deg,#1a0000,#2d0000)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(255,32,32,0.20)', border: '1.5px solid rgba(255,32,32,0.50)' }}
              >
                <MessageSquare size={18} style={{ color: 'var(--red)' }} />
              </div>
              <div>
                <p className="text-sm font-black text-white">Support Team</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-400">Online · Typically replies within 24h</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5">
            {!submitted ? (
              <>
                {/* Welcome bubble */}
                <div
                  className="rounded-xl p-4 mb-5 text-sm font-bold text-slate-200 leading-relaxed"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  👋 Hello! Welcome to <span style={{ color: 'var(--red)' }}>Global Gas</span> support.<br />
                  <span className="text-slate-400 font-bold text-xs">
                    Leave us a message and our team will get back to you as soon as possible.
                  </span>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">
                      Your Name <span style={{ color: 'var(--red)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="John Smith"
                      required
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">
                      Email or Phone <span className="text-slate-700">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={contact}
                      onChange={e => setContact(e.target.value)}
                      placeholder="you@email.com"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">
                      Message <span style={{ color: 'var(--red)' }}>*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="How can we help you today?"
                      required
                      className={inputCls}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending || !name.trim() || !message.trim()}
                    className="w-full py-3 rounded-xl text-sm font-black text-white
                      flex items-center justify-center gap-2
                      transition-all active:scale-[0.98] disabled:opacity-40"
                    style={{
                      background : 'linear-gradient(135deg,#ff2020,#cc0000)',
                      boxShadow  : sending ? 'none' : '0 6px 24px rgba(255,32,32,0.35)',
                    }}
                  >
                    {sending ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Success state */
              <div className="py-6 flex flex-col items-center gap-4 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(52,211,153,0.15)', border: '2px solid rgba(52,211,153,0.40)' }}
                >
                  <CheckCircle2 size={32} className="text-emerald-400" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-base font-black text-white">Message Received!</p>
                  <p className="text-sm font-bold text-slate-400 leading-relaxed max-w-[240px] mx-auto">
                    Thank you, <span className="text-white">{name}</span>. Our support team will review your message and contact you within <span className="text-white">24 hours</span>.
                  </p>
                </div>
                <p className="text-[11px] font-bold text-slate-600">
                  Global Gas Support Team
                </p>
                <button
                  onClick={handleClose}
                  className="text-xs font-black px-4 py-2 rounded-lg transition-all"
                  style={{ background: 'rgba(255,32,32,0.12)', color: 'var(--red)', border: '1px solid rgba(255,32,32,0.30)' }}
                >
                  Close
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          {!submitted && (
            <div className="px-5 pb-4 text-center">
              <p className="text-[10px] font-bold text-slate-700">
                Powered by <span style={{ color: 'var(--red)' }}>Global Gas</span> Support
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Trigger button ──────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open support chat"
        className="fixed z-50 w-14 h-14 rounded-full flex items-center justify-center
          shadow-2xl transition-all active:scale-90 hover:scale-110"
        style={{
          bottom     : 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
          right      : '16px',
          background : open
            ? 'linear-gradient(135deg,#333,#111)'
            : 'linear-gradient(135deg,#ff2020,#cc0000)',
          boxShadow  : open
            ? '0 8px 24px rgba(0,0,0,0.5)'
            : '0 8px 32px rgba(255,32,32,0.45)',
          border     : '1.5px solid rgba(255,32,32,0.50)',
        }}
      >
        <div
          style={{
            transition: 'transform 0.25s ease, opacity 0.25s ease',
            transform : open ? 'rotate(180deg) scale(0.85)' : 'rotate(0deg) scale(1)',
          }}
        >
          {open
            ? <ChevronDown size={22} color="#fff" />
            : <MessageSquare size={22} color="#fff" />
          }
        </div>

        {/* Unread dot */}
        {!open && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full
              flex items-center justify-center text-[9px] font-black text-white"
            style={{ background: 'var(--red)', border: '2px solid #000' }}
          >
            1
          </span>
        )}
      </button>

      {/* Desktop positioning override */}
      <style>{`
        @media (min-width: 1024px) {
          button[aria-label="Open support chat"],
          button[aria-label="Open support chat"] ~ div {
            right: 24px;
          }
          button[aria-label="Open support chat"] {
            bottom: 24px;
          }
          div[style*="88px"] {
            bottom: 100px !important;
          }
        }
      `}</style>
    </>
  )
}
