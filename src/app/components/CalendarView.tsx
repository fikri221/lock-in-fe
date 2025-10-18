"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import TimeSlot from "./TimeSlot";
import DraggableTaskItem from "./DraggableTaskItem";
import CalendarDropContainer from "./CalendarDropContainer";
import { Task, Tasks } from "@/types/task";
import dynamic from "next/dynamic";

// Impor modal menggunakan dynamic import
const AddTaskModal = dynamic(() =>
  import("./Modal/AddTaskModal").then((mod) => mod.AddTaskModal)
);
const TaskDetailModal = dynamic(() =>
  import("./Modal/TaskDetailModal").then((mod) => mod.TaskDetailModal)
);

interface CalendarViewProps {
  tasks: Tasks;
  setTasks: React.Dispatch<React.SetStateAction<Tasks>>;
  selectedDate: Date;
}

// Konstanta untuk memudahkan kalkulasi
const HOUR_HEIGHT_IN_REM = 4; // Sama dengan h-16 di Tailwind
const MINUTE_INCREMENT = 15; // "Snap" ke setiap 15 menit

const hours = Array.from(
  { length: 24 },
  (_, i) => `${String(i).padStart(2, "0")}:00`
);

// Fungsi untuk mendapatkan index overlap
function getOverlappedTasks(currentTask: Task, tasks: Tasks) {
  // Ambil semua task yang overlap dengan currentTask, urutkan berdasarkan id (atau startMinutes)
  const overlapped = tasks
    .filter(
      (task) =>
        // Cek overlap
        task.startMinutes <
          currentTask.startMinutes + currentTask.durationMinutes &&
        task.startMinutes + task.durationMinutes > currentTask.startMinutes
    )
    .sort((a, b) => {
      if (a.startMinutes !== b.startMinutes) {
        return a.startMinutes - b.startMinutes;
      }
      // Jika waktu mulai sama, urutkan berdasarkan ID agar konsisten
      return a.id.localeCompare(b.id);
    }); // Urutkan berdasarkan endTime agar konsisten

  return overlapped;
}

function getOverlapIndex(currentTask: Task, tasks: Tasks) {
  const overlapped = getOverlappedTasks(currentTask, tasks);
  return overlapped.findIndex((t) => t.id === currentTask.id);
}

function getTotalOverlapCount(currentTask: Task, tasks: Tasks) {
  const overlapped = getOverlappedTasks(currentTask, tasks);
  return overlapped.length;
}

export default function CalendarView({
  tasks,
  setTasks,
  selectedDate,
}: CalendarViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  // Menyimpan ID task yang sedang di-drag
  const [activeId, setActiveId] = useState<string | null>(null);
  // Menyimpan data kalkulasi real-time untuk preview
  const [dragPreviewData, setDragPreviewData] = useState<{
    startTime: number;
    endTime: number;
  } | null>(null);
  const throttleTimeout = useRef<NodeJS.Timeout | null>(null);
  // Menggunakan PointerSensor untuk mendapatkan delta pergerakan yang akurat
  const sensors = useSensors(useSensor(PointerSensor));
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  }, []); // Dependensi kosong karena tidak bergantung pada state/prop yang berubah

  const handleTimeSlotClick = useCallback((hour: string) => {
    setSelectedHour(hour);
    setIsModalOpen(true);
  }, []);

  const handleSaveTask = useCallback(
    ({
      title,
      startTime,
      endTime,
      date,
    }: {
      title: string;
      startTime: string;
      endTime: string;
      date: string;
    }) => {
      if (selectedHour) {
        // 1. Konversi waktu mulai dan selesai ke format menit
        const startMinutes = timeToStartMinutes(startTime);
        const endMinutes = timeToStartMinutes(endTime);

        // Gabungkan tanggal dengan waktu dari input untuk membuat string ISO
        const dateTimeISO = `${date}`;

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
          date: dateTimeISO, // Simpan tanggal dalam format ISO
        };
        setTasks((prev) => [...prev, newTask]);
        setIsModalOpen(false); // Tutup modal setelah save
        setSelectedHour(null);
      }
    },
    [selectedHour, setTasks]
  );
  // console.log("Rendering CalendarView with tasks:", tasks);

  const handleDragStart = useCallback(
    (event: import("@dnd-kit/core").DragStartEvent) => {
      const { active } = event;
      const taskId = active.id;
      const task = tasks.find((task) => task.id === taskId);
      if (task) {
        setActiveId(active.id as string);
        // Simpan data awal saat mulai drag
        setDragPreviewData({
          startTime: task.startMinutes,
          endTime: task.startMinutes + task.durationMinutes,
        });
      }
    },
    [tasks]
  );

  const handleDragMove = useCallback(
    (event: import("@dnd-kit/core").DragMoveEvent) => {
      if (throttleTimeout.current) return;

      // console.log({
      //   deltaY: event.delta.y,
      //   scrollTop: getScrollY(),
      //   totalDeltaY: event.delta.y + (calendarGridRef.current?.scrollTop ?? 0),
      // });

      throttleTimeout.current = setTimeout(() => {
        const { active, delta } = event;
        const taskId = active.id;
        const task = tasks.find((t) => t.id === taskId);
        if (!task) return;

        // Konversi ke menit
        const deltaMinutes = (delta.y / hourHeightInPixels) * 60;

        // Hitung posisi baru
        const newStartMinutes = task.startMinutes + deltaMinutes;
        const snappedMinutes =
          Math.round(newStartMinutes / MINUTE_INCREMENT) * MINUTE_INCREMENT;

        // Update hanya preview
        setDragPreviewData({
          startTime: Math.max(0, Math.min(24 * 60 - 15, snappedMinutes)),
          endTime: Math.max(
            0,
            Math.min(24 * 60, snappedMinutes + task.durationMinutes)
          ),
        });

        throttleTimeout.current = null;
      }, 5);
    },
    [tasks, hourHeightInPixels]
  );

  const handleDragEnd = useCallback(
    (event: import("@dnd-kit/core").DragEndEvent) => {
      if (throttleTimeout.current) {
        clearTimeout(throttleTimeout.current);
        throttleTimeout.current = null;
      }

      const { active, delta } = event;
      const taskId = active.id;
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      
      const deltaMinutes = (delta.y / hourHeightInPixels) * 60;

      // Jangan lakukan double snapping, cukup sekali di sini
      const newStartMinutes = task.startMinutes + deltaMinutes;
      const finalMinutes = Math.max(
        0,
        Math.min(24 * 60 - task.durationMinutes, newStartMinutes)
      );

      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                startMinutes:
                  Math.round(finalMinutes / MINUTE_INCREMENT) *
                  MINUTE_INCREMENT,
              }
            : t
        )
      );

      setActiveId(null);
      setDragPreviewData(null);
    },
    [hourHeightInPixels, tasks, setTasks]
  );

  // Fungsi cek overlap untuk satu task
  // const isTaskOverlapped = (currentTask: Task) =>
  //   tasks.some(
  //     (task) => task.id !== currentTask.id && isOverlapping(currentTask, [task])
  //   );

  // function isOverlapLimitExceeded(
  //   currentTask: Task,
  //   newStartMinutes: number,
  //   tasks: Task[]
  // ) {
  //   // Buat task baru dengan posisi baru
  //   const tempTask = { ...currentTask, startMinutes: newStartMinutes };
  //   // Hitung overlap dengan task lain
  //   const overlapped = tasks.filter(
  //     (task) =>
  //       task.id !== tempTask.id &&
  //       task.startMinutes < tempTask.startMinutes + tempTask.durationMinutes &&
  //       task.startMinutes + task.durationMinutes > tempTask.startMinutes
  //   );
  //   // Jika overlap lebih dari 2 (task ini + 3 lain = 4), return true
  //   return overlapped.length > 2;
  // }

  // fungsi untuk melakukan snap ke grid
  const snapToGridModifier = useCallback(
    (args: {
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
    },
    [hourHeightInPixels]
  );

  // PERBAIKAN 2: Stabilkan array modifiers dengan useMemo
  const modifiers = useMemo(() => [snapToGridModifier], [snapToGridModifier]);

  const tasksWithOverlap = useMemo(() => {
    // console.log("Recalculating overlap for all tasks..."); // Ini hanya akan muncul saat `tasks` berubah
    return tasks.map((task) => ({
      ...task,
      overlapIndex: getOverlapIndex(task, tasks),
      overlapCount: getTotalOverlapCount(task, tasks),
    }));
  }, [tasks]);

  // SIAPKAN TASK AKTIF UNTUK DITAMPILKAN DI OVERLAY
  const activeTask = useMemo(
    () => tasksWithOverlap.find((task) => task.id === activeId),
    [activeId, tasksWithOverlap]
  );

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        modifiers={modifiers}
      >
        <div className="relative w-full rounded-lg px-6 py-4 ml-4">
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
              {Array.from({ length: 24 }).map((_, i) => {
                const hourString = `${String(i).padStart(2, "0")}:00`;
                // Hitung posisi 'top' sama seperti menghitungnya untuk task
                const topPositionRem = i * HOUR_HEIGHT_IN_REM;
                return (
                  <TimeSlot
                    key={hourString}
                    slotId={`timeslot-${hourString}`}
                    hour={hourString} // Kirim 'hour' sebagai prop
                    onTimeSlotClick={handleTimeSlotClick}
                    style={{ top: `${topPositionRem}rem` }}
                  />
                );
              })}

              {/* Render Task */}
              {tasksWithOverlap.map((task) => (
                <DraggableTaskItem
                  key={task.id}
                  task={task}
                  hourHeightInRem={HOUR_HEIGHT_IN_REM}
                  overlapIndex={task.overlapIndex}
                  overlapCount={task.overlapCount}
                  onTaskClick={handleTaskClick}
                />
              ))}
            </CalendarDropContainer>
          </div>
          <DragOverlay>
            {activeTask ? (
              <DraggableTaskItem
                task={activeTask}
                hourHeightInRem={HOUR_HEIGHT_IN_REM}
                isPreview={true} // Flag untuk styling khusus preview
                // Kita bisa hitung overlap untuk preview secara real-time
                overlapIndex={activeTask.overlapIndex}
                overlapCount={activeTask.overlapCount}
                onTaskClick={handleTaskClick}
                dragPreviewData={dragPreviewData}
              />
            ) : null}
          </DragOverlay>
        </div>
      </DndContext>
      <AddTaskModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSaveTask}
        selectedDate={selectedDate}
        selectedHour={selectedHour ?? undefined}
      />
      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        task={selectedTask}
      />
    </>
  );
}
