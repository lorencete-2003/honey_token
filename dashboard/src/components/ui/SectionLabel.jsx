import { Badge } from './Badge'

export function SectionLabel({ children, pulse = false }) {
  return (
    <Badge pulse={pulse} className="mb-5">
      {children}
    </Badge>
  )
}
