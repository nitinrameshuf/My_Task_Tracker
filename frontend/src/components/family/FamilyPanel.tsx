import { useState } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { Modal } from '@/components/ui/Modal'
import { ColorPicker } from '@/components/ui/ColorPicker'
import { api } from '@/api/client'
import type { FamilyMember } from '@/types'

interface FamilyPanelProps {
  members: FamilyMember[]
  onClose: () => void
}

export function FamilyPanel({ members, onClose }: FamilyPanelProps) {
  const qc = useQueryClient()
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

  const addMutation = useMutation({
    mutationFn: () => api.createFamilyMember({ name: name.trim(), color }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['family-members'] }); setName('') },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id }: { id: number }) => api.updateFamilyMember(id, { name: editName, color: editColor }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['family-members'] }); setEditingId(null) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteFamilyMember(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['family-members'] }),
  })

  function startEdit(m: FamilyMember) {
    setEditingId(m.id); setEditName(m.name); setEditColor(m.color)
  }

  return (
    <Modal title="Family Members" onClose={onClose}>
      {/* Add form */}
      <div className="mb-5">
        <p className="text-xs text-slate-400 mb-2">Add member</p>
        <input
          className="w-full bg-surface-700 border border-surface-500 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 mb-2"
          placeholder="Name"
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

      {/* Member list */}
      <div className="space-y-2">
        {members.map(m => (
          <div key={m.id} className="bg-surface-700 rounded-lg p-3">
            {editingId === m.id ? (
              <div className="space-y-2">
                <input
                  className="w-full bg-surface-600 border border-surface-500 rounded px-2 py-1 text-slate-100 text-sm focus:outline-none"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
                <ColorPicker value={editColor} onChange={setEditColor} />
                <div className="flex gap-2">
                  <button
                    onClick={() => updateMutation.mutate({ id: m.id })}
                    className="px-3 py-1 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-500"
                  >Save</button>
                  <button onClick={() => setEditingId(null)} className="px-3 py-1 text-sm rounded border border-surface-500 text-slate-400">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-slate-200">{m.name}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(m)} className="text-xs text-slate-400 hover:text-slate-200">Edit</button>
                  <button
                    onClick={() => { if (confirm(`Remove ${m.name}?`)) deleteMutation.mutate(m.id) }}
                    className="text-xs text-red-400 hover:text-red-300"
                  >Remove</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {members.length === 0 && <p className="text-sm text-slate-500">No family members yet.</p>}
      </div>
    </Modal>
  )
}
