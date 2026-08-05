import { StyleSheet, Text, View } from 'react-native'
import { colors, radius, shadow } from '../theme'

function ProgressBar({ ratio, color = colors.brand }) {
  return (
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          { width: `${Math.min(100, Math.max(0, ratio * 100))}%`, backgroundColor: color },
        ]}
      />
    </View>
  )
}

export default function StatsRow({ stats }) {
  return (
    <View style={styles.row}>
      <View style={[styles.card, styles.cardWide]}>
        <Text style={styles.value}>
          {stats.taken}/{stats.expected}
        </Text>
        <Text style={styles.label}>doses today</Text>
        <ProgressBar ratio={stats.expected ? stats.taken / stats.expected : 0} />
      </View>
      <View style={styles.card}>
        <Text style={styles.value}>{stats.streak} 🔥</Text>
        <Text style={styles.label}>day streak</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.value}>
          {stats.adherence === null ? '—' : `${stats.adherence}%`}
        </Text>
        <Text style={styles.label}>last 7 days</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  card: {
    flexGrow: 1,
    flexBasis: '28%',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: 14,
    ...shadow.card,
  },
  cardWide: {
    flexBasis: '100%',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.ink,
  },
  label: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '500',
    color: colors.inkSoft,
  },
  track: {
    marginTop: 10,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.line,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
})
