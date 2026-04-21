/**
 * Vercel serverless proxy for ChangeNOW API.
 * Keeps the API key server-side — never exposed to the browser.
 *
 * Maps:  /api/cn/<rest>  →  https://api.changenow.io/v1/<rest>
 */

const CN_BASE = 'https://api.changenow.io/v1'

export default async function handler(req, res) {
  // path is an array from [...path] catch-all, e.g. ['exchange-amount','100','usdttrc20_usdterc20']
  const segments = req.query.path ?? []
  const pathStr  = Array.isArray(segments) ? segments.join('/') : segments

  // Rebuild query string, dropping the internal 'path' key Vercel injects
  const rawQuery = new URLSearchParams(
    Object.fromEntries(
      Object.entries(req.query).filter(([k]) => k !== 'path')
    )
  ).toString()

  const target = `${CN_BASE}/${pathStr}${rawQuery ? `?${rawQuery}` : ''}`

  try {
    const upstream = await fetch(target, {
      method : req.method,
      headers: {
        'Content-Type'       : 'application/json',
        'x-changenow-api-key': process.env.VITE_CHANGENOW_API_KEY ?? '',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD'
        ? JSON.stringify(req.body)
        : undefined,
    })

    const text = await upstream.text()
    let body
    try { body = JSON.parse(text) } catch { body = text }

    // Pass CORS headers so browser is happy with same-origin /api/* response
    res.setHeader('Access-Control-Allow-Origin',  '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    res.status(upstream.status).json(body)
  } catch (err) {
    res.status(502).json({ error: 'Upstream request failed', detail: err.message })
  }
}
