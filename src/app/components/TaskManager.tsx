"use client"; // Make this a Client Component
import React, { useState } from "react";
import TaskInput from "./TaskInput";
import TaskList from "./TaskList";
import useTaskManager from "../hooks/useTaskManager"; // Import the custom hook
import CardListLoading from "./Loading/CardListLoading";
import CalendarView from "./CalendarView";

const TaskManager: React.FC = () => {
  // Call the custom hook directly in this component
  const { tasks, editTask, deleteTask, setTasks, toggleTaskCompletion } =
    useTaskManager();
  const [task, setTask] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Optionally, you can handle any additional logic after adding the task
      // For example, you might want to log the task or show a success message
      const res = await fetch("http://localhost:5000/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task }),
      });

      const data = await res.json();
      setResult(JSON.stringify(data)); // kirim ke parent
      console.log("Task added:", JSON.stringify(data));
    } catch (error) {
      setResult("⚠️ Gagal mengambil respon dari AI.");
      console.error("Failed to add task:", error);
    } finally {
      setIsLoading(false);
      setTask(""); // Clear the input field after submission
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto pb-20">
        {isLoading ? (
          <CardListLoading />
        ) : (
          <CalendarView />
        )}
        <div className="fixed bottom-0 left-0 w-full bg-white px-4 py-6 shadow-md">
          <div className="max-w-3xl mx-auto">
            <TaskInput task={task} setTask={setTask} onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskManager;
