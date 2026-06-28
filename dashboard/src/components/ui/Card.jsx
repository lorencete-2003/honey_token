import { cn } from '../../utils/cn'

export function Card({ className, children, hover = true }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card shadow-md transition-all duration-300',
        hover && 'hover:shadow-xl hover:-translate-y-0.5',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardContent({ className, children }) {
  return <div className={cn('p-6', className)}>{children}</div>
}
