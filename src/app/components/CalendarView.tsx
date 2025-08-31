"use client";

import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import TimeSlot from "./TimeSlot";
import { AddTaskModal } from "./Modal/AddTaskModal";
import DraggableTaskItem from "./DraggableTaskItem";
import CalendarDropContainer from "./CalendarDropContainer";

// Konstanta untuk memudahkan kalkulasi
const HOUR_HEIGHT_IN_REM = 4; // Sama dengan h-16 di Tailwind
const MINUTE_INCREMENT = 15; // "Snap" ke setiap 15 menit

const hours = Array.from(
  { length: 24 },
  (_, i) => `${String(i).padStart(2, "0")}:00`
);

export default function CalendarView() {
  // State untuk menyimpan semua task
  const [tasks, setTasks] = useState([
    // Contoh data awal
    {
      id: "task-1",
      title: "Meeting Tim A",
      startMinutes: 9 * 60,
      durationMinutes: 120,
    }, // 09:00, 2 jam
    {
      id: "task-2",
      title: "Kerjakan Laporan",
      startMinutes: 13 * 60 + 30,
      durationMinutes: 60,
    }, // 13:30, 1 jam
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  // Menggunakan PointerSensor untuk mendapatkan delta pergerakan yang akurat
  const sensors = useSensors(useSensor(PointerSensor));

  // Fungsi ini perlu di-resolve saat komponen di-mount untuk mendapatkan nilai pixel aktual.
  // Untuk contoh ini kita hardcode, tapi di app nyata, gunakan `useRef` dan `useEffect`.
  const PIXELS_PER_REM = 16;
  const hourHeightInPixels = HOUR_HEIGHT_IN_REM * PIXELS_PER_REM;

  const handleTimeSlotClick = (hour: string) => {
    setSelectedHour(hour);
    setIsModalOpen(true);
  };

  const handleSaveTask = ({ title }: { title: string }) => {
    if (selectedHour) {
      const startHour = parseInt(selectedHour.split(":")[0]);
      const newTask = {
        id: `task-${Date.now()}`, // ID unik
        title,
        startMinutes: startHour * 60,
        durationMinutes: 60, // Default durasi 1 jam
      };
      setTasks((prev) => [...prev, newTask]);
      setIsModalOpen(false); // Tutup modal setelah save
      setSelectedHour(null);
    }
  };

  const handleDragEnd = (event: import("@dnd-kit/core").DragEndEvent) => {
    const { active, delta } = event;
    const taskId = active.id;

    // Cari task yang sedang di-drag
    const currentTask = tasks.find((task) => task.id === taskId);
    if (!currentTask) return;

    // Hitung perubahan posisi dalam menit
    const deltaMinutes = (delta.y / hourHeightInPixels) * 60;

    // Hitung total menit yang baru
    const newStartMinutes = currentTask.startMinutes + deltaMinutes;

    // "Snap" ke kelipatan 15 menit terdekat
    const snappedMinutes =
      Math.round(newStartMinutes / MINUTE_INCREMENT) * MINUTE_INCREMENT;

    // Batasi agar tidak keluar dari rentang 00:00 - 23:59
    const finalMinutes = Math.max(
      0,
      Math.min(24 * 60 - currentTask.durationMinutes, snappedMinutes)
    );

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, startMinutes: finalMinutes } : task
      )
    );
  };

  return (
    <>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="relative w-full max-w-4xl mx-auto bg-white rounded-lg">
          <div className="grid grid-cols-[auto_1fr] h-[calc(24*4rem)]">
            {/* Kolom Waktu */}
            <div className="flex flex-col">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-16 flex items-start justify-center"
                >
                  {/* Placeholder untuk space */}
                </div>
              ))}
            </div>

            {/* Kolom Grid Kalender */}
            <CalendarDropContainer>
              {/* Garis-garis jam hanya untuk visual */}
              {Array.from({ length: 24 }).map((_, i) => (
                <TimeSlot
                  key={i}
                  hour={`${String(i).padStart(2, "0")}:00`}
                  onTimeSlotClick={handleTimeSlotClick}
                />
              ))}

              {/* Render Task */}
              {tasks.map((task) => (
                <DraggableTaskItem
                  key={task.id}
                  task={task}
                  hourHeightInRem={HOUR_HEIGHT_IN_REM}
                />
              ))}
            </CalendarDropContainer>
          </div>
        </div>
      </DndContext>
      <AddTaskModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSaveTask}
        selectedHour={selectedHour ?? undefined}
      />
    </>
  );
}
