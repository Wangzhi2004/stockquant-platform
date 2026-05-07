import axios from 'axios'

export interface StockData {
  code: string
  name: string
  price: number
  change: number
  changePct: number
  volume: number
  turnover: string
  pe: number
  marketCap: string
}

export async function getHotStocks(limit: number = 20): Promise<StockData[]> {
  try {
    // Use the backend proxy to AKShare
    const res = await axios.get('/api/v1/market/stocks', {
      params: { limit: limit * 2 },
    })
    return res.data.map((s: any) => ({
      code: s.code,
      name: s.name,
      price: parseFloat(s.price || 0),
      change: parseFloat(s.change || 0),
      changePct: parseFloat(s.change_pct || 0),
      volume: parseInt(s.volume || 0),
      turnover: s.turnover || '-',
      pe: parseFloat(s.pe_ttm || 0),
      marketCap: s.market_cap ? `${(s.market_cap / 100000000).toFixed(0)}亿` : '-',
    }))
  } catch (e) {
    console.error('getHotStocks error:', e)
    return []
  }
}
