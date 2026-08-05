import { useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { loadState, saveState } from './src/storage'
import {
  addDays,
  countDosesForDay,
  currentStreak,
  sampleMeds,
  todayKey,
  weeklyAdherence,
} from './src/model'
import AlertsBanner from './src/components/AlertsBanner'
import StatsRow from './src/components/StatsRow'
import TodaySection from './src/components/TodaySection'
import MedList from './src/components/MedList'
import MedFormModal from './src/components/MedFormModal'
import { colors } from './src/theme'

export default function App() {
  return (
    <SafeAreaProvider>
      <PillPal />
    </SafeAreaProvider>
  )
}

function PillPal() {
  const [state, setState] = useState({ meds: [], log: {} })
  const [ready, setReady] = useState(false)
  const [formTarget, setFormTarget] = useState(null) // null | 'new' | med object
  const hydrated = useRef(false)

  useEffect(() => {
    loadState().then((saved) => {
      if (saved) setState(saved)
      hydrated.current = true
      setReady(true)
    })
  }, [])

  useEffect(() => {
    if (hydrated.current) saveState(state)
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
      meds: prev.meds.map((m) =>
        m.id === medId
          ? {
              ...m,
              pillsRemaining: m.pillsRemaining + m.refillQuantity,
              nextRefillDate: addDays(todayKey(), m.refillEveryDays),
            }
          : m,
      ),
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

  if (!ready) {
    return <View style={styles.loading} />
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>💊 PillPal</Text>
          <Text style={styles.date}>{dateLabel}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {meds.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🧴</Text>
            <Text style={styles.emptyTitle}>No pills yet</Text>
            <Text style={styles.emptyBody}>
              Add the pills and supplements you get on subscription. PillPal tracks
              your daily doses, counts down your supply, and reminds you before you
              run out.
            </Text>
            <Pressable
              onPress={() => setFormTarget('new')}
              style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
              accessibilityRole="button"
            >
              <Text style={styles.primaryBtnText}>+ Add your first pill</Text>
            </Pressable>
            <Pressable
              onPress={loadSampleData}
              style={({ pressed }) => [styles.ghostBtn, pressed && { opacity: 0.7 }]}
              accessibilityRole="button"
            >
              <Text style={styles.ghostBtnText}>Try with sample data</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <AlertsBanner meds={meds} onRefillArrived={markRefillArrived} />
            <StatsRow stats={stats} />
            <TodaySection meds={meds} log={log} onToggle={toggleDose} />
            <MedList
              meds={meds}
              onEdit={(med) => setFormTarget(med)}
              onRefillArrived={markRefillArrived}
            />
          </>
        )}

        <Text style={styles.footer}>
          Data is stored on this device. PillPal is a tracking aid, not medical advice.
        </Text>
      </ScrollView>

      {meds.length > 0 && (
        <Pressable
          onPress={() => setFormTarget('new')}
          style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.95 }] }]}
          accessibilityRole="button"
          accessibilityLabel="Add pill"
        >
          <Text style={styles.fabText}>＋</Text>
        </Pressable>
      )}

      {formTarget !== null && (
        <MedFormModal
          med={formTarget === 'new' ? null : formTarget}
          onSave={saveMed}
          onDelete={deleteMed}
          onClose={() => setFormTarget(null)}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  logo: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  date: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '500',
    color: colors.inkSoft,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
  },
  primaryBtn: {
    backgroundColor: colors.brand,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  ghostBtn: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  ghostBtnText: {
    color: colors.brandDark,
    fontWeight: '700',
    fontSize: 14,
  },
  footer: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 11,
    color: colors.inkSoft,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brand,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
  },
})
