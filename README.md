# PillPal 💊

A mobile app (React Native + Expo) that helps you keep up with your subscription pills — vitamins, supplements, and medications you get delivered on a schedule.

## What it does

- **Today's doses** — a checklist grouped by time of day (morning, afternoon, evening, bedtime). Tap a pill to mark it taken; your supply count updates automatically.
- **Supply countdown** — each pill shows how many are left and how many days of supply that covers, based on your dose schedule.
- **Refill reminders** — alerts when a refill is due soon, when you're running low, and when you'd run out *before* the next refill arrives.
- **One-tap refills** — when a delivery shows up, hit "Refill arrived" to top up your supply and schedule the next refill.
- **Streaks and adherence** — a daily streak counter and your dose adherence over the last 7 days.

All data is stored on-device with AsyncStorage. No accounts, no servers.

> PillPal is a tracking aid, not medical advice.

## Running it

```bash
npm install
npm start
```

Then:

- Scan the QR code with the [Expo Go](https://expo.dev/go) app on your phone (iOS or Android), or
- Press `a` to open an Android emulator, `i` for the iOS simulator, or
- Press `w` to preview in a web browser.

## Tech

- [Expo](https://expo.dev/) SDK 57 / [React Native](https://reactnative.dev/) 0.86
- React 19, plain `StyleSheet` styling (no UI framework)
- `@react-native-async-storage/async-storage` for on-device persistence

## Project layout

```
App.js                     # Root component: state, actions, screen layout
src/model.js               # Domain logic: schedules, supply math, streaks, refill status
src/storage.js             # AsyncStorage persistence
src/theme.js               # Colors, radii, shadows
src/components/
  AlertsBanner.js          # Refill / low-supply alert banners
  StatsRow.js              # Doses today, streak, 7-day adherence
  TodaySection.js          # Tap-to-take dose checklist grouped by time of day
  MedList.js               # Pill cards with supply bars and refill actions
  MedFormModal.js          # Add/edit bottom sheet form
```
