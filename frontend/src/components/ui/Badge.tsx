interface BadgeProps {
  label: string
  color?: string
  className?: string
}

export function Badge({ label, color, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${className}`}
      style={color ? { backgroundColor: color + '33', color } : undefined}
    >
      {label}
    </span>
  )
}
