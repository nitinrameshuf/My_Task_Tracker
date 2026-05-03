import { useState } from 'react'
import { addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from 'date-fns'
import {
  useCalendarQuery, useToggleComplete,
  useFamilyMembers, useCategories,
} from '@/hooks/useCalendar'
import { CalendarHeader } from '@/components/calendar/CalendarHeader'
import { DayView } from '@/components/calendar/DayView'
import { WeekView } from '@/components/calendar/WeekView'
import { MonthView } from '@/components/calendar/MonthView'
import { Sidebar } from '@/components/Sidebar'
import { ChoreForm } from '@/components/chores/ChoreForm'
import { FamilyPanel } from '@/components/family/FamilyPanel'
import { CategoryPanel } from '@/components/categories/CategoryPanel'
import type { CalendarView, ChoreOccurrence, Chore } from '@/types'

type Modal =
  | { type: 'add-chore'; date?: Date }
  | { type: 'edit-chore'; chore: Chore }
  | { type: 'family' }
  | { type: 'categories' }

export default function App() {
  const [view, setView] = useState<CalendarView>('day')
  const [date, setDate] = useState(new Date())
  const [modal, setModal] = useState<Modal | null>(null)

  const { data: occurrences = [], isLoading, isError } = useCalendarQuery(date, view)
  const { data: members = [] } = useFamilyMembers()
  const { data: categories = [] } = useCategories()
  const toggleMutation = useToggleComplete()

  function navigate(direction: 'prev' | 'next') {
    const fn = direction === 'prev'
      ? { day: subDays, week: subWeeks, month: subMonths }
      : { day: addDays, week: addWeeks, month: addMonths }
    setDate(d => fn[direction][view](d, 1))
  }

  function handleToggle(o: ChoreOccurrence) {
    toggleMutation.mutate({ id: o.id, date: o.date, completed: o.is_completed })
  }

  function handleEdit(o: ChoreOccurrence) {
    // We need the full Chore object; build a minimal one from the occurrence
    const chore: Chore = {
      id: o.id,
      name: o.name,
      description: o.description,
      category: o.category?.id ?? null,
      category_detail: o.category,
      priority: o.priority,
      assignee: o.assignee?.id ?? null,
      assignee_detail: o.assignee,
      recurrence_type: o.recurrence_type,
      recurrence_days: o.recurrence_days,
      recurrence_day_of_month: o.recurrence_day_of_month,
      start_date: o.start_date,
      is_active: true,
      created_at: '',
      updated_at: '',
    }
    setModal({ type: 'edit-chore', chore })
  }

  function handleSelectDay(d: Date) {
    setDate(d)
    setView('day')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        members={members}
        categories={categories}
        onManageFamily={() => setModal({ type: 'family' })}
        onManageCategories={() => setModal({ type: 'categories' })}
        onAddChore={() => setModal({ type: 'add-chore', date })}
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 border-b border-surface-600">
          <CalendarHeader
            date={date}
            view={view}
            onViewChange={setView}
            onPrev={() => navigate('prev')}
            onNext={() => navigate('next')}
            onToday={() => setDate(new Date())}
          />
        </div>

        <div className="flex-1 overflow-auto p-4">
          {isLoading && (
            <div className="flex items-center justify-center h-40">
              <span className="text-slate-500 text-sm">Loading…</span>
            </div>
          )}
          {isError && (
            <div className="flex items-center justify-center h-40">
              <span className="text-red-400 text-sm">Failed to load chores. Is the server running?</span>
            </div>
          )}
          {!isLoading && !isError && (
            <>
              {view === 'day' && (
                <DayView
                  date={date}
                  occurrences={occurrences}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                />
              )}
              {view === 'week' && (
                <div className="h-full">
                  <WeekView
                    date={date}
                    occurrences={occurrences}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                    onSelectDay={handleSelectDay}
                  />
                </div>
              )}
              {view === 'month' && (
                <div className="h-full">
                  <MonthView
                    date={date}
                    occurrences={occurrences}
                    onSelectDay={handleSelectDay}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modals */}
      {modal?.type === 'add-chore' && (
        <ChoreForm
          initialDate={modal.date ?? date}
          categories={categories}
          members={members}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'edit-chore' && (
        <ChoreForm
          chore={modal.chore}
          categories={categories}
          members={members}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'family' && (
        <FamilyPanel members={members} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'categories' && (
        <CategoryPanel categories={categories} onClose={() => setModal(null)} />
      )}
    </div>
  )
}
