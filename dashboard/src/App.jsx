import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, AlertTriangle, FileKey, Radio, Shield } from 'lucide-react'

import { Header } from './components/layout/Header'
import { Section } from './components/layout/Section'
import { SectionLabel } from './components/ui/SectionLabel'
import { StatCard } from './components/ui/StatCard'
import { Card, CardContent } from './components/ui/Card'
import { Badge } from './components/ui/Badge'
import { Button } from './components/ui/Button'

const API = '/api'

const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        status === 'active'
          ? 'bg-emerald-100 text-emerald-700'
          : status === 'triggered'
          ? 'bg-rose-100 text-rose-700'
          : 'bg-slate-100 text-slate-700'
      }`}
    >
      {status}
    </span>
  )
}

export default function App() {
  const [stats, setStats] = useState(null)
  const [tokens, setTokens] = useState([])
  const [events, setEvents] = useState([])
  const [alerts, setAlerts] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 5000)
    return () => clearInterval(id)
  }, [])

  async function fetchData() {
    try {
      const [s, t, e, a] = await Promise.all([
        fetch(`${API}/stats/`).then((r) => r.json()),
        fetch(`${API}/tokens/`).then((r) => r.json()),
        fetch(`${API}/events/?limit=20`).then((r) => r.json()),
        fetch(`${API}/alerts/?limit=20`).then((r) => r.json()),
      ])
      setStats(s)
      setTokens(t)
      setEvents(e)
      setAlerts(a)
      setError(null)
    } catch (err) {
      setError('No se pudo conectar con la API. ¿Está corriendo en :8000?')
    }
  }

  const statCards = stats
    ? [
        { label: 'Tokens totales', value: stats.total_tokens, icon: FileKey },
        { label: 'Activos', value: stats.active_tokens, icon: Activity },
        { label: 'Triggered', value: stats.triggered_tokens, icon: Radio },
        { label: 'Alertas abiertas', value: stats.open_alerts, icon: AlertTriangle },
      ]
    : []

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <Section className="pt-24 lg:pt-32">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeInUp}>
              <SectionLabel pulse>Panel de control</SectionLabel>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="font-display text-[2.75rem] leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[5.25rem]"
            >
              Detecta intrusiones con{' '}
              <span className="gradient-text">honeytokens</span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
            >
              Genera credenciales y archivos falsos, inyéctalos en tu infraestructura y recibe
              alertas cuando un atacante los toque.
            </motion.p>
            <motion.div variants={fadeInUp} className="mt-8 flex flex-wrap gap-4">
              <Button>Explorar tokens</Button>
              <Button variant="secondary">Ver documentación</Button>
            </motion.div>
          </motion.div>

          {/* Hero graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block"
          >
            <div className="relative mx-auto aspect-square max-w-md">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-accent/20 animate-spin-slow" />
              <div className="absolute inset-8 rounded-full border border-border bg-card shadow-xl" />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-1/2 top-1/2 z-10 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl gradient-bg shadow-accent-lg"
              >
                <Shield className="h-12 w-12 text-white" />
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -right-4 top-12 rounded-xl bg-card p-4 shadow-lg border border-border"
              >
                <Badge variant="alert">Alerta crítica</Badge>
                <p className="mt-2 text-sm font-mono text-muted-foreground">score: 95%</p>
              </motion.div>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -left-4 bottom-12 rounded-xl bg-card p-4 shadow-lg border border-border"
              >
                <Badge variant="live">Token activo</Badge>
                <p className="mt-2 text-sm font-mono text-muted-foreground">aws-staging-001</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Stats */}
      <Section className="py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {statCards.map((card, i) => (
            <StatCard key={card.label} label={card.label} value={card.value} index={i} />
          ))}
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700"
          >
            {error}
          </motion.div>
        )}
      </Section>

      {/* Tokens */}
      <Section inverted>
        <div className="relative">
          <div className="absolute -left-32 top-0 h-64 w-64 rounded-full bg-accent/5 blur-[120px]" />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15, margin: '-60px' }}
            variants={stagger}
          >
            <motion.div variants={fadeInUp}>
              <SectionLabel>Tokens</SectionLabel>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="font-display text-3xl tracking-tight text-background lg:text-[3.25rem]"
            >
              Sensores <span className="gradient-text">activos</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15, margin: '-60px' }}
            variants={stagger}
            className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            {tokens.length === 0 && (
              <Card className="md:col-span-2 xl:col-span-3">
                <CardContent className="text-center text-muted-foreground">
                  No hay tokens creados todavía.
                </CardContent>
              </Card>
            )}
            {tokens.map((t) => (
              <motion.div key={t.id} variants={fadeInUp}>
                <Card className="h-full">
                  <CardContent>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                          {t.token_type}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold">{t.name}</h3>
                      </div>
                      <StatusBadge status={t.status} />
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{t.location || 'Sin ubicación'}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                      <code className="rounded bg-muted px-2 py-1 text-xs text-foreground">
                        {t.fingerprint}
                      </code>
                      <span className="text-xs text-muted-foreground">{t.context}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* Events */}
      <Section>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15, margin: '-60px' }}
          variants={stagger}
        >
          <motion.div variants={fadeInUp}>
            <SectionLabel pulse>Actividad</SectionLabel>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="font-display text-3xl tracking-tight text-foreground lg:text-[3.25rem]"
          >
            Eventos <span className="gradient-text">recientes</span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15, margin: '-60px' }}
          variants={stagger}
          className="mt-10"
        >
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-6 py-4 font-mono text-xs uppercase tracking-wider">Hora</th>
                    <th className="px-6 py-4 font-mono text-xs uppercase tracking-wider">Token</th>
                    <th className="px-6 py-4 font-mono text-xs uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-4 font-mono text-xs uppercase tracking-wider">IP</th>
                    <th className="px-6 py-4 font-mono text-xs uppercase tracking-wider">Detalles</th>
                  </tr>
                </thead>
                <tbody>
                  {events.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        Sin eventos registrados.
                      </td>
                    </tr>
                  )}
                  {events.map((e) => (
                    <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                        {new Date(e.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <code className="rounded bg-muted px-2 py-1 text-xs">{e.token_id.slice(0, 8)}</code>
                      </td>
                      <td className="px-6 py-4">
                        <Badge>{e.event_type}</Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{e.source_ip}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {JSON.stringify(e.details).slice(0, 60)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </motion.div>
      </Section>

      {/* Alerts */}
      <Section inverted className="pb-28">
        <div className="relative">
          <div className="absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-accent/5 blur-[120px]" />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15, margin: '-60px' }}
            variants={stagger}
          >
            <motion.div variants={fadeInUp}>
              <SectionLabel variant="alert">Seguridad</SectionLabel>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="font-display text-3xl tracking-tight text-background lg:text-[3.25rem]"
            >
              Alertas <span className="gradient-text">críticas</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15, margin: '-60px' }}
            variants={stagger}
            className="mt-10 grid gap-5 md:grid-cols-2"
          >
            {alerts.length === 0 && (
              <Card className="md:col-span-2">
                <CardContent className="text-center text-muted-foreground">
                  No hay alertas abiertas. Todo tranquilo.
                </CardContent>
              </Card>
            )}
            {alerts.map((a) => (
              <motion.div key={a.id} variants={fadeInUp}>
                <div className="gradient-border h-full">
                  <div className="gradient-border-inner h-full p-6">
                    <div className="flex items-center justify-between">
                      <Badge variant="alert">{a.status}</Badge>
                      <span className="font-mono text-xs text-muted-foreground">
                        score {a.score}
                      </span>
                    </div>
                    <p className="mt-3 text-foreground">{a.message}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <code className="rounded bg-muted px-2 py-1">{a.token_id.slice(0, 8)}</code>
                      <span>•</span>
                      <span>{new Date(a.sent_at).toLocaleString()}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {a.channels.map((ch) => (
                        <span
                          key={ch}
                          className="rounded-full bg-accent/10 px-2 py-1 text-xs font-medium text-accent"
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* Footer CTA */}
      <Section className="py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
          className="rounded-3xl gradient-bg p-10 text-center text-white shadow-accent-lg lg:p-16"
        >
          <motion.h2 variants={fadeInUp} className="font-display text-3xl lg:text-5xl">
            ¿Listo para expandir la red de señuelos?
          </motion.h2>
          <motion.p variants={fadeInUp} className="mx-auto mt-4 max-w-xl text-white/80">
            Crea nuevos tokens, vigila archivos canario y conecta alertas a tus canales favoritos.
          </motion.p>
          <motion.div variants={fadeInUp} className="mt-8">
            <Button className="bg-white text-accent hover:bg-white/90 hover:shadow-xl">
              Crear nuevo token
            </Button>
          </motion.div>
        </motion.div>
      </Section>
    </div>
  )
}
