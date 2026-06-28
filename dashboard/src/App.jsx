import { useEffect, useState } from 'react'

const API = '/api'

function App() {
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
        fetch(`${API}/stats/`).then(r => r.json()),
        fetch(`${API}/tokens/`).then(r => r.json()),
        fetch(`${API}/events/?limit=20`).then(r => r.json()),
        fetch(`${API}/alerts/?limit=20`).then(r => r.json()),
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

  const statCards = stats ? [
    { label: 'Tokens totales', value: stats.total_tokens },
    { label: 'Activos', value: stats.active_tokens },
    { label: 'Triggered', value: stats.triggered_tokens },
    { label: 'Eventos', value: stats.total_events },
    { label: 'Alertas abiertas', value: stats.open_alerts },
  ] : []

  return (
    <div className="app">
      <header>
        <h1>🍯 Honeytoken Engine</h1>
        <span className="badge">MVP</span>
      </header>

      {error && <div style={{ color: '#f87171', marginBottom: '1rem' }}>{error}</div>}

      <div className="grid">
        {statCards.map(c => (
          <div className="card" key={c.label}>
            <h3>{c.label}</h3>
            <div className="value">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="section">
        <h2>Tokens activos</h2>
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Nombre</th>
              <th>Contexto</th>
              <th>Estado</th>
              <th>Ubicación</th>
              <th>Fingerprint</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map(t => (
              <tr key={t.id}>
                <td><code>{t.token_type}</code></td>
                <td>{t.name}</td>
                <td>{t.context}</td>
                <td><span className={`status ${t.status}`}>{t.status}</span></td>
                <td>{t.location}</td>
                <td><code>{t.fingerprint}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section">
        <h2>Eventos recientes</h2>
        <table>
          <thead>
            <tr>
              <th>Hora</th>
              <th>Token</th>
              <th>Tipo</th>
              <th>IP origen</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {events.map(e => (
              <tr key={e.id}>
                <td>{new Date(e.timestamp).toLocaleString()}</td>
                <td><code>{e.token_id.slice(0, 8)}</code></td>
                <td>{e.event_type}</td>
                <td>{e.source_ip}</td>
                <td><code>{JSON.stringify(e.details).slice(0, 80)}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section">
        <h2>Alertas</h2>
        <table>
          <thead>
            <tr>
              <th>Hora</th>
              <th>Token</th>
              <th>Score</th>
              <th>Estado</th>
              <th>Canales</th>
              <th>Mensaje</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map(a => (
              <tr key={a.id}>
                <td>{new Date(a.sent_at).toLocaleString()}</td>
                <td><code>{a.token_id.slice(0, 8)}</code></td>
                <td>{a.score}</td>
                <td>{a.status}</td>
                <td>{a.channels.join(', ')}</td>
                <td>{a.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App
