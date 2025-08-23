import React, { useEffect } from "react";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable
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

  const hours = Array.from(
    { length: 24 },
    (_, i) => `${String(i).padStart(2, "0")}:00`
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-[50px_1fr] gap-x-2">
      {hours.map((hour) => (
        <div key={hour} className="py-2 border-b last:border-b-0">
          <span className="text-sm text-gray-500">{hour}</span>
        </div>
      ))}
      {/* Area untuk task */}
      <div className="relative">{/* Di sini task akan dirender */}</div>
    </div>
  );
};

export default TaskList;
