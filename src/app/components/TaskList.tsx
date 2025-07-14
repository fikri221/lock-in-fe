import React from "react";
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
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  toggleTaskCompletion,
  editTask,
  deleteTask,
  setTasks,
}) => {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over?.id);
      setTasks(arrayMove(tasks, oldIndex, newIndex));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="task-list">
          {tasks.length === 0 ? (
            <p>Tidak ada tugas untuk ditampilkan.</p>
          ) : (
            tasks.map((task, index) => (
              <SortableTaskItem
                index={index}
                key={task.id}
                task={task}
                editTask={(newText: string, newDuration: number) => editTask(task.id, newText, newDuration)}
                deleteTask={ () => deleteTask(task.id)}
                toggleTaskCompletion={() => toggleTaskCompletion(index)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default TaskList;
