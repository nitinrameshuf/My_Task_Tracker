export type Priority = 'high' | 'medium' | 'low'
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly'

export interface FamilyMember {
  id: number
  name: string
  color: string
  created_at: string
}

export interface Category {
  id: number
  name: string
  color: string
  created_at: string
}

export interface Chore {
  id: number
  name: string
  description: string
  category: number | null
  category_detail: Category | null
  priority: Priority
  assignee: number | null
  assignee_detail: FamilyMember | null
  recurrence_type: RecurrenceType
  recurrence_days: number[]
  recurrence_day_of_month: number | null
  start_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ChoreOccurrence {
  id: number
  name: string
  description: string
  priority: Priority
  category: Category | null
  assignee: FamilyMember | null
  recurrence_type: RecurrenceType
  recurrence_days: number[]
  recurrence_day_of_month: number | null
  start_date: string
  date: string
  is_completed: boolean
  is_overdue: boolean
  overdue_from: string | null
}

export interface ChoreFormData {
  name: string
  description: string
  category: number | null
  priority: Priority
  assignee: number | null
  recurrence_type: RecurrenceType
  recurrence_days: number[]
  recurrence_day_of_month: number | null
  start_date: string
}

export type CalendarView = 'day' | 'week' | 'month'
