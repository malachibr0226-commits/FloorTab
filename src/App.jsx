import { useEffect, useMemo, useState } from 'react'
import { loadState, saveState } from './storage.js'
import {
  countDosesForDay,
  currentStreak,
  sampleMeds,
  todayKey,
  weeklyAdherence,
} from './model.js'
import AlertsBanner from './components/AlertsBanner.jsx'
import TodaySection from './components/TodaySection.jsx'
import MedList from './components/MedList.jsx'
import MedFormModal from './components/MedFormModal.jsx'

export default function App() {
  const [state, setState] = useState(() => loadState() ?? { meds: [], log: {} })
  const [formTarget, setFormTarget] = useState(null) // null | 'new' | med object

  useEffect(() => {
    saveState(state)
  }, [state])

  const { meds, log } = state
  const today = todayKey()

  const stats = useMemo(() => {
    const { expected, taken } = countDosesForDay(meds, log, today)
    return {
      expected,
      taken,
      streak: currentStreak(meds, log),
      adherence: weeklyAdherence(meds, log),
    }
  }, [meds, log, today])

  function toggleDose(medId, slotId) {
    setState((prev) => {
      const wasTaken = Boolean(prev.log[today]?.[medId]?.[slotId])
      const med = prev.meds.find((m) => m.id === medId)
      if (!med) return prev

      const dayLog = { ...(prev.log[today] ?? {}) }
      const medLog = { ...(dayLog[medId] ?? {}) }
      if (wasTaken) {
        delete medLog[slotId]
      } else {
        medLog[slotId] = true
      }
      dayLog[medId] = medLog

      const delta = wasTaken ? med.pillsPerDose : -med.pillsPerDose
      return {
        meds: prev.meds.map((m) =>
          m.id === medId
            ? { ...m, pillsRemaining: Math.max(0, m.pillsRemaining + delta) }
            : m,
        ),
        log: { ...prev.log, [today]: dayLog },
      }
    })
  }

  function saveMed(med) {
    setState((prev) => {
      const exists = prev.meds.some((m) => m.id === med.id)
      return {
        ...prev,
        meds: exists
          ? prev.meds.map((m) => (m.id === med.id ? med : m))
          : [...prev.meds, med],
      }
    })
    setFormTarget(null)
  }

  function deleteMed(medId) {
    setState((prev) => ({
      ...prev,
      meds: prev.meds.filter((m) => m.id !== medId),
    }))
    setFormTarget(null)
  }

  function markRefillArrived(medId) {
    setState((prev) => ({
      ...prev,
      meds: prev.meds.map((m) => {
        if (m.id !== medId) return m
        const next = new Date()
        next.setDate(next.getDate() + m.refillEveryDays)
        const y = next.getFullYear()
        const mo = String(next.getMonth() + 1).padStart(2, '0')
        const d = String(next.getDate()).padStart(2, '0')
        return {
          ...m,
          pillsRemaining: m.pillsRemaining + m.refillQuantity,
          nextRefillDate: `${y}-${mo}-${d}`,
        }
      }),
    }))
  }

  function loadSampleData() {
    setState({ meds: sampleMeds(), log: {} })
  }

  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1 className="logo">
            <span className="logo-pill">💊</span> PillPal
          </h1>
          <p className="date-label">{dateLabel}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setFormTarget('new')}>
          + Add pill
        </button>
      </header>

      {meds.length === 0 ? (
        <div className="empty-state">
          <div className="empty-emoji">🧴</div>
          <h2>No pills yet</h2>
          <p>
            Add the pills and supplements you get on subscription. PillPal tracks
            your daily doses, counts down your supply, and reminds you before you
            run out.
          </p>
          <div className="empty-actions">
            <button className="btn btn-primary" onClick={() => setFormTarget('new')}>
              + Add your first pill
            </button>
            <button className="btn btn-ghost" onClick={loadSampleData}>
              Try with sample data
            </button>
          </div>
        </div>
      ) : (
        <>
          <AlertsBanner meds={meds} onRefillArrived={markRefillArrived} />

          <section className="stats-row">
            <div className="stat-card">
              <span className="stat-value">
                {stats.taken}/{stats.expected}
              </span>
              <span className="stat-label">doses today</span>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: stats.expected
                      ? `${(stats.taken / stats.expected) * 100}%`
                      : '0%',
                  }}
                />
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {stats.streak} <span className="stat-unit">🔥</span>
              </span>
              <span className="stat-label">day streak</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {stats.adherence === null ? '—' : `${stats.adherence}%`}
              </span>
              <span className="stat-label">last 7 days</span>
            </div>
          </section>

          <TodaySection meds={meds} log={log} onToggle={toggleDose} />

          <MedList
            meds={meds}
            onEdit={(med) => setFormTarget(med)}
            onRefillArrived={markRefillArrived}
          />
        </>
      )}

      {formTarget !== null && (
        <MedFormModal
          med={formTarget === 'new' ? null : formTarget}
          onSave={saveMed}
          onDelete={deleteMed}
          onClose={() => setFormTarget(null)}
        />
      )}

      <footer className="app-footer">
        Data is stored locally in your browser. PillPal is a tracking aid, not
        medical advice.
      </footer>
    </div>
  )
}
