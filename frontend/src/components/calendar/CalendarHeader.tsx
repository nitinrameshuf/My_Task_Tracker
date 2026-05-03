import { format, startOfWeek, endOfWeek, startOfMonth } from 'date-fns'
import type { CalendarView } from '@/types'

interface CalendarHeaderProps {
  date: Date
  view: CalendarView
  onViewChange: (v: CalendarView) => void
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

function formatTitle(date: Date, view: CalendarView): string {
  if (view === 'day') return format(date, 'MMMM d, yyyy')
  if (view === 'week') {
    const s = startOfWeek(date, { weekStartsOn: 1 })
    const e = endOfWeek(date, { weekStartsOn: 1 })
    if (s.getMonth() === e.getMonth()) return format(s, 'MMMM yyyy')
    return `${format(s, 'MMM')} – ${format(e, 'MMM yyyy')}`
  }
  return format(startOfMonth(date), 'MMMM yyyy')
}

export function CalendarHeader({ date, view, onViewChange, onPrev, onNext, onToday }: CalendarHeaderProps) {
  const VIEWS: CalendarView[] = ['day', 'week', 'month']

  return (
    <div className="flex items-center justify-between py-3 px-1 flex-wrap gap-2">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          className="p-1.5 rounded-lg hover:bg-surface-700 text-slate-400 hover:text-slate-100 transition-colors"
          aria-label="Previous"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20">
            <path d="M13 15l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <h2 className="text-lg font-semibold text-slate-100 min-w-[180px] text-center">
          {formatTitle(date, view)}
        </h2>

        <button
          onClick={onNext}
          className="p-1.5 rounded-lg hover:bg-surface-700 text-slate-400 hover:text-slate-100 transition-colors"
          aria-label="Next"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20">
            <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          onClick={onToday}
          className="px-3 py-1 text-sm rounded-lg border border-surface-500 text-slate-300 hover:bg-surface-700 transition-colors"
        >
          Today
        </button>
      </div>

      {/* View switcher */}
      <div className="flex rounded-lg overflow-hidden border border-surface-600">
        {VIEWS.map(v => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            className={`px-3 py-1.5 text-sm capitalize transition-colors ${view === v ? 'bg-surface-600 text-slate-100' : 'text-slate-400 hover:bg-surface-700'}`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}
