import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'pillpal-state-v1'

export async function loadState() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.meds) || typeof parsed.log !== 'object') {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export async function saveState(state) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage unavailable — the app keeps working in memory.
  }
}
