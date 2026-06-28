import { useEffect, useState } from 'react'
import {
  Shield,
  Key,
  Activity,
  AlertTriangle,
  Zap,
  Clock,
  Server,
  FileText,
  Bell,
  Search,
  Filter,
  RefreshCw,
  ChevronRight,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Radio,
  Eye,
  Hash,
  MapPin,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react'

const API = '/api'

/* ─── utilidades ─── */
function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

function formatDate(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function timeAgo(iso) {
  if (!iso) return '-'
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'ahora'
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  return `${Math.floor(s / 86400)}d`
}

/* ─── componentes pequeños ─── */
function Badge({ children, variant = 'default', className }) {
  const styles = {
    default: 'bg-slate-100 text-slate-700',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    triggered: 'bg-rose-50 text-rose-700 border-rose-200',
    alert: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium', styles[variant] || styles.default, className)}>
      {children}
    </span>
  )
}

function Card({ children, className }) {
  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white shadow-sm', className)}>
      {children}
    </div>
  )
}

function StatBox({ label, value, change, changeType, icon: Icon }) {
  const changeColors = {
    up: 'text-emerald-600',
    down: 'text-rose-600',
    neutral: 'text-slate-400',
  }
  const ChangeIcon = changeType === 'up' ? ArrowUpRight : changeType === 'down' ? ArrowDownRight : Minus

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="rounded-lg bg-slate-50 p-2">
          <Icon className="h-5 w-5 text-slate-600" />
        </div>
        {change !== undefined && (
          <div className={cn('flex items-center gap-0.5 text-xs font-medium', changeColors[changeType])}>
            <ChangeIcon className="h-3.5 w-3.5" />
            {change}
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold tracking-tight text-slate-900">{value}</div>
        <div className="mt-0.5 text-sm text-slate-500">{label}</div>
      </div>
    </Card>
  )
}

/* ─── sidebar ─── */
function Sidebar({ activeTab, onTabChange }) {
  const items = [
    { id: 'overview', label: 'Vista general', icon: Activity },
    { id: 'tokens', label: 'Tokens', icon: Key },
    { id: 'events', label: 'Eventos', icon: Zap },
    { id: 'alerts', label: 'Alertas', icon: Bell },
  ]

  return (
    <aside className="flex w-56 flex-col border-r border-slate-200 bg-slate-50">
      <div className="flex items-center gap-2.5 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">Honeytoken</div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Engine</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {items.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              )}
            >
              <item.icon className={cn('h-4 w-4', isActive ? 'text-blue-600' : 'text-slate-400')} />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-xs font-bold text-blue-700">LR</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-900 truncate">Admin</div>
            <div className="text-xs text-slate-400 truncate">lorencete-2003</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

/* ─── vistas ─── */
function OverviewView({ stats, tokens, events, alerts }) {
  const recentTokens = tokens.slice(0, 5)
  const recentEvents = events.slice(0, 6)
  const recentAlerts = alerts.slice(0, 4)

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatBox label="Tokens totales" value={stats?.total_tokens ?? 0} icon={Key} />
        <StatBox label="Activos" value={stats?.active_tokens ?? 0} change="12%" changeType="up" icon={CheckCircle2} />
        <StatBox label="Triggered" value={stats?.triggered_tokens ?? 0} change="2" changeType="down" icon={AlertCircle} />
        <StatBox label="Alertas abiertas" value={stats?.open_alerts ?? 0} icon={Bell} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Tokens recientes */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <h3 className="text-sm font-semibold text-slate-900">Tokens recientes</h3>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700">Ver todos</button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentTokens.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-slate-400">No hay tokens creados</div>
            )}
            {recentTokens.map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50">
                <div className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg',
                  t.status === 'active' ? 'bg-emerald-50' : 'bg-rose-50'
                )}>
                  <Key className={cn('h-4 w-4', t.status === 'active' ? 'text-emerald-600' : 'text-rose-600')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 truncate">{t.name || t.token_type}</span>
                    <Badge variant={t.status === 'active' ? 'active' : 'triggered'}>
                      {t.status === 'active' ? 'Activo' : 'Triggered'}
                    </Badge>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Hash className="h-3 w-3" />{t.fingerprint?.slice(0, 8)}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{t.location || '—'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">{timeAgo(t.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Alertas rápidas */}
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <h3 className="text-sm font-semibold text-slate-900">Alertas</h3>
            <Badge variant="alert">{recentAlerts.length}</Badge>
          </div>
          <div className="divide-y divide-slate-100">
            {recentAlerts.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-slate-400">Sin alertas</div>
            )}
            {recentAlerts.map((a) => (
              <div key={a.id} className="px-5 py-3 hover:bg-slate-50">
                <div className="flex items-center justify-between">
                  <Badge variant={a.score > 80 ? 'alert' : 'info'}>{a.score > 80 ? 'Crítica' : 'Media'}</Badge>
                  <span className="text-xs text-slate-400">{timeAgo(a.sent_at)}</span>
                </div>
                <p className="mt-1.5 text-sm text-slate-700 line-clamp-2">{a.message}</p>
                <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-400">
                  <code className="rounded bg-slate-100 px-1.5 py-0.5">{a.token_id?.slice(0, 8)}</code>
                  <span>score {a.score}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Actividad reciente */}
      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Actividad reciente</h3>
          <button className="text-xs font-medium text-blue-600 hover:text-blue-700">Ver todo</button>
        </div>
        <div className="divide-y divide-slate-100">
          {recentEvents.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-slate-400">Sin eventos registrados</div>
          )}
          {recentEvents.map((e) => (
            <div key={e.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <Zap className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-900">{e.event_type}</span>
                  <Badge>{e.token_id?.slice(0, 8)}</Badge>
                </div>
                <div className="mt-0.5 text-xs text-slate-400">
                  {e.source_ip || '127.0.0.1'} • {JSON.stringify(e.details).slice(0, 50)}
                </div>
              </div>
              <div className="text-xs text-slate-400 whitespace-nowrap">{timeAgo(e.timestamp)}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function TokensView({ tokens }) {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? tokens : tokens.filter((t) => t.status === filter)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Tokens</h2>
          <p className="text-sm text-slate-500">Gestiona tus honeytokens y sensores</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Key className="h-4 w-4" />
          Nuevo token
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'active', label: 'Activos' },
            { id: 'triggered', label: 'Triggered' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                filter === tab.id ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3">Token</th>
                <th className="px-5 py-3">Tipo</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Ubicación</th>
                <th className="px-5 py-3">Contexto</th>
                <th className="px-5 py-3">Fingerprint</th>
                <th className="px-5 py-3">Creado</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400">No hay tokens</td>
                </tr>
              )}
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <div className="font-medium text-slate-900">{t.name || t.token_type}</div>
                    <code className="text-xs text-slate-400">{t.id?.slice(0, 8)}</code>
                  </td>
                  <td className="px-5 py-3">
                    <Badge>{t.token_type}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={t.status === 'active' ? 'active' : 'triggered'}>
                      {t.status === 'active' ? 'Activo' : 'Triggered'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{t.location || '—'}</td>
                  <td className="px-5 py-3 text-slate-500">{t.context || '—'}</td>
                  <td className="px-5 py-3">
                    <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{t.fingerprint?.slice(0, 12)}</code>
                  </td>
                  <td className="px-5 py-3 text-slate-400">{timeAgo(t.created_at)}</td>
                  <td className="px-5 py-3">
                    <button className="rounded p-1 hover:bg-slate-100">
                      <MoreHorizontal className="h-4 w-4 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function EventsView({ events }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Eventos</h2>
        <p className="text-sm text-slate-500">Registro de accesos y detecciones</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3">Hora</th>
                <th className="px-5 py-3">Token</th>
                <th className="px-5 py-3">Tipo</th>
                <th className="px-5 py-3">IP Origen</th>
                <th className="px-5 py-3">Proceso</th>
                <th className="px-5 py-3">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">Sin eventos</td>
                </tr>
              )}
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="text-slate-900">{formatDate(e.timestamp)}</div>
                    <div className="text-xs text-slate-400">{timeAgo(e.timestamp)}</div>
                  </td>
                  <td className="px-5 py-3">
                    <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{e.token_id?.slice(0, 8)}</code>
                  </td>
                  <td className="px-5 py-3">
                    <Badge>{e.event_type}</Badge>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{e.source_ip || '—'}</td>
                  <td className="px-5 py-3">
                    <code className="text-xs text-slate-500">{e.process_info?.pid || '—'}</code>
                  </td>
                  <td className="px-5 py-3 text-slate-500 max-w-xs truncate">
                    {JSON.stringify(e.details).slice(0, 60)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function AlertsView({ alerts }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Alertas</h2>
        <p className="text-sm text-slate-500">Notificaciones de seguridad</p>
      </div>

      <div className="grid gap-4">
        {alerts.length === 0 && (
          <Card className="p-8 text-center text-slate-400">No hay alertas abiertas</Card>
        )}
        {alerts.map((a) => (
          <Card key={a.id} className={cn('p-5', a.score > 80 ? 'border-l-4 border-l-amber-400' : '')}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant={a.score > 80 ? 'alert' : 'info'}>
                    {a.score > 80 ? 'Crítica' : 'Media'}
                  </Badge>
                  <span className="text-xs text-slate-400">score {a.score}</span>
                </div>
                <p className="mt-2 text-sm text-slate-700">{a.message}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Hash className="h-3 w-3" />{a.token_id?.slice(0, 8)}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(a.sent_at)}</span>
                </div>
                <div className="mt-2 flex gap-1.5">
                  {a.channels?.map((ch) => (
                    <span key={ch} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                  Revisar
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

/* ─── app principal ─── */
export default function App() {
  const [activeTab, setActiveTab] = useState('overview')
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
        fetch(`${API}/events/?limit=50`).then((r) => r.json()),
        fetch(`${API}/alerts/?limit=20`).then((r) => r.json()),
      ])
      setStats(s)
      setTokens(t)
      setEvents(e)
      setAlerts(a)
      setError(null)
    } catch (err) {
      setError('No se pudo conectar con la API. Asegúrate de que el backend está corriendo en :8000')
    }
  }

  const views = {
    overview: <OverviewView stats={stats} tokens={tokens} events={events} alerts={alerts} />,
    tokens: <TokensView tokens={tokens} />,
    events: <EventsView events={events} />,
    alerts: <AlertsView alerts={alerts} />,
  }

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-semibold text-slate-700 capitalize">
              {activeTab === 'overview' ? 'Vista general' : activeTab}
            </h1>
            {error && (
              <span className="flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600">
                <AlertCircle className="h-3 w-3" />
                API desconectada
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50" title="Refrescar">
              <RefreshCw className="h-4 w-4 text-slate-500" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <span className="text-xs font-bold text-blue-700">LR</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {views[activeTab]}
        </div>
      </main>
    </div>
  )
}
