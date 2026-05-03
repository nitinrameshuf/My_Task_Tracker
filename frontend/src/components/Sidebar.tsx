import type { FamilyMember, Category } from '@/types'

interface SidebarProps {
  members: FamilyMember[]
  categories: Category[]
  onManageFamily: () => void
  onManageCategories: () => void
  onAddChore: () => void
}

export function Sidebar({ members, categories, onManageFamily, onManageCategories, onAddChore }: SidebarProps) {
  return (
    <aside className="w-56 flex-shrink-0 bg-surface-800 border-r border-surface-600 flex flex-col">
      {/* App title */}
      <div className="px-4 py-5 border-b border-surface-600">
        <h1 className="text-lg font-bold text-slate-100">Home Chores</h1>
        <p className="text-xs text-slate-500 mt-0.5">Family task board</p>
      </div>

      {/* Add chore CTA */}
      <div className="px-3 pt-4">
        <button
          onClick={onAddChore}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
            <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          Add Chore
        </button>
      </div>

      {/* Family members */}
      <div className="px-3 pt-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Family</span>
          <button onClick={onManageFamily} className="text-xs text-slate-400 hover:text-slate-200 transition-colors">Manage</button>
        </div>
        <div className="space-y-1">
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
              <span className="text-sm text-slate-300 truncate">{m.name}</span>
            </div>
          ))}
          {members.length === 0 && (
            <p className="text-xs text-slate-600 px-2">No members yet</p>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="px-3 pt-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Categories</span>
          <button onClick={onManageCategories} className="text-xs text-slate-400 hover:text-slate-200 transition-colors">Manage</button>
        </div>
        <div className="space-y-1">
          {categories.map(c => (
            <div key={c.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
              <span className="text-sm text-slate-300 truncate">{c.name}</span>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-xs text-slate-600 px-2">No categories yet</p>
          )}
        </div>
      </div>

      {/* Priority legend */}
      <div className="px-3 mt-auto pb-5 pt-4 border-t border-surface-600">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Priority</p>
        <div className="space-y-1">
          {[
            { label: 'High', color: '#f97316' },
            { label: 'Medium', color: '#a855f7' },
            { label: 'Low', color: '#3b82f6' },
            { label: 'Done', color: '#22c55e' },
            { label: 'Overdue', color: '#dc2626' },
          ].map(p => (
            <div key={p.label} className="flex items-center gap-2 px-2">
              <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: p.color + '80', borderLeft: `3px solid ${p.color}` }} />
              <span className="text-xs text-slate-400">{p.label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
