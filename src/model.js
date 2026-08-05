export const SLOTS = [
  { id: 'morning', label: 'Morning', icon: '☀️', hint: '6am – 11am' },
  { id: 'afternoon', label: 'Afternoon', icon: '🌤️', hint: '11am – 5pm' },
  { id: 'evening', label: 'Evening', icon: '🌆', hint: '5pm – 9pm' },
  { id: 'bedtime', label: 'Bedtime', icon: '🌙', hint: '9pm – midnight' },
]

export const MED_COLORS = [
  '#6C5CE7', '#00B894', '#E17055', '#0984E3',
  '#D63031', '#E84393', '#FDCB6E', '#00CEC9',
]

const DAY_MS = 24 * 60 * 60 * 1000

export function toDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayKey() {
  return toDateKey(new Date())
}

export function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Whole days from today until the given date key (negative if past). */
export function daysUntil(dateKey) {
  const target = parseDateKey(dateKey)
  const today = parseDateKey(todayKey())
  return Math.round((target - today) / DAY_MS)
}

export function addDays(dateKey, days) {
  const d = parseDateKey(dateKey)
  d.setDate(d.getDate() + days)
  return toDateKey(d)
}

export function formatDateKey(dateKey) {
  return parseDateKey(dateKey).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function pillsPerDay(med) {
  return med.slots.length * med.pillsPerDose
}

export function daysOfSupply(med) {
  const perDay = pillsPerDay(med)
  if (perDay <= 0) return Infinity
  return Math.floor(med.pillsRemaining / perDay)
}

export function runOutDateKey(med) {
  const days = daysOfSupply(med)
  if (!Number.isFinite(days)) return null
  return addDays(todayKey(), days)
}

/**
 * Status for a medication's supply/refill situation.
 * Severity: 'danger' > 'warning' > 'info' > 'ok'
 */
export function medStatus(med) {
  const supplyDays = daysOfSupply(med)
  const refillIn = med.nextRefillDate ? daysUntil(med.nextRefillDate) : null

  if (med.pillsRemaining <= 0) {
    return { severity: 'danger', message: 'Out of pills' }
  }
  if (refillIn !== null && supplyDays < refillIn) {
    return {
      severity: 'danger',
      message: `Runs out ${supplyDays === 0 ? 'today' : `in ${supplyDays}d`}, before the refill arrives`,
    }
  }
  if (supplyDays <= 5) {
    return {
      severity: 'warning',
      message: `Only ${supplyDays === 0 ? 'less than a day' : `${supplyDays}d`} of supply left`,
    }
  }
  if (refillIn !== null && refillIn <= 3) {
    return {
      severity: 'info',
      message: refillIn <= 0 ? 'Refill due — mark it when it arrives' : `Refill arrives in ${refillIn}d`,
    }
  }
  return { severity: 'ok', message: `${supplyDays} days of supply` }
}

/** All doses scheduled today for a list of meds, grouped by slot. */
export function dosesBySlot(meds) {
  const groups = SLOTS.map((slot) => ({
    slot,
    doses: meds
      .filter((m) => m.slots.includes(slot.id))
      .map((m) => ({ med: m, slotId: slot.id })),
  }))
  return groups.filter((g) => g.doses.length > 0)
}

export function isTaken(log, dateKey, medId, slotId) {
  return Boolean(log[dateKey]?.[medId]?.[slotId])
}

export function countDosesForDay(meds, log, dateKey) {
  let expected = 0
  let taken = 0
  for (const med of meds) {
    for (const slotId of med.slots) {
      expected += 1
      if (isTaken(log, dateKey, med.id, slotId)) taken += 1
    }
  }
  return { expected, taken }
}

/** Consecutive fully-completed days ending today (or yesterday if today isn't done yet). */
export function currentStreak(meds, log) {
  if (meds.length === 0) return 0
  let streak = 0
  let day = todayKey()
  const today = countDosesForDay(meds, log, day)
  if (today.expected > 0 && today.taken >= today.expected) {
    streak += 1
  }
  day = addDays(day, -1)
  for (let i = 0; i < 365; i++) {
    const { expected, taken } = countDosesForDay(meds, log, day)
    if (expected === 0 || taken < expected) break
    streak += 1
    day = addDays(day, -1)
  }
  return streak
}

export function weeklyAdherence(meds, log) {
  let expected = 0
  let taken = 0
  for (let i = 1; i <= 7; i++) {
    const day = addDays(todayKey(), -i)
    const counts = countDosesForDay(meds, log, day)
    expected += counts.expected
    taken += counts.taken
  }
  if (expected === 0) return null
  return Math.round((taken / expected) * 100)
}

export function makeMed(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    name: '',
    dosage: '',
    slots: ['morning'],
    pillsPerDose: 1,
    pillsRemaining: 30,
    refillQuantity: 30,
    refillEveryDays: 30,
    nextRefillDate: addDays(todayKey(), 30),
    color: MED_COLORS[Math.floor(Math.random() * MED_COLORS.length)],
    notes: '',
    ...overrides,
  }
}

export function sampleMeds() {
  return [
    makeMed({
      name: 'Vitamin D3',
      dosage: '2000 IU',
      slots: ['morning'],
      pillsRemaining: 42,
      refillQuantity: 90,
      refillEveryDays: 90,
      nextRefillDate: addDays(todayKey(), 40),
      color: '#FDCB6E',
    }),
    makeMed({
      name: 'Omega-3 Fish Oil',
      dosage: '1000 mg',
      slots: ['morning', 'evening'],
      pillsRemaining: 8,
      refillQuantity: 60,
      refillEveryDays: 30,
      nextRefillDate: addDays(todayKey(), 2),
      color: '#0984E3',
    }),
    makeMed({
      name: 'Magnesium Glycinate',
      dosage: '400 mg',
      slots: ['bedtime'],
      pillsRemaining: 25,
      refillQuantity: 30,
      refillEveryDays: 30,
      nextRefillDate: addDays(todayKey(), 24),
      color: '#6C5CE7',
    }),
  ]
}
