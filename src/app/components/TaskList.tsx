import React, { useEffect } from "react";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableTaskItem } from "./SortableTaskItem";
import { SortableSlot } from "./SortableSlot";
import { v4 as uuidv4 } from "uuid";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  duration?: number;
}

interface TaskListProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  toggleTaskCompletion: (index: number) => void;
  editTask: (id: string, newText: string, newDuration: number) => void;
  deleteTask: (id: string) => void;
  result?: string; // untuk menampilkan hasil dari AI
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  toggleTaskCompletion,
  editTask,
  deleteTask,
  setTasks,
  result,
}) => {
  const sensors = useSensors(useSensor(PointerSensor));
  const [aiMessage, setAiMessage] = React.useState<string | null>(null);

  const parseResultToTasks = (result: string): Task[] => {
    try {
      const arr = JSON.parse(result);
      if (!Array.isArray(arr)) return [];
      return arr
        .slice(1)
        .map((item: { time: string; activity: string; duration: number }) => ({
          id: uuidv4(),
          text: `${item.time} - ${item.activity}`,
          duration: item.duration, // default duration in minutes
          completed: false,
        }));
    } catch {
      return [];
    }
  };

  useEffect(() => {
    if (result) {
      try {
        const arr = JSON.parse(result);
        if (Array.isArray(arr) && arr.length > 0 && arr[0].response) {
          setAiMessage(arr[0].response);
        } else {
          setAiMessage(null);
        }
        const newTasks = parseResultToTasks(result);
        setTasks(newTasks);
      } catch {
        setAiMessage(null);
        setTasks([]);
      }
    }
  }, [result, setTasks]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    // Jika drop ke slot jam kosong
    if (over.id && typeof over.id === "string" && over.id.startsWith("slot-")) {
      const targetHour = over.id.replace("slot-", "");
      setTasks((prev) =>
        prev.map((task) =>
          task.id === active.id
            ? {
                ...task,
                text: `${targetHour} - ${task.text.split(" - ")[1]}`,
              }
            : task
        )
      );
      return;
    }

    // Jika drop ke card lain (swap waktu antara card A dan card B)
    if (active.id !== over.id) {
      setTasks((prev) => {
        const activeIdx = prev.findIndex((task) => task.id === active.id);
        const overIdx = prev.findIndex((task) => task.id === over.id);
        if (activeIdx === -1 || overIdx === -1) return prev;

        const activeTask = prev[activeIdx];
        const overTask = prev[overIdx];

        // Swap waktu
        const activeTime = activeTask.text.split(" - ")[0];
        const overTime = overTask.text.split(" - ")[0];

        const newTasks = [...prev];
        newTasks[activeIdx] = {
          ...activeTask,
          text: `${overTime} - ${activeTask.text.split(" - ")[1]}`,
        };
        newTasks[overIdx] = {
          ...overTask,
          text: `${activeTime} - ${overTask.text.split(" - ")[1]}`,
        };
        return newTasks;
      });
    }
  };

  useEffect(() => {
    if (result) {
      const newTasks = parseResultToTasks(result);
      setTasks(newTasks);
    }
  }, [result, setTasks]);
  console.log("Tasks after parsing result:", tasks);

  // Buat slot jam statis setiap 30 menit
  const slots: string[] = [];
  for (let hour = 6; hour <= 24; hour++) {
    for (let min = 0; min < 60; min += 15) {
      slots.push(
        `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`
      );
    }
  }

  // Gabungkan dengan waktu unik dari task
  const taskTimes = tasks.map((task) => task.text.split(" - ")[0]);
  const allSlotsSet = new Set([...slots, ...taskTimes]);
  const allSlots = Array.from(allSlotsSet).sort((a, b) => {
    const [ah, am] = a.split(":").map(Number);
    const [bh, bm] = b.split(":").map(Number);
    return ah !== bh ? ah - bh : (am ?? 0) - (bm ?? 0);
  });

  const slotIds = allSlots.map((h) => `slot-${h}`);
  const sortableItems = [...slotIds, ...tasks.map((task) => task.id)];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortableItems}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex">
          {/* Kolom jam statis */}
          <div className="flex flex-col items-start min-w-[70px]">
            {allSlots.map((h) => (
              <div
                key={h}
                className="h-44 flex items-start justify-end text-xs text-gray-400"
              >
                {h}
              </div>
            ))}
          </div>
          {/* Task list sejajar jam */}
          <div className="flex flex-col flex-1">
            {allSlots.map((h) => {
              const taskIdx = tasks.findIndex(
                (task) => task.text.split(" - ")[0] === h
              );
              return (
                <div
                  key={h}
                  className="h-44 flex items-start"
                  id={`slot-${h}`}
                  data-id={`slot-${h}`}
                >
                  {taskIdx !== -1 ? (
                    <div className="w-full">
                      <SortableTaskItem
                        index={taskIdx}
                        task={tasks[taskIdx]}
                        editTask={(newText: string, newDuration: number) =>
                          editTask(tasks[taskIdx].id, newText, newDuration)
                        }
                        deleteTask={() => deleteTask(tasks[taskIdx].id)}
                        toggleTaskCompletion={() =>
                          toggleTaskCompletion(taskIdx)
                        }
                      />
                    </div>
                  ) : (
                    <SortableSlot id={`slot-${h}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default TaskList;
