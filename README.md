# 🔒 Lock-In: Habit Tracker

**Lock-In** adalah aplikasi pelacak kebiasaan (habit tracker) modern yang dirancang untuk membantu Anda membangun rutinitas yang lebih baik dengan antarmuka yang interaktif, cepat, dan menyenangkan.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15+-black?logo=next.js)
![React](https://img.shields.io/badge/React-19+-61DAFB?logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)

## ✨ Fitur Utama

-   **🎯 Dua Tipe Kebiasaan**: 
    -   **Boolean**: Sederhana (Selesai/Belum).
    -   **Measurable**: Pelacakan berbasis nilai (misal: Liter air, menit meditasi, jumlah push-up).
-   **📅 Horizontal Calendar**: Navigasi antar tanggal dengan mudah menggunakan kalender horizontal yang responsif.
-   **👆 Interactive Gestures**: 
    -   **Swipe Right**: Untuk menandai kebiasaan selesai.
    -   **Long Press & Drag**: Untuk memindahkan atau menghapus kebiasaan ke "Trash Bin".
    -   **Tap Interaction**: Antarmuka responsif untuk mengubah nilai pada *measurable cards*.
-   **📈 Visual Progress**: Progress bar dinamis yang memberikan umpan balik visual instan atas pencapaian harian Anda.
-   **🌓 Modern UI & Dark Mode**: Desain elegan berbasis Zinc palette dengan dukungan penuh mode gelap dan animasi halus menggunakan Framer Motion.
-   **📱 Mobile Optimized**: Pengalaman pengguna yang dioptimalkan untuk perangkat mobile.

## 🚀 Teknologi yang Digunakan

| Kategori | Teknologi |
| :--- | :--- |
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) (App Router) & [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/) |
| **Animasi** | [Framer Motion](https://www.framer.com/motion/) |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) |
| **Drag & Drop** | [@dnd-kit](https://dndkit.com/) |
| **Ikon** | [Lucide React](https://lucide.dev/) |
| **Notifikasi** | [Sonner](https://sonner.emilkowal.ski/) |
| **Utilitas Tanggal** | [date-fns](https://date-fns.org/) |
| **Grafik** | [Chart.js](https://www.chartjs.org/) & [Recharts](https://recharts.org/) |

## 🛠️ Persiapan & Instalasi

Pastikan Anda memiliki `Node.js` (versi 18+) terinstal di komputer Anda.

1.  **Clone repositori ini**:
    ```bash
    git clone https://github.com/username/lock-in-fe.git
    cd lock-in-fe
    ```

2.  **Instal dependensi**:
    ```bash
    npm install
    ```

3.  **Jalankan server pengembangan**:
    ```bash
    npm run dev
    ```

4.  **Buka aplikasi**:
    Akses [http://localhost:3000](http://localhost:3000) melalui browser Anda.

## 📦 Skrip yang Tersedia

-   `npm run dev`: Menjalankan aplikasi dalam mode pengembangan.
-   `npm run build`: Membangun aplikasi untuk produksi.
-   `npm run start`: Menjalankan aplikasi yang sudah dibangun dalam mode produksi.
-   `npm run lint`: Menjalankan pengecekan ESLint untuk mencari masalah pada kode.

## 🎨 Design Philosophy

Lock-In mengusung konsep **"Minimalist with Micro-interactions"**. Kami percaya bahwa aplikasi pelacak kebiasaan tidak boleh membebani pengguna, melainkan memberikan kepuasan instan melalui umpan balik visual (haptic-like feedback) dan animasi yang luwes.

---

Dibuat dengan ❤️ untuk produktivitas yang lebih baik.
