import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import TaskItem from "./TaskItem";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  duration?: number;
}

interface SortableTaskItemProps {
  task: Task;
  index: number;
  editTask: (newText: string, newDuration: number) => void;
  deleteTask: () => void;
  toggleTaskCompletion: () => void;
}

export function SortableTaskItem({
  task,
  editTask,
  deleteTask,
  toggleTaskCompletion,
}: SortableTaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: "flex",
    alignItems: "start",
    gap: 8,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {/* Drag handle */}
      <div
        {...listeners}
        style={{
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <GripVertical size={18} strokeWidth={2} color="#6b7280" />
      </div>

      {/* Task Content */}
      <TaskItem
        task={task}
        editTask={editTask}
        deleteTask={deleteTask}
        toggleTaskCompletion={toggleTaskCompletion}
      />
    </div>
  );
}