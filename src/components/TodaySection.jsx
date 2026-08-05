import { dosesBySlot, isTaken, todayKey } from '../model.js'

export default function TodaySection({ meds, log, onToggle }) {
  const groups = dosesBySlot(meds)
  const today = todayKey()

  if (groups.length === 0) return null

  return (
    <section className="today">
      <h2 className="section-title">Today’s doses</h2>
      <div className="slot-grid">
        {groups.map(({ slot, doses }) => (
          <div key={slot.id} className="slot-card">
            <div className="slot-header">
              <span className="slot-icon">{slot.icon}</span>
              <div>
                <h3>{slot.label}</h3>
                <span className="slot-hint">{slot.hint}</span>
              </div>
            </div>
            <ul className="dose-list">
              {doses.map(({ med }) => {
                const taken = isTaken(log, today, med.id, slot.id)
                return (
                  <li key={med.id}>
                    <button
                      className={`dose-item ${taken ? 'taken' : ''}`}
                      onClick={() => onToggle(med.id, slot.id)}
                      aria-pressed={taken}
                    >
                      <span
                        className="dose-check"
                        style={{ borderColor: med.color, background: taken ? med.color : 'transparent' }}
                      >
                        {taken ? '✓' : ''}
                      </span>
                      <span className="dose-info">
                        <span className="dose-name">{med.name}</span>
                        <span className="dose-detail">
                          {med.pillsPerDose} × {med.dosage || 'pill'}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
