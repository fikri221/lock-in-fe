"use client";
import React, { useMemo, useState } from "react";
import TaskInput from "./TaskInput";
import CardListLoading from "./Loading/CardListLoading";
import CalendarView from "./CalendarView";
import DateCarousel from "./DateCarousel";
import ThemeToggle from "./Navbar/ThemeToggle";
import MonthlyCalendarView from "./MonthlyCalendarView";

const TaskManager: React.FC = () => {
  // ... (SEMUA STATE DAN FUNGSI ANDA TETAP SAMA, TIDAK PERLU DIUBAH) ...
  const [tasks, setTasks] = useState([
    {
      id: "task-1",
      title: "Meeting",
      startMinutes: 7 * 60 + 15, // 07:15
      durationMinutes: 60,
      date: new Date().toISOString().split("T")[0], // Tanggal hari ini
    },
    {
      id: "task-2",
      title: "Kerjakan Laporan",
      startMinutes: 8 * 60, // 08:00
      durationMinutes: 60,
      date: new Date().toISOString().split("T")[0], // Tanggal hari ini
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleSubmit = async () => { /* ...Fungsi Anda... */ };

  // 2. Bungkus logika filter dengan useMemo
  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      const taskDate = new Date(task.date);
      return taskDate.toDateString() === selectedDate.toDateString();
    });
  }, [tasks, selectedDate]); // Dependensi: hanya kalkulasi ulang jika `tasks` atau `selectedDate` berubah

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    // Latar belakang halaman
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Container utama dengan padding */}
      <div className="mx-auto pt-6 px-4">
        <div className="flex justify-between items-start mb-6">
          <DateCarousel
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
          <ThemeToggle />
        </div>

        {/* --- AREA KRITIS UNTUK DIPERBAIKI --- */}
        {/* 1. INI ADALAH PEMBUNGKUS UTAMA GRID. Pastikan kelas grid ada di sini. */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-20">

          {/* 2. KOLOM KIRI (Kalender Bulanan). Ini adalah anak pertama dari grid. */}
          <div className="lg:col-span-1">
            <MonthlyCalendarView
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
            />
            {/* Anda bisa menambahkan komponen lain di bawah kalender di sini */}
          </div>

          {/* 3. KOLOM KANAN (Jadwal Harian). Ini adalah anak kedua dari grid. */}
          <div className="lg:col-span-5">
            {/* Card wrapper untuk konsistensi visual */}
            <div className="p-4 rounded-lg shadow-md bg-white dark:bg-gray-800 h-full">
              {isLoading ? (
                <CardListLoading />
              ) : (
                <CalendarView
                  tasks={tasks}
                  setTasks={setTasks}
                  selectedDate={selectedDate}
                />
              )}
            </div>
          </div>
        </div>
        {/* --- AKHIR DARI AREA KRITIS --- */}
      </div>

      {/* Padding di bawah untuk memberi ruang dari bar input yang fixed */}
      <div className="pb-24"></div>

      {/* Bar Input Bawah */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <TaskInput task={tasks} setTask={setTasks} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
};

export default TaskManager;