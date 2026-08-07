export interface StatCardProps {
  label: string
  value: string
  delta?: string
  className?: string
}

/* Figma Stat Card (1:256): glass, radius 16, overline / H3 / caption. */
export function StatCard({ label, value, delta, className = '' }: StatCardProps) {
  return (
    <div
      className={`flex h-[120px] flex-col gap-2 rounded-lg border border-border-subtle bg-surface-glass px-6 py-5 ${className}`}
    >
      <span className="text-overline text-text-muted">{label}</span>
      <span className="text-h3 text-text-primary">{value}</span>
      {delta && <span className="text-caption text-text-muted">{delta}</span>}
    </div>
  )
}
