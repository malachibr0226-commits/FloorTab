import { Pressable, StyleSheet, Text, View } from 'react-native'
import { dosesBySlot, isTaken, todayKey } from '../model'
import { colors, radius, shadow } from '../theme'

export default function TodaySection({ meds, log, onToggle }) {
  const groups = dosesBySlot(meds)
  const today = todayKey()

  if (groups.length === 0) return null

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Today’s doses</Text>
      <View style={styles.grid}>
        {groups.map(({ slot, doses }) => (
          <View key={slot.id} style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.slotIcon}>{slot.icon}</Text>
              <View>
                <Text style={styles.slotLabel}>{slot.label}</Text>
                <Text style={styles.slotHint}>{slot.hint}</Text>
              </View>
            </View>
            <View style={styles.doseList}>
              {doses.map(({ med }) => {
                const taken = isTaken(log, today, med.id, slot.id)
                return (
                  <Pressable
                    key={med.id}
                    onPress={() => onToggle(med.id, slot.id)}
                    style={({ pressed }) => [
                      styles.dose,
                      taken && styles.doseTaken,
                      pressed && styles.dosePressed,
                    ]}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: taken }}
                    accessibilityLabel={`${med.name}, ${slot.label} dose`}
                  >
                    <View
                      style={[
                        styles.check,
                        { borderColor: med.color },
                        taken && { backgroundColor: med.color },
                      ]}
                    >
                      {taken && <Text style={styles.checkMark}>✓</Text>}
                    </View>
                    <View style={styles.doseInfo}>
                      <Text style={[styles.doseName, taken && styles.doseNameTaken]}>
                        {med.name}
                      </Text>
                      <Text style={styles.doseDetail}>
                        {med.pillsPerDose} × {med.dosage || 'pill'}
                      </Text>
                    </View>
                  </Pressable>
                )
              })}
            </View>
          </View>
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
    padding: 14,
    ...shadow.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  slotIcon: {
    fontSize: 22,
  },
  slotLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  slotHint: {
    fontSize: 11,
    color: colors.inkSoft,
  },
  doseList: {
    gap: 6,
  },
  dose: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.control,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  doseTaken: {
    backgroundColor: colors.okSoft,
    borderColor: 'rgba(0, 184, 148, 0.3)',
  },
  dosePressed: {
    opacity: 0.7,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  doseInfo: {
    flex: 1,
  },
  doseName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
  },
  doseNameTaken: {
    textDecorationLine: 'line-through',
    color: colors.inkSoft,
  },
  doseDetail: {
    fontSize: 12,
    color: colors.inkSoft,
  },
})
