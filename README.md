# 🔒 Lock-In: Habit Tracker

**Lock-In** is a modern, interactive habit-tracking application built to help you build better routines with a fast, fluid, and delightful user interface.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15+-black?logo=next.js)
![React](https://img.shields.io/badge/React-19+-61DAFB?logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)

## ✨ Key Features

-   **🎯 Dual Habit Types**: 
    -   **Boolean**: Simple (Done/Not Done).
    -   **Measurable**: Value-based tracking (e.g., Liters of water, minutes of meditation, number of push-ups).
-   **📅 Horizontal Calendar**: Effortlessly navigate between dates with a responsive horizontal calendar view.
-   **👆 Interactive Gestures**: 
    -   **Swipe Right**: Instantly mark habits as complete.
    -   **Long Press & Drag**: Intuitive way to reorganize habits or drop them into the "Trash Bin" to delete.
    -   **Tactile Interaction**: Responsive UI for adjusting values on *measurable cards*.
-   **📈 Visual Progress**: A dynamic progress bar that provides instant visual feedback on your daily achievements.
-   **🌓 Modern UI & Dark Mode**: Elegant Zinc-based color palette with full dark mode support and smooth animations powered by Framer Motion.
-   **📱 Mobile Optimized**: A refined user experience specifically designed for mobile and desktop alike.

## 🚀 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) (App Router) & [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) |
| **Drag & Drop** | [@dnd-kit](https://dndkit.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) |
| **Date Utilities** | [date-fns](https://date-fns.org/) |
| **Charts** | [Chart.js](https://www.chartjs.org/) & [Recharts](https://recharts.org/) |

## 🛠️ Setup & Installation

Ensure you have `Node.js` (version 18+) installed on your machine.

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/username/lock-in-fe.git
    cd lock-in-fe
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  **Open the application**:
    Access [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Available Scripts

-   `npm run dev`: Runs the app in development mode.
-   `npm run build`: Builds the app for production.
-   `npm run start`: Starts the production build.
-   `npm run lint`: Runs ESLint to check for code issues.

## 🎨 Design Philosophy

Lock-In follows a **"Minimalist with Micro-interactions"** approach. We believe that a habit tracker should never feel like a chore; instead, it should provide instant satisfaction through haptic-like visual feedback and fluid animations.

---

Built with ❤️ for better productivity and focus.
