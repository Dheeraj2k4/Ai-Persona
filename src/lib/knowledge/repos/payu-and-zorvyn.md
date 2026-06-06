# PayU App - Finance Manager

**Repository:** https://github.com/Dheeraj2k4/PayU_App
**Primary Languages:** TypeScript (99.9%)
**Year:** 2025

## Purpose
Mobile personal finance manager built with React Native. Track expenses, income, and subscriptions with analytics dashboards, donut charts, and smooth 60fps animations.

## Tech Stack
- **Framework:** React Native + Expo (SDK 54)
- **Language:** TypeScript
- **Navigation:** React Navigation (Stack + Bottom Tabs)
- **Animations:** React Native Reanimated
- **Storage:** AsyncStorage (all data local)
- **State:** React Context API
- **Build:** EAS Build for production

## Architecture
Component-based with dedicated folders:
- `/analytics` — spending charts and insights
- `/auth` — authentication screens
- `/charts` — donut chart, bar charts
- `/home` — main dashboard
- `/navigation` — navigation config (Stack + Tabs)
- `/profile` — user settings
- `/transactions` — CRUD for transactions

Custom hooks: `useTheme`, `useTransactions`. Context API for global state management.

## Design Tradeoffs
- **React Context over Redux:** Simpler state needs for a personal app. Tradeoff: less scalable for complex state.
- **AsyncStorage over SQLite:** Simpler API for JSON storage. Tradeoff: no querying, all-or-nothing reads.
- **React Native Reanimated over Animated API:** 60fps animations on UI thread. Tradeoff: more complex setup.
- **Expo over bare React Native:** Faster development, managed workflow. Tradeoff: limited native module access.
- **Local-only data:** No backend needed, works offline. Tradeoff: no sync across devices.

## What I'd Do Differently
- Add cloud sync (Firebase/Supabase) for cross-device access
- Implement budgeting goals and alerts
- Add bank account linking (Plaid API)
- Use SQLite for better query performance on large transaction lists
- Add biometric auth for sensitive financial data

# Zorvyn Finance Dashboard

**Repository:** https://github.com/Dheeraj2k4/Zorvyn_Assignment
**Primary Languages:** JavaScript (85%), CSS
**Year:** 2025

## Purpose
Responsive finance dashboard with role-based access control, mock API with realistic latency, animations, and data export. Built as an assignment demonstrating frontend architecture skills.

## Tech Stack
- **Framework:** React 19 + Vite 8
- **Styling:** Tailwind CSS v4
- **State:** Zustand v5 (with persist middleware)
- **Charts:** Recharts 3
- **Animations:** Framer Motion 12
- **Icons:** Lucide React

## Architecture
- Zustand single-store pattern with `persist` middleware → auto-syncs to localStorage
- `onRehydrateStorage` callback to re-derive filtered state after page reload
- Mock API layer with realistic latency simulation (450ms fetch, 320ms create)
- Component hierarchy: layout → insights → charts → transactions
- RBAC: Admin (full CRUD) vs Viewer (read-only)

## Design Tradeoffs
- **Zustand over Redux:** Zero boilerplate, tiny bundle size. Tradeoff: less middleware ecosystem.
- **localStorage persistence:** Works offline, no backend needed. Tradeoff: limited storage, no sync.
- **Mock API with setTimeout:** Simulates real async patterns without a server. Tradeoff: not production-realistic.
- **Framer Motion:** Beautiful staggered animations. Tradeoff: adds ~30KB to bundle.
- **Design-first approach:** Used Stitch for UI mockups before coding.

## What I'd Do Differently
- Connect to real financial APIs (Plaid, Stripe)
- Add proper authentication with JWT
- Implement WebSocket for real-time transaction updates
- Add unit and integration tests
- Use server-side rendering for initial load performance
