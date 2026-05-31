# 🔒 Lock-In: Habit Tracker Frontend (Web App) 

**Lock-In** is a modern, interactive, and responsive habit-tracking web application designed for high-performance mobile and desktop routine building. Built with React 19 and Next.js 16 (App Router), it leverages fluid micro-interactions, swipe/drag gesture controllers, and automatic data synchronization engines to provide an experience close to a native mobile application.

---

## 🚀 Architectural Overview & Engineering Structure

```
lock-in-fe/
├── src/
│   ├── app/                 # Next.js App Router (Layouts & Pages)
│   │   ├── (auth)/          # Authentication Routes (Login, Register)
│   │   ├── (dashboard)/     # Protected Dashboard Area
│   │   │   ├── habits/[id]/ # Habit Details & Analytics Views
│   │   │   └── page.tsx     # Core Application Hub
│   │   └── layout.tsx       # App Wrapper & Service Worker Bootstrapper
│   ├── components/          # Reusable UI Components
│   │   ├── dashboard/       # Dashboard Modules (Calendar, Modals)
│   │   ├── habits/          # Habit Card Engines (Boolean, Measurable)
│   │   └── ui/              # Atom Components (buttons, dialogs, etc.)
│   ├── hooks/               # Custom React Hooks (SWR, UI sync)
│   │   └── useHabits.ts     # CRUD Operations & Optimistic UI engine
│   ├── lib/                 # Core API Clients & Services
│   │   ├── api.ts           # Axios Request Interceptors & SDK
│   │   └── notifications.ts # PWA Service Worker & VAPID Registration
│   ├── providers/           # React Context Providers (Themes, Auth checking)
│   ├── store/               # Zustand Global State
│   │   ├── authStore.ts     # User Session & Upgrade Pipeline
│   │   └── habitStore.ts    # Habits Client-Side Store
│   ├── types/               # TypeScript Definitions
│   └── utils/               # Error Parsers and Formatters
```

### 1. Unified State & Session Flow (`Zustand`)
The frontend organizes its data layers via lightweight **Zustand** stores, separating security concerns from layout actions:
*   [authStore.ts](file:///d:/Web%20Projects/lock-in/lock-in-fe/src/store/authStore.ts): Manages JWT claims, user meta, Google OAuth credentials, and registers guest instances. It drives the **Guest Upgrade Pipeline**, allowing users to transition anonymous sessions into full email/password or Google accounts seamlessly.
*   [habitStore.ts](file:///d:/Web%20Projects/lock-in/lock-in-fe/src/store/habitStore.ts): Holds the localized habits state array. It is specifically extended to support functional state updaters (`(prev) => newPrev`), which is essential for rendering client updates immediately before the API responds.

### 2. SWR & Optimistic Update Engine (`useHabits.ts`)
To maximize speed, the [useHabits](file:///d:/Web%20Projects/lock-in/lock-in-fe/src/hooks/useHabits.ts) hook implements:
*   **Stale-While-Revalidate (SWR)**: Navigation triggers immediate data rendering from the cache, while background requests validate against the server database to avoid blocking page transitions.
*   **Optimistic UI with Automatic Rollbacks**: Habit completions, adjustments (adding progress), skips, and deletes reflect on the user interface instantly (under `16ms`). If an API call fails due to server outages or connection timeouts, the hook catches the error and executes an atomic rollback using stored snapshots of previous habits.
*   **Transaction Sync Safety**: Real-time server responses are merged inside React's `startTransition` hooks, ensuring rendering updates do not interrupt ongoing card animations.

### 3. PWA Web Push Client & Service Worker (`sw.js`)
*   **Service Worker Bootstrapping**: Features the `ServiceWorkerRegistrar` component nested in the root layout to handle automatic service worker deployment.
*   **Subscription Synchronization**: The [notifications.ts](file:///d:/Web%20Projects/lock-in/lock-in-fe/src/lib/notifications.ts) client service decodes the VAPID key into a `Uint8Array`, registers a push subscription in the browser's `PushManager`, and fires dynamic calls to synchronize the subscription endpoints on the backend API whenever the user status switches.

---

## 🔥 Key Engineering Plus Points (Nilai Plus)

### 1. Zero-Friction Onboarding (Interactive Guest Mode)
Users can test the application instantly without filling out a signup form. Clicking "Continue as Guest" creates a session immediately using an anonymous identity registered on the server. If they later choose to sign up or link a Google account, their habits, completion logs, mood tracking, and browser push registrations are seamlessly merged into their new permanent profile via a single database transaction.

### 2. High-Performance Gesture Interaction Engine
*   **Swipe Engine**: Touch events are hooked up to track gestures in real-time. Swiping right complete habits instantly, while dragging horizontally adjusts value meters (e.g., fluid volume metrics on measurable habit cards).
*   **Tap Mode vs. Swipe Mode**: Users can switch dynamically between a gesture-centric "Swipe" engine and a quick-action "Tap" engine (optimized for standard list views).
*   **Drag-to-Delete Trash Zone**: Long-pressing active cards activates a draggable canvas. Dragging cards to the bottom-screen drop zone triggers haptic-like animations (handled via Framer Motion dynamics) to safely discard habits.

### 3. Micro-Interaction Design System
The visual style is designed to look premium:
*   **Aesthetics**: Sleek dark mode toggles, HSL customized colors matched to specific categories, glassmorphism headers, and smooth spring animations.
*   **Horizontal Calendar**: Custom navigation allowing instant routine analysis for individual days without screen reloading.

---

## 🛠️ Technology Stack & Dependencies

*   **Core framework**: React 19, Next.js 16 (App Router)
*   **State Management**: Zustand
*   **Styling & Theme**: Tailwind CSS v4, Lucide Icons, Next Themes, Radix UI Dialogs
*   **Animations**: Framer Motion
*   **Gesture Engine**: @dnd-kit (Core, Sortable, Modifiers)
*   **Charts & Visualization**: Recharts, Chart.js, React-Chartjs-2
*   **Date Operations**: Date-fns
*   **Toasts & Alerts**: Sonner
*   **HTTP Client**: Axios

---

## 📋 Local Setup & Installation

### Prerequisites
*   Node.js (v18+)
*   npm or yarn

### 1. Initialize Project & Environment
Clone the repository and install dependencies:
```bash
git clone https://github.com/username/lock-in-fe.git
cd lock-in-fe
npm install
```

### 2. Configuration Setup
Create a `.env.local` in the project root:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📦 Build & Scripts

*   `npm run dev` - Runs the application in hot-reloading development mode.
*   `npm run build` - Validates TypeScript compliance and builds the optimized Next.js app for production.
*   `npm run start` - Serves the production build locally.
*   `npm run lint` - Code analysis using ESLint rules.
