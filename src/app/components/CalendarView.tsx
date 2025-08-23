"use client";

import { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import TimeSlot from "./TimeSlot";
import { AddTaskModal } from "./Modal/AddTaskModal";
import DraggableTaskItem from "./DraggableTaskItem";

const hours = Array.from(
  { length: 24 },
  (_, i) => `${String(i).padStart(2, "0")}:00`
);

export default function CalendarView() {
  // State untuk menyimpan semua task
  const [tasks, setTasks] = useState([
    // Contoh data awal
    { id: "task-1", title: "Meeting dengan Tim A", startHour: 9, duration: 2 }, // Jam 9, selama 2 jam
    { id: "task-2", title: "Kerjakan Laporan", startHour: 13, duration: 1 }, // Jam 13, selama 1 jam
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);

  const handleTimeSlotClick = (hour: string) => {
    setSelectedHour(hour);
    setIsModalOpen(true);
  };

  const handleSaveTask = ({ title }: { title: string }) => {
    if (selectedHour) {
      const newTask = {
        id: `task-${Date.now()}`, // ID unik
        title,
        startHour: parseInt(selectedHour.split(":")[0]),
        duration: 1, // Default durasi 1 jam
      };
      setTasks((prev) => [...prev, newTask]);
      setIsModalOpen(false); // Tutup modal setelah save
      setSelectedHour(null);
    }
  };

  const handleDragEnd = (event: import("@dnd-kit/core").DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Dapatkan jam baru dari data droppable area
      const newHour = over.data.current?.hour;
      const taskId = active.id;

      if (newHour !== undefined) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId
              ? { ...task, startHour: parseInt(newHour.split(":")[0]) }
              : task
          )
        );
      }
    }
  };

  return (
    <>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
            <div className="relative">
              {hours.map((hour) => (
                <TimeSlot
                  key={hour}
                  hour={hour}
                  onTimeSlotClick={handleTimeSlotClick}
                />
              ))}

              {/* Render Tasks di sini (dijelaskan di langkah 3) */}
              {/* 👇 RENDER TASKS DI SINI 👇 */}
              {tasks.map((task) => (
                <DraggableTaskItem key={task.id} task={task} />
              ))}
            </div>
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
