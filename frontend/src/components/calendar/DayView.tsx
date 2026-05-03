import { format } from 'date-fns'
import type { ChoreOccurrence } from '@/types'
import { ChoreCard } from '@/components/chores/ChoreCard'

interface DayViewProps {
  date: Date
  occurrences: ChoreOccurrence[]
  onToggle: (o: ChoreOccurrence) => void
  onEdit: (o: ChoreOccurrence) => void
}

export function DayView({ date, occurrences, onToggle, onEdit }: DayViewProps) {
  const dateStr = format(date, 'yyyy-MM-dd')
  const dayChores = occurrences.filter(o => o.date === dateStr)

  const overdue = dayChores.filter(o => o.is_overdue)
  const pending = dayChores.filter(o => !o.is_overdue && !o.is_completed)
  const done = dayChores.filter(o => o.is_completed)

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-slate-100">
        {format(date, 'EEEE, MMMM d, yyyy')}
      </h2>

      {dayChores.length === 0 && (
        <p className="text-slate-500 text-sm">No chores scheduled for today.</p>
      )}

      {overdue.length > 0 && (
        <Section title="Overdue" count={overdue.length} accent="text-red-400">
          {overdue.map(o => (
            <ChoreCard key={`${o.id}-${o.date}`} occurrence={o} onToggle={() => onToggle(o)} onEdit={() => onEdit(o)} />
          ))}
        </Section>
      )}

      {pending.length > 0 && (
        <Section title="To Do" count={pending.length} accent="text-slate-300">
          {pending.map(o => (
            <ChoreCard key={`${o.id}-${o.date}`} occurrence={o} onToggle={() => onToggle(o)} onEdit={() => onEdit(o)} />
          ))}
        </Section>
      )}

      {done.length > 0 && (
        <Section title="Completed" count={done.length} accent="text-green-400">
          {done.map(o => (
            <ChoreCard key={`${o.id}-${o.date}`} occurrence={o} onToggle={() => onToggle(o)} onEdit={() => onEdit(o)} />
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({
  title, count, accent, children
}: { title: string; count: number; accent: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className={`text-xs font-semibold uppercase tracking-widest mb-2 ${accent}`}>
        {title} <span className="opacity-60">({count})</span>
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}
