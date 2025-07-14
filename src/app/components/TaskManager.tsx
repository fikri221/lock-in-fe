"use client"; // Make this a Client Component

import React from "react";
import TaskInput from "./TaskInput";
import TaskList from "./TaskList";
import useTaskManager from "../hooks/useTaskManager"; // Import the custom hook

const TaskManager: React.FC = () => {
  // Call the custom hook directly in this component
  const {
    tasks,
    addTask,
    editTask,
    deleteTask,
    setTasks,
    toggleTaskCompletion,
  } = useTaskManager();

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto pt-8 pb-14">
        <TaskList
          tasks={tasks}
          editTask={editTask}
          deleteTask={deleteTask}
          setTasks={setTasks}
          toggleTaskCompletion={toggleTaskCompletion}
        />
        <div className="fixed bottom-0 left-0 w-full bg-white px-4 py-6 shadow-md">
          <div className="max-w-3xl mx-auto">
            <TaskInput addTask={addTask} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskManager;
