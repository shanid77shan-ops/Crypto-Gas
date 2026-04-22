// GET /api/cn-currencies
export default async function handler(req, res) {
  const url = 'https://api.changenow.io/v1/currencies?active=true&fixedRate=false'
  try {
    const r = await fetch(url, {
      headers: { 'x-changenow-api-key': process.env.VITE_CHANGENOW_API_KEY ?? '' },
    })
    const data = await r.json()
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=60')
    res.status(r.status).json(data)
  } catch (e) {
    res.status(502).json({ error: e.message })
  }
}
