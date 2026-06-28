import { Shield } from 'lucide-react'
import { Badge } from '../ui/Badge'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-bg shadow-accent">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl tracking-tight text-foreground">
              Honeytoken Engine
            </h1>
            <p className="text-xs text-muted-foreground">Sistema de detección de intrusiones</p>
          </div>
        </div>
        <Badge pulse variant="live">Sistema activo</Badge>
      </div>
    </header>
  )
}
