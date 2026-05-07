import React, { useEffect, useState } from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassInput } from '@/components/glass/GlassInput'
import { api } from '@/services/api'
import {
  Newspaper,
  Search,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Sparkles,
  Clock,
  Tag,
} from 'lucide-react'

interface NewsItem {
  id: string
  title: string
  source: string
  publish_time: string
  sentiment: string | null
  sentiment_score: string | null
  opportunity_score: string | null
  ai_summary: string | null
  ai_suggestion: string | null
  related_stocks: string | null
  related_sectors: string | null
}

const sentimentConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  positive: { icon: ThumbsUp, color: 'text-up', bg: 'bg-up/10', label: '正面' },
  negative: { icon: ThumbsDown, color: 'text-down', bg: 'bg-down/10', label: '负面' },
  neutral: { icon: Minus, color: 'text-text-tertiary', bg: 'bg-glass-bg-hover', label: '中性' },
}

export const NewsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all')
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await api.get<NewsItem[]>('/news?limit=50')
        setNews(res)
      } catch (e) {
        console.error('News fetch error:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchNews()
  }, [])

  const filteredNews = news.filter((item) => {
    const matchesSearch =
      item.title.includes(searchQuery) ||
      (item.related_stocks && item.related_stocks.includes(searchQuery)) ||
      (item.related_sectors && item.related_sectors.includes(searchQuery))
    const matchesSentiment = sentimentFilter === 'all' ? true : item.sentiment === sentimentFilter
    return matchesSearch && matchesSentiment
  })

  const getSentiment = (s: string | null) => sentimentConfig[s || 'neutral'] || sentimentConfig.neutral

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Newspaper className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-bold text-text-primary">财经资讯</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <GlassInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="搜索关键词/股票/板块"
              className="pl-9 w-64"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-text-tertiary mr-2">情感筛选:</span>
        {(['all', 'positive', 'negative', 'neutral'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setSentimentFilter(type)}
            className={`px-3 py-1.5 rounded-glass-sm text-xs font-medium transition-colors border ${
              sentimentFilter === type
                ? 'bg-accent/20 border-accent/30 text-accent'
                : 'border-glass-border text-text-tertiary hover:text-text-primary hover:bg-glass-bg-hover'
            }`}
          >
            {type === 'all' ? '全部' : type === 'positive' ? '正面' : type === 'negative' ? '负面' : '中性'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredNews.map((item) => {
          const sentiment = getSentiment(item.sentiment)
          const SentimentIcon = sentiment.icon
          const oppScore = parseFloat(item.opportunity_score || '0')
          const stocks = item.related_stocks ? item.related_stocks.split(',') : []
          const sectors = item.related_sectors ? item.related_sectors.split(',') : []

          return (
            <GlassCard key={item.id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-text-primary mb-2">{item.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-text-tertiary">
                    <span>{item.source}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.publish_time ? new Date(item.publish_time).toLocaleString('zh-CN') : '-'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-glass-sm text-xs font-medium ${sentiment.bg} ${sentiment.color}`}>
                    <SentimentIcon className="w-3.5 h-3.5" />
                    {sentiment.label}
                  </span>
                </div>
              </div>

              {item.ai_summary && (
                <div className="bg-accent/5 rounded-glass-sm p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-accent">AI 分析</span>
                  </div>
                  <p className="text-sm text-text-secondary mb-2">{item.ai_summary}</p>
                  {item.ai_suggestion && (
                    <p className="text-sm text-text-tertiary">
                      <span className="text-accent">建议:</span> {item.ai_suggestion}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  {stocks.map((stock) => (
                    <span key={stock} className="inline-flex items-center px-2 py-0.5 rounded bg-glass-bg-hover text-xs font-mono text-text-secondary">
                      {stock.trim()}
                    </span>
                  ))}
                  {sectors.map((sector) => (
                    <span key={sector} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-accent/10 text-xs text-accent">
                      <Tag className="w-3 h-3" />
                      {sector.trim()}
                    </span>
                  ))}
                </div>

                <div className="text-right">
                  <p className="text-xs text-text-tertiary mb-0.5">机会评分</p>
                  <div className="flex items-center gap-1">
                    <div className="w-20 h-2 bg-glass-bg-hover rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${oppScore >= 70 ? 'bg-up' : oppScore >= 40 ? 'bg-accent' : 'bg-down'}`} style={{ width: `${oppScore}%` }} />
                    </div>
                    <span className={`text-sm font-mono font-semibold ${oppScore >= 70 ? 'text-up' : oppScore >= 40 ? 'text-accent' : 'text-down'}`}>
                      {oppScore.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          )
        })}
        {filteredNews.length === 0 && <p className="text-text-tertiary text-center py-12">暂无新闻</p>}
      </div>
    </div>
  )
}

export default NewsPage
