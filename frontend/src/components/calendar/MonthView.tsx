import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns'
import type { ChoreOccurrence, Priority } from '@/types'

interface MonthViewProps {
  date: Date
  occurrences: ChoreOccurrence[]
  onSelectDay: (d: Date) => void
}

const PRIORITY_DOT: Record<Priority, string> = {
  high: 'bg-orange-500',
  medium: 'bg-purple-500',
  low: 'bg-blue-500',
}

export function MonthView({ date, occurrences, onSelectDay }: MonthViewProps) {
  const monthStart = startOfMonth(date)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(endOfMonth(date), { weekStartsOn: 1 })
  const today = new Date()

  const days: Date[] = []
  let cur = gridStart
  while (cur <= gridEnd) {
    days.push(cur)
    cur = addDays(cur, 1)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} className="text-center text-xs font-semibold text-slate-500 uppercase py-1">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 flex-1 gap-1">
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayChores = occurrences.filter(o => o.date === dateStr)
          const inMonth = isSameMonth(day, date)
          const isToday = isSameDay(day, today)
          const hasOverdue = dayChores.some(o => o.is_overdue)
          const pending = dayChores.filter(o => !o.is_completed)
          const completed = dayChores.filter(o => o.is_completed)

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDay(day)}
              className={`
                relative flex flex-col items-start p-1.5 rounded-lg min-h-[70px] text-left transition-colors
                ${inMonth ? 'bg-surface-800 hover:bg-surface-700' : 'bg-surface-900 opacity-40'}
                ${isToday ? 'ring-1 ring-orange-500' : ''}
              `}
            >
              <span className={`text-sm font-medium mb-1 ${isToday ? 'text-orange-400' : inMonth ? 'text-slate-300' : 'text-slate-600'}`}>
                {format(day, 'd')}
              </span>

              {/* Priority dots for pending chores */}
              {pending.length > 0 && (
                <div className="flex flex-wrap gap-0.5 mb-0.5">
                  {pending.slice(0, 6).map((o, i) => (
                    <span
                      key={i}
                      className={`w-2 h-2 rounded-full ${o.is_overdue ? 'bg-red-500' : PRIORITY_DOT[o.priority]}`}
                    />
                  ))}
                  {pending.length > 6 && (
                    <span className="text-xs text-slate-500">+{pending.length - 6}</span>
                  )}
                </div>
              )}

              {/* Done count */}
              {completed.length > 0 && (
                <span className="text-xs text-green-500">✓ {completed.length}</span>
              )}

              {hasOverdue && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
