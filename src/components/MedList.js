import { Pressable, StyleSheet, Text, View } from 'react-native'
import {
  daysOfSupply,
  daysUntil,
  formatDateKey,
  medStatus,
  pillsPerDay,
  SLOTS,
} from '../model'
import { colors, radius, shadow } from '../theme'

const SEVERITY_COLOR = {
  ok: colors.ok,
  info: colors.info,
  warning: colors.warn,
  danger: colors.danger,
}

function SupplyBar({ med }) {
  const days = daysOfSupply(med)
  const pct = Number.isFinite(days) ? Math.min(100, (days / 30) * 100) : 100
  const status = medStatus(med)
  const barColor =
    status.severity === 'danger'
      ? colors.danger
      : status.severity === 'warning'
        ? colors.warn
        : colors.ok

  return (
    <View>
      <View style={styles.supplyMeta}>
        <Text style={styles.supplyText}>
          {med.pillsRemaining} pills left · {pillsPerDay(med)}/day
        </Text>
        <Text style={[styles.supplyDays, { color: SEVERITY_COLOR[status.severity] }]}>
          {Number.isFinite(days) ? `${days}d supply` : '∞'}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  )
}

function MedCard({ med, onEdit, onRefillArrived }) {
  const refillIn = med.nextRefillDate ? daysUntil(med.nextRefillDate) : null

  return (
    <View style={[styles.card, { borderTopColor: med.color }]}>
      <View style={styles.top}>
        <View style={[styles.dot, { backgroundColor: med.color }]} />
        <View style={styles.titleWrap}>
          <Text style={styles.name}>{med.name}</Text>
          {!!med.dosage && <Text style={styles.dosage}>{med.dosage}</Text>}
        </View>
        <Pressable
          onPress={() => onEdit(med)}
          style={({ pressed }) => [styles.editBtn, pressed && styles.pressedSoft]}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${med.name}`}
        >
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
      </View>

      <View style={styles.chips}>
        {SLOTS.filter((s) => med.slots.includes(s.id)).map((s) => (
          <View key={s.id} style={styles.chip}>
            <Text style={styles.chipText}>
              {s.icon} {s.label}
            </Text>
          </View>
        ))}
      </View>

      <SupplyBar med={med} />

      <View style={styles.refillRow}>
        <Text style={styles.refillText}>
          📦 Next refill:{' '}
          <Text style={styles.refillDate}>
            {med.nextRefillDate ? formatDateKey(med.nextRefillDate) : '—'}
          </Text>
          {refillIn !== null && (
            <Text style={styles.refillIn}>
              {' '}
              ({refillIn === 0 ? 'today' : refillIn < 0 ? `${-refillIn}d overdue` : `in ${refillIn}d`})
            </Text>
          )}
        </Text>
        <Pressable
          onPress={() => onRefillArrived(med.id)}
          style={({ pressed }) => [styles.refillBtn, pressed && styles.pressedSoft]}
          accessibilityRole="button"
        >
          <Text style={styles.refillBtnText}>Refill arrived (+{med.refillQuantity})</Text>
        </Pressable>
      </View>

      {!!med.notes && <Text style={styles.notes}>{med.notes}</Text>}
    </View>
  )
}

export default function MedList({ meds, onEdit, onRefillArrived }) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>My pills</Text>
      <View style={styles.grid}>
        {meds.map((med) => (
          <MedCard
            key={med.id}
            med={med}
            onEdit={onEdit}
            onRefillArrived={onRefillArrived}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 12,
  },
  grid: {
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderTopWidth: 4,
    padding: 16,
    gap: 12,
    ...shadow.card,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 5,
  },
  titleWrap: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  dosage: {
    fontSize: 13,
    color: colors.inkSoft,
  },
  editBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  editText: {
    color: colors.brandDark,
    fontWeight: '700',
    fontSize: 13,
  },
  pressedSoft: {
    backgroundColor: colors.brandSoft,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: colors.brandSoft,
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink,
  },
  supplyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  supplyText: {
    fontSize: 12,
    color: colors.inkSoft,
  },
  supplyDays: {
    fontSize: 12,
    fontWeight: '800',
  },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.line,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  refillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  refillText: {
    fontSize: 13,
    color: colors.ink,
    flexShrink: 1,
  },
  refillDate: {
    fontWeight: '700',
  },
  refillIn: {
    color: colors.inkSoft,
  },
  refillBtn: {
    borderWidth: 1.5,
    borderColor: colors.brand,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  refillBtnText: {
    color: colors.brandDark,
    fontWeight: '700',
    fontSize: 12,
  },
  notes: {
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.inkSoft,
  },
})
