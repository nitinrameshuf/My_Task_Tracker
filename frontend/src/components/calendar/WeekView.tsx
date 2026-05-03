import { format, startOfWeek, addDays, isSameDay } from 'date-fns'
import type { ChoreOccurrence } from '@/types'
import { ChoreCard } from '@/components/chores/ChoreCard'

interface WeekViewProps {
  date: Date
  occurrences: ChoreOccurrence[]
  onToggle: (o: ChoreOccurrence) => void
  onEdit: (o: ChoreOccurrence) => void
  onSelectDay: (d: Date) => void
}

export function WeekView({ date, occurrences, onToggle, onEdit, onSelectDay }: WeekViewProps) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const today = new Date()

  return (
    <div className="grid grid-cols-7 gap-2 h-full">
      {days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd')
        const dayChores = occurrences.filter(o => o.date === dateStr)
        const isToday = isSameDay(day, today)

        return (
          <div key={dateStr} className="flex flex-col min-h-0 bg-surface-800 rounded-lg overflow-hidden">
            {/* Header */}
            <button
              onClick={() => onSelectDay(day)}
              className={`px-2 py-2 text-center border-b border-surface-600 hover:bg-surface-700 transition-colors ${isToday ? 'bg-surface-700' : ''}`}
            >
              <div className="text-xs text-slate-400 uppercase">{format(day, 'EEE')}</div>
              <div className={`text-lg font-semibold mt-0.5 ${isToday ? 'text-orange-400' : 'text-slate-200'}`}>
                {format(day, 'd')}
              </div>
            </button>

            {/* Chore list */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
              {dayChores.length === 0 && (
                <p className="text-xs text-slate-600 text-center py-2">—</p>
              )}
              {dayChores.map(o => (
                <ChoreCard
                  key={`${o.id}-${o.date}`}
                  occurrence={o}
                  onToggle={() => onToggle(o)}
                  onEdit={() => onEdit(o)}
                  compact
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
