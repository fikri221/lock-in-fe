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

interface CalendarViewProps {
  tasks: Array<{
    id: string;
    title: string;
    startMinutes: number;
    durationMinutes: number;
  }>;
  setTasks: React.Dispatch<
    React.SetStateAction<
      Array<{
        id: string;
        title: string;
        startMinutes: number;
        durationMinutes: number;
      }>
    >
  >;
}

// Konstanta untuk memudahkan kalkulasi
const HOUR_HEIGHT_IN_REM = 4; // Sama dengan h-16 di Tailwind
const MINUTE_INCREMENT = 15; // "Snap" ke setiap 15 menit

const hours = Array.from(
  { length: 24 },
  (_, i) => `${String(i).padStart(2, "0")}:00`
);

export default function CalendarView({ tasks, setTasks }: CalendarViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [activeDragData, setActiveDragData] = useState<{
    id: string;
    startTime: number;
    endTime: number;
  } | null>(null);
  // Menggunakan PointerSensor untuk mendapatkan delta pergerakan yang akurat
  const sensors = useSensors(useSensor(PointerSensor));

  // Fungsi ini perlu di-resolve saat komponen di-mount untuk mendapatkan nilai pixel aktual.
  // Untuk contoh ini kita hardcode, tapi di app nyata, gunakan `useRef` dan `useEffect`.
  const PIXELS_PER_REM = 16;
  const hourHeightInPixels = HOUR_HEIGHT_IN_REM * PIXELS_PER_REM;

  // Fungsi konversi yang sudah kita punya
  const timeToStartMinutes = (timeString: string) => {
    if (!timeString) return 0;
    const [hour, minute] = timeString
      .split(":")
      .map((num) => parseInt(num, 10));
    return hour * 60 + minute;
  };

  const handleTimeSlotClick = (hour: string) => {
    setSelectedHour(hour);
    setIsModalOpen(true);
  };

  const handleSaveTask = ({
    title,
    startTime,
    endTime,
  }: {
    title: string;
    startTime: string;
    endTime: string;
  }) => {
    if (selectedHour) {
      // 1. Konversi waktu mulai dan selesai ke format menit
      const startMinutes = timeToStartMinutes(startTime);
      const endMinutes = timeToStartMinutes(endTime);

      // Pastikan waktu selesai setelah waktu mulai
      if (endMinutes <= startMinutes) {
        alert("Waktu selesai harus setelah waktu mulai!");
        return;
      }

      // Hitung durasi
      const durationMinutes = endMinutes - startMinutes;

      // const startHour = parseInt(selectedHour.split(":")[0]);
      const newTask = {
        id: `task-${Date.now()}`, // ID unik
        title,
        startMinutes,
        durationMinutes, // Default durasi 1 jam
      };
      setTasks((prev) => [...prev, newTask]);
      setIsModalOpen(false); // Tutup modal setelah save
      setSelectedHour(null);
    }
  };

  const handleDragStart = (event: import("@dnd-kit/core").DragEndEvent) => {
    const { active } = event;
    const taskId = active.id;
    const task = tasks.find(task => task.id === taskId);
    if (task) {
      setActiveDragData({
        id: task.id,
        startTime: task.startMinutes,
        endTime: task.startMinutes + task.durationMinutes,
      });
    }
  };

  const handleDragMove = (event: import("@dnd-kit/core").DragEndEvent) => {
    const { active, delta } = event;
    const taskId = active.id;
    const task = tasks.find((task) => task.id === taskId);
    if (!task) return;

    // Logika kalkulasi sama seperti di handleDragEnd
    const deltaMinutes = (delta.y / hourHeightInPixels) * 60;
    const newStartMinutes = task.startMinutes + deltaMinutes;
    const snappedMinutes =
      Math.round(newStartMinutes / MINUTE_INCREMENT) * MINUTE_INCREMENT;
    const finalMinutes = Math.max(0, Math.min(24 * 60 - 15, snappedMinutes));

    // Perbarui state preview secara real-time
    setActiveDragData({
      id: task.id,
      startTime: finalMinutes,
      endTime: finalMinutes + task.durationMinutes,
    });
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
    setActiveDragData(null); // Reset preview saat drag selesai
  };

  // fungsi untuk melakukan snap ke grid
  const snapToGridModifier = (args: {
    transform: { x: number; y: number; scaleX: number; scaleY: number };
  }) => {
    const { transform } = args;

    // Hitung berapa tinggi pixel untuk setiap blok 'snap' (15 menit)
    const pixelsPerSnap = (hourHeightInPixels / 60) * MINUTE_INCREMENT;

    // Bulatkan posisi y dari transform ke kelipatan 'pixelsPerSnap' terdekat
    const snappedY = Math.round(transform.y / pixelsPerSnap) * pixelsPerSnap;

    return {
      ...transform,
      y: snappedY,
    };
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        modifiers={[snapToGridModifier]}
      >
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
                  activeDragData={activeDragData}
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
