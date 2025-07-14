import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  deleteTask: (id: string) => void;
  toggleTaskCompletion: () => void;
}

export function SortableTaskItem({
  task,
  editTask,
  deleteTask,
  toggleTaskCompletion,
}: SortableTaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <span
        {...listeners}
        style={{ cursor: "grab", marginRight: 8, userSelect: "none" }}
        tabIndex={0}
        aria-label="Drag"
      >
        ⠿
      </span>
      <TaskItem
        task={task}
        editTask={editTask}
        deleteTask={deleteTask}
        toggleTaskCompletion={toggleTaskCompletion}
      />
    </div>
  );
}
