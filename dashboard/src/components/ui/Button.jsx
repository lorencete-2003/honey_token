import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'h-12 px-6 text-white bg-gradient-to-r from-accent to-accent-secondary shadow-sm hover:-translate-y-0.5 hover:shadow-accent hover:brightness-110',
        secondary:
          'h-12 px-6 text-foreground bg-transparent border border-border hover:bg-muted hover:border-accent/30 hover:shadow-md',
        ghost:
          'h-12 px-6 text-muted-foreground hover:text-foreground',
      },
      size: {
        default: 'h-12 px-6 text-base',
        sm: 'h-10 px-4 text-sm rounded-lg',
        lg: 'h-14 px-8 text-lg rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

export function Button({ className, variant, size, children, ...props }) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </button>
  )
}
