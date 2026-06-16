import React, { useEffect, useState, useCallback } from 'react'
import { GlassCard, GlassBadge, GlassTabs, GlassInput, GlassButton } from '@/components/glass'
import { StrengthBar, LoadingSpinner } from '@/components/common'
import { newsService } from '@/services/news'
import type { NewsArticle, NewsAnalysis } from '@/types'
import { formatDateTime, cn } from '@/utils/formatters'
import {
  Newspaper,
  Search,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Sparkles,
  Clock,
  Tag,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react'

interface LocalNewsItem extends NewsArticle {
  opportunityScore?: number
  aiSuggestion?: string
  relatedSectors?: string[]
  sentimentScore?: number
}

const sentimentTabs = [
  { key: 'all', label: '全部' },
  { key: 'positive', label: '正面', icon: <ThumbsUp className="w-3 h-3" /> },
  { key: 'negative', label: '负面', icon: <ThumbsDown className="w-3 h-3" /> },
  { key: 'neutral', label: '中性', icon: <Minus className="w-3 h-3" /> },
]

const sentimentBadgeVariant: Record<string, 'up' | 'down' | 'default'> = {
  positive: 'up',
  negative: 'down',
  neutral: 'default',
}

const sentimentLabel: Record<string, string> = {
  positive: '正面',
  negative: '负面',
  neutral: '中性',
}

const getScoreColor = (score: number) => {
  if (score >= 70) return 'text-up'
  if (score >= 40) return 'text-accent'
  return 'text-down'
}

const getScoreBg = (score: number) => {
  if (score >= 70) return 'bg-up'
  if (score >= 40) return 'bg-accent'
  return 'bg-down'
}

export const NewsPage: React.FC = () => {
  const [news, setNews] = useState<LocalNewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sentimentFilter, setSentimentFilter] = useState('all')
  const [analyses, setAnalyses] = useState<Record<string, NewsAnalysis>>({})
  const [expandedAI, setExpandedAI] = useState<Record<string, boolean>>({})
  const [batchAnalyzing, setBatchAnalyzing] = useState(false)
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await newsService.list({ pageSize: 50 })
        setNews((res.data as LocalNewsItem[]) || [])
      } catch {
        setNews([])
      } finally {
        setLoading(false)
      }
    }
    fetchNews()
  }, [])

  const filteredNews = news.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.relatedStocks && item.relatedStocks.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (item.relatedSectors && item.relatedSectors.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())))
    const matchesSentiment = sentimentFilter === 'all' || item.sentiment === sentimentFilter
    return matchesSearch && matchesSentiment
  })

  const handleAnalyze = useCallback(async (id: string) => {
    setAnalyzingIds((prev) => new Set(prev).add(id))
    try {
      const res = await newsService.analyze(id)
      setAnalyses((prev) => ({ ...prev, [id]: res.data }))
    } catch {
      // ignore
    } finally {
      setAnalyzingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }, [])

  const handleBatchAnalyze = useCallback(async () => {
    setBatchAnalyzing(true)
    const promises = filteredNews.map((item) =>
      newsService
        .analyze(item.id)
        .then((res) => ({ id: item.id, analysis: res.data }))
        .catch(() => null)
    )
    const results = await Promise.all(promises)
    const newAnalyses: Record<string, NewsAnalysis> = {}
    results.forEach((r) => {
      if (r) newAnalyses[r.id] = r.analysis
    })
    setAnalyses((prev) => ({ ...prev, ...newAnalyses }))
    setBatchAnalyzing(false)
  }, [filteredNews])

  const toggleAI = (id: string) => {
    setExpandedAI((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
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
          <GlassInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="搜索关键词/股票/板块"
            icon={<Search className="w-4 h-4" />}
            className="w-64"
          />
          <GlassButton
            variant="primary"
            loading={batchAnalyzing}
            onClick={handleBatchAnalyze}
            icon={<Zap className="w-4 h-4" />}
          >
            批量AI分析
          </GlassButton>
        </div>
      </div>

      <GlassTabs
        tabs={sentimentTabs}
        activeKey={sentimentFilter}
        onChange={setSentimentFilter}
        size="sm"
      />

      <div className="space-y-4">
        {filteredNews.map((item) => {
          const analysis = analyses[item.id]
          const isExpanded = expandedAI[item.id]
          const isAnalyzing = analyzingIds.has(item.id)
          const oppScore = item.opportunityScore ?? 0
          const stocks = item.relatedStocks || []
          const sectors = item.relatedSectors || []

          return (
            <GlassCard key={item.id} className="p-0">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-text-primary mb-2 truncate">{item.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-text-tertiary">
                      <span>{item.source}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(item.publishedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    {item.sentiment && (
                      <GlassBadge variant={sentimentBadgeVariant[item.sentiment] || 'default'} size="md">
                        {item.sentiment === 'positive' && <ThumbsUp className="w-3 h-3 mr-1" />}
                        {item.sentiment === 'negative' && <ThumbsDown className="w-3 h-3 mr-1" />}
                        {item.sentiment === 'neutral' && <Minus className="w-3 h-3 mr-1" />}
                        {sentimentLabel[item.sentiment] || item.sentiment}
                      </GlassBadge>
                    )}
                  </div>
                </div>

                {item.summary && (
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">{item.summary}</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    {stocks.map((stock) => (
                      <GlassBadge key={stock} variant="default" size="sm" className="font-mono">
                        {stock.trim()}
                      </GlassBadge>
                    ))}
                    {sectors.map((sector) => (
                      <GlassBadge key={sector} variant="accent" size="sm">
                        <Tag className="w-3 h-3 mr-0.5" />
                        {sector.trim()}
                      </GlassBadge>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] text-text-tertiary mb-1">机会评分</p>
                      <div className="flex items-center gap-2">
                        <StrengthBar value={oppScore} size="sm" />
                        <span className={cn('text-sm font-mono font-semibold', getScoreColor(oppScore))}>
                          {oppScore.toFixed(0)}
                        </span>
                      </div>
                    </div>
                    <div className="w-16 h-1.5 bg-glass-bg-hover rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', getScoreBg(oppScore))}
                        style={{ width: `${Math.min(oppScore, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-glass-border">
                <button
                  className="w-full flex items-center justify-between px-5 py-2.5 text-sm text-accent hover:bg-accent/5 transition-colors"
                  onClick={() => {
                    toggleAI(item.id)
                    if (!analysis && !isAnalyzing) handleAnalyze(item.id)
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI 分析
                    {isAnalyzing && <LoadingSpinner size="sm" />}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 space-y-3">
                    {analysis ? (
                      <>
                        <div className="bg-accent/5 rounded-glass-sm p-4">
                          <p className="text-sm text-text-secondary mb-2">{analysis.summary}</p>
                          {item.aiSuggestion && (
                            <p className="text-sm text-text-tertiary">
                              <span className="text-accent font-medium">建议: </span>
                              {item.aiSuggestion}
                            </p>
                          )}
                        </div>

                        {analysis.keywords && analysis.keywords.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-text-tertiary">关键词:</span>
                            {analysis.keywords.map((kw) => (
                              <GlassBadge key={kw} variant="accent" size="sm">
                                {kw}
                              </GlassBadge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-text-tertiary">
                          <span>
                            情感分数: <span className="font-mono text-text-primary">{analysis.sentimentScore.toFixed(2)}</span>
                          </span>
                          <GlassBadge variant={sentimentBadgeVariant[analysis.sentiment] || 'default'} size="sm">
                            {sentimentLabel[analysis.sentiment] || analysis.sentiment}
                          </GlassBadge>
                        </div>
                      </>
                    ) : isAnalyzing ? (
                      <div className="flex items-center justify-center py-4">
                        <LoadingSpinner size="sm" />
                        <span className="ml-2 text-sm text-text-tertiary">AI 分析中...</span>
                      </div>
                    ) : (
                      <p className="text-sm text-text-tertiary py-2">点击上方按钮开始 AI 分析</p>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>
          )
        })}
        {filteredNews.length === 0 && (
          <GlassCard className="p-12 flex flex-col items-center justify-center text-center">
            <Newspaper className="w-12 h-12 text-text-tertiary/50 mb-3" />
            <p className="text-text-tertiary">暂无新闻</p>
          </GlassCard>
        )}
      </div>
    </div>
  )
}

export default NewsPage
