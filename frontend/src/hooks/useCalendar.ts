import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { api } from '@/api/client'
import type { CalendarView } from '@/types'

export function calendarRange(date: Date, view: CalendarView): { start: string; end: string } {
  if (view === 'day') {
    const d = format(date, 'yyyy-MM-dd')
    return { start: d, end: d }
  }
  if (view === 'week') {
    return {
      start: format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      end: format(endOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    }
  }
  return {
    start: format(startOfMonth(date), 'yyyy-MM-dd'),
    end: format(endOfMonth(date), 'yyyy-MM-dd'),
  }
}

export function useCalendarQuery(date: Date, view: CalendarView) {
  const { start, end } = calendarRange(date, view)
  return useQuery({
    queryKey: ['calendar', start, end],
    queryFn: () => api.getCalendar(start, end),
  })
}

export function useToggleComplete() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, date, completed }: { id: number; date: string; completed: boolean }) =>
      completed ? api.uncompleteChore(id, date) : api.completeChore(id, date),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calendar'] }),
  })
}

export function useFamilyMembers() {
  return useQuery({ queryKey: ['family-members'], queryFn: api.getFamilyMembers })
}

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: api.getCategories })
}

export function useChores() {
  return useQuery({ queryKey: ['chores'], queryFn: api.getChores })
}
