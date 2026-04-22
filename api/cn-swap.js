// POST /api/cn-swap  body: { from, to, address, amount, refundAddress? }
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const key = process.env.VITE_CHANGENOW_API_KEY ?? ''

  // ChangeNOW v1 requires the API key in the URL path for transaction creation
  const url = `https://api.changenow.io/v1/transactions/${key}`

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body

    const r = await fetch(url, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(body),
    })

    const data = await r.json()
    // Pass the real ChangeNOW error message through so the UI can display it
    res.status(r.status).json(data)
  } catch (e) {
    res.status(502).json({ error: e.message })
  }
}
