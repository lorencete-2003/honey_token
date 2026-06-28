import { cn } from '../../utils/cn'

export function Section({ children, className, inverted = false }) {
  return (
    <section
      className={cn(
        'relative overflow-hidden py-20 lg:py-28',
        inverted ? 'bg-foreground text-background' : 'bg-background',
        className
      )}
    >
      {inverted && <div className="absolute inset-0 dot-pattern" />}
      <div className="relative mx-auto max-w-7xl px-6">{children}</div>
    </section>
  )
}
