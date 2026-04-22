// GET /api/cn-estimate?amount=100&pair=usdttrc20_usdterc20
export default async function handler(req, res) {
  const { amount, pair } = req.query
  if (!amount || !pair) return res.status(400).json({ error: 'Missing amount or pair' })

  const url = `https://api.changenow.io/v1/exchange-amount/${amount}/${pair}`
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
