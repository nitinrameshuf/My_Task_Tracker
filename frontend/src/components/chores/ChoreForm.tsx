import { useState } from 'react'
import { format } from 'date-fns'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { Modal } from '@/components/ui/Modal'
import { api } from '@/api/client'
import type { Chore, ChoreFormData, Category, FamilyMember, Priority, RecurrenceType } from '@/types'

interface ChoreFormProps {
  initialDate?: Date
  chore?: Chore
  categories: Category[]
  members: FamilyMember[]
  onClose: () => void
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function ChoreForm({ initialDate, chore, categories, members, onClose }: ChoreFormProps) {
  const qc = useQueryClient()

  const [form, setForm] = useState<ChoreFormData>({
    name: chore?.name ?? '',
    description: chore?.description ?? '',
    category: chore?.category ?? null,
    priority: chore?.priority ?? 'medium',
    assignee: chore?.assignee ?? null,
    recurrence_type: chore?.recurrence_type ?? 'none',
    recurrence_days: chore?.recurrence_days ?? [],
    recurrence_day_of_month: chore?.recurrence_day_of_month ?? null,
    start_date: chore?.start_date ?? format(initialDate ?? new Date(), 'yyyy-MM-dd'),
  })

  const mutation = useMutation({
    mutationFn: (data: ChoreFormData) =>
      chore ? api.updateChore(chore.id, data) : api.createChore(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chores'] })
      qc.invalidateQueries({ queryKey: ['calendar'] })
      onClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteChore(chore!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chores'] })
      qc.invalidateQueries({ queryKey: ['calendar'] })
      onClose()
    },
  })

  function set<K extends keyof ChoreFormData>(key: K, value: ChoreFormData[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function toggleWeekday(day: number) {
    const days = form.recurrence_days.includes(day)
      ? form.recurrence_days.filter(d => d !== day)
      : [...form.recurrence_days, day]
    set('recurrence_days', days)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    mutation.mutate(form)
  }

  return (
    <Modal title={chore ? 'Edit Chore' : 'Add Chore'} onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">Name *</label>
          <input
            autoFocus
            className="w-full bg-surface-700 border border-surface-500 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. Vacuum living room"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">Description</label>
          <textarea
            rows={2}
            className="w-full bg-surface-700 border border-surface-500 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
            value={form.description}
            onChange={e => set('description', e.target.value)}
          />
        </div>

        {/* Priority + Category */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Priority</label>
            <select
              className="w-full bg-surface-700 border border-surface-500 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              value={form.priority}
              onChange={e => set('priority', e.target.value as Priority)}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Category</label>
            <select
              className="w-full bg-surface-700 border border-surface-500 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              value={form.category ?? ''}
              onChange={e => set('category', e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">None</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Assignee */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">Assign to</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => set('assignee', null)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${form.assignee === null ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' : 'border-surface-500 text-slate-400 hover:border-slate-400'}`}
            >
              Anyone
            </button>
            {members.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => set('assignee', m.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-colors ${form.assignee === m.id ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' : 'border-surface-500 text-slate-400 hover:border-slate-400'}`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* Start date */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">Start date</label>
          <input
            type="date"
            className="bg-surface-700 border border-surface-500 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            value={form.start_date}
            onChange={e => set('start_date', e.target.value)}
            required
          />
        </div>

        {/* Recurrence */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">Recurrence</label>
          <div className="flex gap-2 flex-wrap mb-2">
            {(['none', 'daily', 'weekly', 'monthly'] as RecurrenceType[]).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => set('recurrence_type', r)}
                className={`px-3 py-1.5 rounded-lg text-sm border capitalize transition-colors ${form.recurrence_type === r ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' : 'border-surface-500 text-slate-400 hover:border-slate-400'}`}
              >
                {r}
              </button>
            ))}
          </div>

          {form.recurrence_type === 'weekly' && (
            <div className="flex gap-1.5 mt-2">
              {WEEKDAYS.map((label, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleWeekday(i)}
                  className={`w-10 h-10 rounded-lg text-xs font-medium border transition-colors ${form.recurrence_days.includes(i) ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' : 'border-surface-500 text-slate-400 hover:border-slate-400'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {form.recurrence_type === 'monthly' && (
            <div className="mt-2">
              <label className="text-xs text-slate-400">Day of month</label>
              <input
                type="number"
                min={1}
                max={31}
                className="mt-1 w-24 bg-surface-700 border border-surface-500 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                value={form.recurrence_day_of_month ?? ''}
                onChange={e => set('recurrence_day_of_month', e.target.value ? Number(e.target.value) : null)}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-2">
          {chore ? (
            <button
              type="button"
              onClick={() => { if (confirm('Delete this chore?')) deleteMutation.mutate() }}
              className="px-4 py-2 text-sm rounded-lg border border-red-800 text-red-400 hover:bg-red-900/30 transition-colors"
            >
              Delete
            </button>
          ) : <div />}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-surface-500 text-slate-400 hover:bg-surface-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-5 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
            >
              {mutation.isPending ? 'Saving…' : chore ? 'Save' : 'Add Chore'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
