import { cn } from '../../utils/cn'

export function Badge({ className, children, variant = 'default', pulse = false }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-mono uppercase tracking-[0.15em]',
        variant === 'default' && 'border-accent/30 bg-accent/5 text-accent',
        variant === 'live' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600',
        variant === 'alert' && 'border-rose-500/30 bg-rose-500/10 text-rose-600',
        className
      )}
    >
      {pulse && <span className="h-2 w-2 rounded-full bg-current animate-pulse-dot" />}
      {children}
    </span>
  )
}
