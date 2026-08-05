import { medStatus } from '../model.js'

const SEVERITY_ICON = { danger: '⛔', warning: '⚠️', info: '📦' }

export default function AlertsBanner({ meds, onRefillArrived }) {
  const alerts = meds
    .map((med) => ({ med, status: medStatus(med) }))
    .filter(({ status }) => status.severity !== 'ok')
    .sort((a, b) => {
      const order = { danger: 0, warning: 1, info: 2 }
      return order[a.status.severity] - order[b.status.severity]
    })

  if (alerts.length === 0) return null

  return (
    <section className="alerts" aria-label="Refill alerts">
      {alerts.map(({ med, status }) => (
        <div key={med.id} className={`alert alert-${status.severity}`}>
          <span className="alert-icon">{SEVERITY_ICON[status.severity]}</span>
          <span className="alert-text">
            <strong>{med.name}</strong> — {status.message}
          </span>
          <button
            className="btn btn-small btn-ghost"
            onClick={() => onRefillArrived(med.id)}
            title={`Add ${med.refillQuantity} pills and schedule the next refill`}
          >
            Refill arrived
          </button>
        </div>
      ))}
    </section>
  )
}
