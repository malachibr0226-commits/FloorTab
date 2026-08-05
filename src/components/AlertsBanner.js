import { Pressable, StyleSheet, Text, View } from 'react-native'
import { medStatus } from '../model'
import { colors, radius } from '../theme'

const SEVERITY = {
  danger: { icon: '⛔', bg: colors.dangerSoft, border: 'rgba(214, 48, 49, 0.3)' },
  warning: { icon: '⚠️', bg: colors.warnSoft, border: 'rgba(225, 112, 85, 0.35)' },
  info: { icon: '📦', bg: colors.infoSoft, border: 'rgba(9, 132, 227, 0.25)' },
}

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
    <View style={styles.wrap}>
      {alerts.map(({ med, status }) => {
        const sev = SEVERITY[status.severity]
        return (
          <View
            key={med.id}
            style={[styles.alert, { backgroundColor: sev.bg, borderColor: sev.border }]}
          >
            <Text style={styles.icon}>{sev.icon}</Text>
            <Text style={styles.text}>
              <Text style={styles.name}>{med.name}</Text> — {status.message}
            </Text>
            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.pressed]}
              onPress={() => onRefillArrived(med.id)}
            >
              <Text style={styles.buttonText}>Refill arrived</Text>
            </Pressable>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    marginBottom: 20,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: radius.control,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  icon: {
    fontSize: 16,
  },
  text: {
    flex: 1,
    color: colors.ink,
    fontSize: 13,
    lineHeight: 18,
  },
  name: {
    fontWeight: '700',
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  pressed: {
    backgroundColor: colors.brandSoft,
  },
  buttonText: {
    color: colors.brandDark,
    fontWeight: '700',
    fontSize: 13,
  },
})
