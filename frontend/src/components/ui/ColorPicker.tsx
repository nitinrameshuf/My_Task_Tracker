const PALETTE = [
  '#f97316', '#a855f7', '#3b82f6', '#22c55e', '#ef4444',
  '#eab308', '#06b6d4', '#ec4899', '#6366f1', '#64748b',
]

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PALETTE.map(c => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`w-7 h-7 rounded-full border-2 transition-transform ${value === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
          style={{ backgroundColor: c }}
        />
      ))}
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-7 h-7 rounded-full cursor-pointer bg-transparent border-0 p-0"
        title="Custom color"
      />
    </div>
  )
}
