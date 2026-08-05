import { useState } from 'react'
import { makeMed, MED_COLORS, SLOTS } from '../model.js'

export default function MedFormModal({ med, onSave, onDelete, onClose }) {
  const isNew = med === null
  const [draft, setDraft] = useState(() => (isNew ? makeMed() : { ...med }))
  const [error, setError] = useState('')

  function set(field, value) {
    setDraft((d) => ({ ...d, [field]: value }))
  }

  function toggleSlot(slotId) {
    setDraft((d) => {
      const has = d.slots.includes(slotId)
      const slots = has ? d.slots.filter((s) => s !== slotId) : [...d.slots, slotId]
      return { ...d, slots }
    })
  }

  function submit(e) {
    e.preventDefault()
    if (!draft.name.trim()) {
      setError('Give the pill a name.')
      return
    }
    if (draft.slots.length === 0) {
      setError('Pick at least one time of day.')
      return
    }
    onSave({
      ...draft,
      name: draft.name.trim(),
      dosage: draft.dosage.trim(),
      pillsPerDose: Math.max(1, Number(draft.pillsPerDose) || 1),
      pillsRemaining: Math.max(0, Number(draft.pillsRemaining) || 0),
      refillQuantity: Math.max(1, Number(draft.refillQuantity) || 1),
      refillEveryDays: Math.max(1, Number(draft.refillEveryDays) || 1),
    })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={isNew ? 'Add pill' : 'Edit pill'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{isNew ? 'Add a pill' : `Edit ${med.name}`}</h2>
          <button className="btn btn-ghost btn-small" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="med-form">
          <label className="field">
            <span>Name</span>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Vitamin D3"
              value={draft.name}
              onChange={(e) => set('name', e.target.value)}
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Dosage</span>
              <input
                type="text"
                placeholder="e.g. 2000 IU"
                value={draft.dosage}
                onChange={(e) => set('dosage', e.target.value)}
              />
            </label>
            <label className="field">
              <span>Pills per dose</span>
              <input
                type="number"
                min="1"
                value={draft.pillsPerDose}
                onChange={(e) => set('pillsPerDose', e.target.value)}
              />
            </label>
          </div>

          <fieldset className="field">
            <span>Times of day</span>
            <div className="slot-picker">
              {SLOTS.map((slot) => (
                <button
                  type="button"
                  key={slot.id}
                  className={`chip chip-toggle ${draft.slots.includes(slot.id) ? 'active' : ''}`}
                  onClick={() => toggleSlot(slot.id)}
                  aria-pressed={draft.slots.includes(slot.id)}
                >
                  {slot.icon} {slot.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="field-row">
            <label className="field">
              <span>Pills on hand</span>
              <input
                type="number"
                min="0"
                value={draft.pillsRemaining}
                onChange={(e) => set('pillsRemaining', e.target.value)}
              />
            </label>
            <label className="field">
              <span>Pills per refill</span>
              <input
                type="number"
                min="1"
                value={draft.refillQuantity}
                onChange={(e) => set('refillQuantity', e.target.value)}
              />
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              <span>Refill every (days)</span>
              <input
                type="number"
                min="1"
                value={draft.refillEveryDays}
                onChange={(e) => set('refillEveryDays', e.target.value)}
              />
            </label>
            <label className="field">
              <span>Next refill date</span>
              <input
                type="date"
                value={draft.nextRefillDate ?? ''}
                onChange={(e) => set('nextRefillDate', e.target.value || null)}
              />
            </label>
          </div>

          <fieldset className="field">
            <span>Color</span>
            <div className="color-picker">
              {MED_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={`color-swatch ${draft.color === c ? 'active' : ''}`}
                  style={{ background: c }}
                  onClick={() => set('color', c)}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </fieldset>

          <label className="field">
            <span>Notes (optional)</span>
            <input
              type="text"
              placeholder="e.g. take with food"
              value={draft.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            {!isNew && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  if (window.confirm(`Delete ${med.name}? This can’t be undone.`)) {
                    onDelete(med.id)
                  }
                }}
              >
                Delete
              </button>
            )}
            <div className="modal-actions-right">
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {isNew ? 'Add pill' : 'Save changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
