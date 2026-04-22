// GET /api/cn-min?from=usdttrc20&to=usdterc20
export default async function handler(req, res) {
  const { from, to } = req.query
  if (!from || !to) return res.status(400).json({ error: 'Missing from or to' })

  const url = `https://api.changenow.io/v1/min-amount?from=${from}&to=${to}`
  try {
    const r = await fetch(url, {
      headers: { 'x-changenow-api-key': process.env.VITE_CHANGENOW_API_KEY ?? '' },
    })
    const data = await r.json()
    res.status(r.status).json(data)
  } catch (e) {
    res.status(502).json({ error: e.message })
  }
}
