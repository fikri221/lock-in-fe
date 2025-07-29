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

  const parseResultToTasks = (result: string): Task[] => {
    try {
      const arr = JSON.parse(result);
      if (!Array.isArray(arr)) return [];
      return arr.map((item: { time: string; activity: string }) => ({
        id: uuidv4(),
        text: `${item.time} - ${item.activity}`,
        completed: false,
      }));
    } catch {
      return [];
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over?.id);
      setTasks(arrayMove(tasks, oldIndex, newIndex));
    }
  };

  useEffect(() => {
    if (result) {
      const newTasks = parseResultToTasks(result);
      setTasks(newTasks);
    }
  }, [result, setTasks]);
  console.log("Tasks after parsing result:", tasks);

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
            <>
              {tasks.map((task, index) => (
                <SortableTaskItem
                  index={index}
                  key={task.id}
                  task={task}
                  editTask={(newText: string, newDuration: number) =>
                    editTask(task.id, newText, newDuration)
                  }
                  deleteTask={() => deleteTask(task.id)}
                  toggleTaskCompletion={() => toggleTaskCompletion(index)}
                />
              ))}
            </>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default TaskList;
