# PillPal 💊

A small web app that helps you keep up with your subscription pills — vitamins, supplements, and medications you get delivered on a schedule.

## What it does

- **Today's doses** — a checklist grouped by time of day (morning, afternoon, evening, bedtime). Tap a pill to mark it taken; your supply count updates automatically.
- **Supply countdown** — each pill shows how many are left and how many days of supply that covers, based on your dose schedule.
- **Refill reminders** — alerts when a refill is due soon, when you're running low, and when you'd run out *before* the next refill arrives.
- **One-tap refills** — when a delivery shows up, hit "Refill arrived" to top up your supply and schedule the next refill.
- **Streaks and adherence** — a daily streak counter and your dose adherence over the last 7 days.

All data is stored locally in your browser (localStorage). No accounts, no servers.

> PillPal is a tracking aid, not medical advice.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

To build for production:

```bash
npm run build
npm run preview
```

## Tech

- [React 18](https://react.dev/) + [Vite](https://vite.dev/)
- Plain CSS, no UI framework
- localStorage persistence
