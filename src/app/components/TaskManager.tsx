"use client"; // Make this a Client Component
import React, { useState } from "react";
import TaskInput from "./TaskInput";
import CardListLoading from "./Loading/CardListLoading";
import CalendarView from "./CalendarView";
import DateCarousel from "./DateCarousel";
import ThemeToggle from "./Navbar/ThemeToggle";

const TaskManager: React.FC = () => {
  // Call the custom hook directly in this component
  // const { tasks, editTask, deleteTask, setTasks, toggleTaskCompletion } =
  //   useTaskManager();
  // State untuk menyimpan semua task
  const [tasks, setTasks] = useState([
    // Contoh data awal
    {
      id: "task-1",
      title: "Meeting",
      startMinutes: 9 * 60,
      durationMinutes: 120,
      // Format: YYYY-MM-DDTHH:mm:ss.sssZ (Z = UTC)
      startTime: "2025-09-13T09:00:00.000Z",
      endTime: "2025-09-13T10:00:00.000Z",
    }, // 09:00, 2 jam
    {
      id: "task-2",
      title: "Kerjakan Laporan",
      startMinutes: 13 * 60 + 30,
      durationMinutes: 60,
      // Format: YYYY-MM-DDTHH:mm:ss.sssZ (Z = UTC)
      startTime: "2025-09-13T13:30:00.000Z",
      endTime: "2025-09-13T14:30:00.000Z",
    }, // 13:30, 1 jam
  ]);
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
        body: JSON.stringify({ tasks }),
      });

      const data = await res.json();
      setResult(JSON.stringify(data)); // kirim ke parent
      console.log("Task added:", JSON.stringify(data));
    } catch (error) {
      setResult("⚠️ Gagal mengambil respon dari AI.");
      console.error("Failed to add task:", error);
    } finally {
      setIsLoading(false);
      setTasks([]); // Clear the input field after submission
    }
  };

  return (
    <>
      <h1 className="text-l">
        <DateCarousel />
        <ThemeToggle />
      </h1>
      <div className="min-h-screen">
        <div className="max-w-3xl mx-auto pb-20">
          {isLoading ? (
            <CardListLoading />
          ) : (
            <CalendarView tasks={tasks} setTasks={setTasks} />
          )}
          <div className="fixed bottom-0 left-0 w-full  px-4 py-6 shadow-md">
            <div className="max-w-3xl mx-auto">
              <TaskInput
                task={tasks}
                setTask={setTasks}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskManager;
