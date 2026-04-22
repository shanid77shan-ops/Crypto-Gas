// GET /api/cn-status?id=TRANSACTION_ID
export default async function handler(req, res) {
  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'Missing id' })

  const key = process.env.VITE_CHANGENOW_API_KEY ?? ''
  const url = `https://api.changenow.io/v1/transactions/${id}?api_key=${key}`
  try {
    const r = await fetch(url, {
      headers: { 'x-changenow-api-key': key },
    })
    const data = await r.json()
    res.status(r.status).json(data)
  } catch (e) {
    res.status(502).json({ error: e.message })
  }
}
