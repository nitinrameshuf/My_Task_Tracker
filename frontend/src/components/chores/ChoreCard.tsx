import type { ChoreOccurrence } from '@/types'
import { Badge } from '@/components/ui/Badge'

interface ChoreCardProps {
  occurrence: ChoreOccurrence
  onToggle: () => void
  onEdit?: () => void
  compact?: boolean
}

const PRIORITY_LABELS: Record<string, string> = { high: 'High', medium: 'Med', low: 'Low' }
const PRIORITY_COLORS: Record<string, string> = {
  high: '#f97316',
  medium: '#a855f7',
  low: '#3b82f6',
}

function choreClass(o: ChoreOccurrence): string {
  if (o.is_completed) return 'chore-done'
  if (o.is_overdue) return 'chore-overdue'
  return `chore-${o.priority}`
}

export function ChoreCard({ occurrence: o, onToggle, onEdit, compact = false }: ChoreCardProps) {
  return (
    <div
      className={`rounded-lg p-3 flex items-start gap-3 cursor-pointer select-none transition-opacity ${choreClass(o)} ${compact ? 'text-sm' : ''}`}
      onClick={onToggle}
    >
      {/* Checkbox */}
      <div
        className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors ${o.is_completed ? 'bg-priority-done border-priority-done' : 'border-slate-500'}`}
      >
        {o.is_completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-medium truncate ${o.is_completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
            {o.name}
          </span>
          {o.is_overdue && (
            <span className="text-xs font-bold text-red-400 uppercase tracking-wide">Overdue</span>
          )}
        </div>

        {!compact && o.description && (
          <p className="text-xs text-slate-400 mt-0.5 truncate">{o.description}</p>
        )}

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <Badge
            label={PRIORITY_LABELS[o.priority]}
            color={PRIORITY_COLORS[o.priority]}
          />
          {o.category && <Badge label={o.category.name} color={o.category.color} />}
          {o.assignee && (
            <span className="flex items-center gap-1 text-xs text-slate-300">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: o.assignee.color }}
              />
              {o.assignee.name}
            </span>
          )}
        </div>
      </div>

      {/* Edit button */}
      {onEdit && (
        <button
          onClick={e => { e.stopPropagation(); onEdit() }}
          className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors p-1"
          title="Edit chore"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
            <path d="M14.7 3.3a1 1 0 011.4 1.4l-9.8 9.8-2.1.7.7-2.1 9.8-9.8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  )
}
