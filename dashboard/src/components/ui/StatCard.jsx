import { motion } from 'framer-motion'
import { Card, CardContent } from './Card'

export function StatCard({ label, value, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="h-full">
        <CardContent>
          <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
          <div className="mt-2 text-4xl font-display tracking-tight text-foreground">
            {value}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
