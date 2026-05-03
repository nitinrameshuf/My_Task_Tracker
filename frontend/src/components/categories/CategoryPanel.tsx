import { useState } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { Modal } from '@/components/ui/Modal'
import { ColorPicker } from '@/components/ui/ColorPicker'
import { api } from '@/api/client'
import type { Category } from '@/types'

interface CategoryPanelProps {
  categories: Category[]
  onClose: () => void
}

export function CategoryPanel({ categories, onClose }: CategoryPanelProps) {
  const qc = useQueryClient()
  const [name, setName] = useState('')
  const [color, setColor] = useState('#64748b')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

  const addMutation = useMutation({
    mutationFn: () => api.createCategory({ name: name.trim(), color }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setName('') },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id }: { id: number }) => api.updateCategory(id, { name: editName, color: editColor }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setEditingId(null) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })

  function startEdit(c: Category) {
    setEditingId(c.id); setEditName(c.name); setEditColor(c.color)
  }

  return (
    <Modal title="Categories" onClose={onClose}>
      {/* Add form */}
      <div className="mb-5">
        <p className="text-xs text-slate-400 mb-2">Add category</p>
        <input
          className="w-full bg-surface-700 border border-surface-500 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 mb-2"
          placeholder="e.g. Cleaning"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && name.trim()) addMutation.mutate() }}
        />
        <ColorPicker value={color} onChange={setColor} />
        <button
          onClick={() => { if (name.trim()) addMutation.mutate() }}
          disabled={!name.trim() || addMutation.isPending}
          className="mt-2 px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {/* Category list */}
      <div className="space-y-2">
        {categories.map(c => (
          <div key={c.id} className="bg-surface-700 rounded-lg p-3">
            {editingId === c.id ? (
              <div className="space-y-2">
                <input
                  className="w-full bg-surface-600 border border-surface-500 rounded px-2 py-1 text-slate-100 text-sm focus:outline-none"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
                <ColorPicker value={editColor} onChange={setEditColor} />
                <div className="flex gap-2">
                  <button
                    onClick={() => updateMutation.mutate({ id: c.id })}
                    className="px-3 py-1 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-500"
                  >Save</button>
                  <button onClick={() => setEditingId(null)} className="px-3 py-1 text-sm rounded border border-surface-500 text-slate-400">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-slate-200">{c.name}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(c)} className="text-xs text-slate-400 hover:text-slate-200">Edit</button>
                  <button
                    onClick={() => { if (confirm(`Delete "${c.name}"? Chores with this category will be unassigned.`)) deleteMutation.mutate(c.id) }}
                    className="text-xs text-red-400 hover:text-red-300"
                  >Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {categories.length === 0 && <p className="text-sm text-slate-500">No categories yet.</p>}
      </div>
    </Modal>
  )
}
