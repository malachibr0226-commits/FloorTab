import {
  daysOfSupply,
  daysUntil,
  formatDateKey,
  medStatus,
  pillsPerDay,
  SLOTS,
} from '../model.js'

function SupplyBar({ med }) {
  const days = daysOfSupply(med)
  const pct = Math.min(100, (days / 30) * 100)
  const status = medStatus(med)
  const color =
    status.severity === 'danger' ? '#d63031' : status.severity === 'warning' ? '#e17055' : '#00b894'
  return (
    <div className="supply">
      <div className="supply-meta">
        <span>
          {med.pillsRemaining} pills left · {pillsPerDay(med)}/day
        </span>
        <span className={`supply-days severity-${status.severity}`}>
          {Number.isFinite(days) ? `${days}d supply` : '∞'}
        </span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export default function MedList({ meds, onEdit, onRefillArrived }) {
  return (
    <section className="med-list">
      <h2 className="section-title">My pills</h2>
      <div className="med-grid">
        {meds.map((med) => {
          const refillIn = med.nextRefillDate ? daysUntil(med.nextRefillDate) : null
          return (
            <article key={med.id} className="med-card" style={{ '--med-color': med.color }}>
              <div className="med-card-top">
                <span className="med-dot" />
                <div className="med-title">
                  <h3>{med.name}</h3>
                  <span className="med-dosage">{med.dosage}</span>
                </div>
                <button className="btn btn-small btn-ghost" onClick={() => onEdit(med)}>
                  Edit
                </button>
              </div>

              <div className="med-slots">
                {SLOTS.filter((s) => med.slots.includes(s.id)).map((s) => (
                  <span key={s.id} className="chip">
                    {s.icon} {s.label}
                  </span>
                ))}
              </div>

              <SupplyBar med={med} />

              <div className="med-refill">
                <span>
                  📦 Next refill:{' '}
                  <strong>
                    {med.nextRefillDate ? formatDateKey(med.nextRefillDate) : '—'}
                  </strong>
                  {refillIn !== null && (
                    <span className="refill-in">
                      {' '}
                      ({refillIn === 0 ? 'today' : refillIn < 0 ? `${-refillIn}d overdue` : `in ${refillIn}d`})
                    </span>
                  )}
                </span>
                <button
                  className="btn btn-small btn-outline"
                  onClick={() => onRefillArrived(med.id)}
                  title={`Add ${med.refillQuantity} pills and schedule the next refill in ${med.refillEveryDays} days`}
                >
                  Refill arrived (+{med.refillQuantity})
                </button>
              </div>

              {med.notes && <p className="med-notes">{med.notes}</p>}
            </article>
          )
        })}
      </div>
    </section>
  )
}
