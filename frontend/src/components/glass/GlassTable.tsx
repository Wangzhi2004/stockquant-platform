import React, { useState } from 'react'
import { cn } from '@/utils/formatters'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Column<T> {
  key: string
  title: string
  render?: (value: any, row: T, index: number) => React.ReactNode
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface GlassTableProps<T> {
  columns: Column<T>[]
  data: T[]
  rowKey: string
  className?: string
  onRowClick?: (row: T) => void
  selectedRowKey?: string | number
  hover?: boolean
  compact?: boolean
}

export function GlassTable<T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  className,
  onRowClick,
  selectedRowKey,
  hover = true,
  compact = false,
}: GlassTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const va = a[sortKey]
      const vb = b[sortKey]
      if (va == null || vb == null) return 0
      const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [data, sortKey, sortDir])

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.04]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'text-left text-text-tertiary font-medium uppercase tracking-wider',
                  compact ? 'px-3 py-2 text-[10px]' : 'px-4 py-3 text-xs',
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right',
                  col.sortable && 'cursor-pointer select-none hover:text-text-secondary',
                  col.width
                )}
                style={col.width ? { width: col.width } : undefined}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.title}
                  {col.sortable && sortKey === col.key && (
                    sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, idx) => {
            const key = row[rowKey]
            const isSelected = selectedRowKey !== undefined && key === selectedRowKey
            return (
              <tr
                key={key ?? idx}
                className={cn(
                  'border-b border-white/[0.02] transition-colors duration-150',
                  hover && 'glass-row-hover',
                  isSelected && 'glass-row-selected',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'text-text-primary',
                      compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right'
                    )}
                  >
                    {col.render ? col.render(row[col.key], row, idx) : row[col.key]}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
