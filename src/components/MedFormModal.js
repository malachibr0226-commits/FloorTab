import { useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { isValidDateKey, makeMed, MED_COLORS, SLOTS } from '../model'
import { colors, radius } from '../theme'

function Field({ label, children, style }) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  )
}

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

  function submit() {
    if (!draft.name.trim()) {
      setError('Give the pill a name.')
      return
    }
    if (draft.slots.length === 0) {
      setError('Pick at least one time of day.')
      return
    }
    const nextRefillDate = String(draft.nextRefillDate ?? '').trim()
    if (nextRefillDate && !isValidDateKey(nextRefillDate)) {
      setError('Next refill date must be YYYY-MM-DD.')
      return
    }
    onSave({
      ...draft,
      name: draft.name.trim(),
      dosage: draft.dosage.trim(),
      nextRefillDate: nextRefillDate || null,
      pillsPerDose: Math.max(1, Number(draft.pillsPerDose) || 1),
      pillsRemaining: Math.max(0, Number(draft.pillsRemaining) || 0),
      refillQuantity: Math.max(1, Number(draft.refillQuantity) || 1),
      refillEveryDays: Math.max(1, Number(draft.refillEveryDays) || 1),
    })
  }

  function confirmDelete() {
    Alert.alert('Delete pill', `Delete ${med.name}? This can’t be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(med.id) },
    ])
  }

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {isNew ? 'Add a pill' : `Edit ${med.name}`}
            </Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.closeBtn, pressed && styles.pressedSoft]}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
          >
            <Field label="Name">
              <TextInput
                style={styles.input}
                placeholder="e.g. Vitamin D3"
                placeholderTextColor={colors.inkSoft}
                value={draft.name}
                onChangeText={(v) => set('name', v)}
                autoFocus
              />
            </Field>

            <View style={styles.row}>
              <Field label="Dosage" style={styles.half}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 2000 IU"
                  placeholderTextColor={colors.inkSoft}
                  value={draft.dosage}
                  onChangeText={(v) => set('dosage', v)}
                />
              </Field>
              <Field label="Pills per dose" style={styles.half}>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  value={String(draft.pillsPerDose)}
                  onChangeText={(v) => set('pillsPerDose', v)}
                />
              </Field>
            </View>

            <Field label="Times of day">
              <View style={styles.chipRow}>
                {SLOTS.map((slot) => {
                  const active = draft.slots.includes(slot.id)
                  return (
                    <Pressable
                      key={slot.id}
                      onPress={() => toggleSlot(slot.id)}
                      style={[styles.chipToggle, active && styles.chipToggleActive]}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: active }}
                    >
                      <Text
                        style={[styles.chipToggleText, active && styles.chipToggleTextActive]}
                      >
                        {slot.icon} {slot.label}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </Field>

            <View style={styles.row}>
              <Field label="Pills on hand" style={styles.half}>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  value={String(draft.pillsRemaining)}
                  onChangeText={(v) => set('pillsRemaining', v)}
                />
              </Field>
              <Field label="Pills per refill" style={styles.half}>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  value={String(draft.refillQuantity)}
                  onChangeText={(v) => set('refillQuantity', v)}
                />
              </Field>
            </View>

            <View style={styles.row}>
              <Field label="Refill every (days)" style={styles.half}>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  value={String(draft.refillEveryDays)}
                  onChangeText={(v) => set('refillEveryDays', v)}
                />
              </Field>
              <Field label="Next refill date" style={styles.half}>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.inkSoft}
                  value={draft.nextRefillDate ?? ''}
                  onChangeText={(v) => set('nextRefillDate', v)}
                  autoCapitalize="none"
                />
              </Field>
            </View>

            <Field label="Color">
              <View style={styles.colorRow}>
                {MED_COLORS.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => set('color', c)}
                    style={[
                      styles.swatch,
                      { backgroundColor: c },
                      draft.color === c && styles.swatchActive,
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: draft.color === c }}
                    accessibilityLabel={`Color ${c}`}
                  />
                ))}
              </View>
            </Field>

            <Field label="Notes (optional)">
              <TextInput
                style={styles.input}
                placeholder="e.g. take with food"
                placeholderTextColor={colors.inkSoft}
                value={draft.notes}
                onChangeText={(v) => set('notes', v)}
              />
            </Field>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.actions}>
              {!isNew && (
                <Pressable
                  onPress={confirmDelete}
                  style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.7 }]}
                  accessibilityRole="button"
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              )}
              <View style={styles.actionsRight}>
                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressedSoft]}
                  accessibilityRole="button"
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={submit}
                  style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }]}
                  accessibilityRole="button"
                >
                  <Text style={styles.saveText}>{isNew ? 'Add pill' : 'Save changes'}</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(30, 27, 49, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.ink,
    flex: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
    color: colors.inkSoft,
    fontWeight: '700',
  },
  pressedSoft: {
    backgroundColor: colors.brandSoft,
  },
  form: {
    paddingHorizontal: 20,
    gap: 14,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.inkSoft,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.control,
    backgroundColor: '#FBFAFF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: colors.ink,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipToggle: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipToggleActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brandSoft,
  },
  chipToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
  },
  chipToggleTextActive: {
    color: colors.brandDark,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  swatchActive: {
    borderColor: colors.ink,
  },
  error: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  deleteBtn: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.control,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  deleteText: {
    color: colors.danger,
    fontWeight: '700',
  },
  actionsRight: {
    flexDirection: 'row',
    gap: 10,
    marginLeft: 'auto',
  },
  cancelBtn: {
    borderRadius: radius.control,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: colors.brandDark,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: colors.brand,
    borderRadius: radius.control,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
  },
})
