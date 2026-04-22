// Floating WhatsApp support button
const WA_NUMBER  = '919833023277'   // +91 98330 23277
const WA_MESSAGE = 'Hi! I need support with Global Gas 👋'
const WA_URL     = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`

// WhatsApp SVG logo
function WhatsAppIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M16 2C8.268 2 2 8.268 2 16c0 2.492.648 4.832 1.782 6.864L2 30l7.352-1.754A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2Z"
        fill="#25D366"
      />
      <path
        d="M22.5 19.25c-.35-.175-2.07-1.02-2.39-1.136-.32-.116-.553-.175-.786.175-.233.35-.903 1.136-1.107 1.37-.204.232-.408.261-.758.087-.35-.175-1.478-.545-2.814-1.737-1.04-.928-1.742-2.073-1.946-2.423-.204-.35-.022-.54.153-.713.158-.156.35-.408.524-.612.175-.203.233-.35.35-.583.116-.233.058-.437-.03-.612-.087-.175-.786-1.895-1.077-2.595-.283-.68-.572-.588-.786-.598L11.7 10c-.233 0-.612.087-.932.437C10.448 10.787 9.5 11.67 9.5 13.403c0 1.732 1.254 3.406 1.428 3.64.175.233 2.47 3.772 5.984 5.29 3.514 1.517 3.514 1.012 4.148.948.633-.064 2.044-.835 2.333-1.64.29-.806.29-1.497.204-1.64-.087-.146-.32-.233-.67-.408Z"
        fill="#fff"
      />
    </svg>
  )
}

export default function WhatsAppButton() {
  return (
    <>
      {/* Pulse ring */}
      <style>{`
        @keyframes wa-pulse {
          0%   { transform: scale(1);   opacity: .6; }
          70%  { transform: scale(1.55); opacity: 0;  }
          100% { transform: scale(1.55); opacity: 0;  }
        }
        .wa-pulse::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: #25D366;
          animation: wa-pulse 2.2s ease-out infinite;
        }
      `}</style>

      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="wa-pulse fixed z-50 flex items-center justify-center
          w-14 h-14 rounded-full shadow-2xl transition-transform
          hover:scale-110 active:scale-95"
        style={{
          /* above mobile bottom-nav (64px) + 12px gap */
          bottom          : 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
          right           : '16px',
          background      : 'linear-gradient(135deg,#25D366,#128C7E)',
          boxShadow       : '0 8px 32px rgba(37,211,102,0.45)',
        }}
      >
        <WhatsAppIcon size={30} />

        {/* Tooltip on hover */}
        <span
          className="absolute right-16 whitespace-nowrap px-3 py-1.5 rounded-lg
            text-xs font-black text-white pointer-events-none
            opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: '#128C7E', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
        >
          Chat Support
        </span>
      </a>

      {/* On desktop move it to bottom-right above footer */}
      <style>{`
        @media (min-width: 1024px) {
          a[aria-label="Chat on WhatsApp"] {
            bottom: 24px !important;
            right : 24px !important;
          }
        }
      `}</style>
    </>
  )
}
