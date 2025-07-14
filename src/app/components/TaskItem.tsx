import React, { useState, useEffect, useRef } from "react";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  duration?: number; // dalam menit
}

interface TaskItemProps {
  task: Task;
  toggleTaskCompletion: () => void;
  editTask: (newText: string, newDuration: number) => void;
  deleteTask: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  toggleTaskCompletion,
  editTask,
  deleteTask,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editDuration, setEditDuration] = useState(task.duration ?? 30);

  // Timer state
  const [secondsLeft, setSecondsLeft] = useState((task.duration ?? 30) * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start/Pause timer
  const handleStartPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRunning((prev) => !prev);
  };

  // Reset timer
  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSecondsLeft((task.duration ?? 30) * 60);
    setIsRunning(false);
  };

  // Timer effect
  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (secondsLeft === 0 && intervalRef.current) {
      clearInterval(intervalRef.current);
      setIsRunning(false);
      // Optional: alert("Waktu task habis!");
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, secondsLeft]);

  // Format timer
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editText.trim()) {
      editTask(editText, editDuration);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`flex flex-col gap-1 p-4 mb-3 bg-white rounded-xl shadow transition hover:shadow-lg cursor-pointer border ${
        task.completed ? "opacity-60 border-green-400" : "border-gray-200"
      }`}
      onClick={!isEditing ? toggleTaskCompletion : undefined}
    >
      <div className="flex items-center justify-between w-full">
        {isEditing ? (
          <form
            onSubmit={handleEdit}
            className="flex-1 flex gap-2 items-center"
          >
            <input
              className="flex-1 border rounded px-2 py-1 text-sm"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            <button type="submit" className="text-blue-500">
              Simpan
            </button>
            <button
              type="button"
              className="text-gray-400"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(false);
                setEditText(task.text);
                setEditDuration(task.duration ?? 30);
                setSecondsLeft((task.duration ?? 30) * 60);
              }}
            >
              Batal
            </button>
          </form>
        ) : (
          <>
            <span
              className={`text-base ${
                task.completed ? "line-through text-gray-400" : "text-gray-800"
              }`}
            >
              {task.text}
            </span>
            <div className="flex items-center gap-2">
              <button
                className="text-xs text-blue-500"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              >
                Edit
              </button>
              <button
                className="text-xs text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTask();
                }}
              >
                Hapus
              </button>
              <span className="text-lg">{task.completed ? "✔️" : "⏳"}</span>
            </div>
          </>
        )}
      </div>
      {/* Timer Section */}
      <div className="flex items-center gap-2 mt-1">
        {isEditing ? (
          <>
            <input
              type="number"
              min={1}
              className="w-20 border rounded px-2 py-1 text-sm"
              value={editDuration}
              onChange={(e) => {
                setEditDuration(Number(e.target.value));
                setSecondsLeft(Number(e.target.value) * 60);
              }}
              onClick={(e) => e.stopPropagation()}
              style={{ width: 60 }}
              placeholder="Durasi"
            />
            <span className="text-xs text-gray-500">Menit</span>
          </>
        ) : (
          <>
            <span className="text-xs text-gray-500">
              {formatTime(secondsLeft)}
            </span>
            <button
              className="text-xs px-2 py-1 rounded bg-blue-100 hover:bg-blue-200"
              onClick={handleStartPause}
            >
              {isRunning ? "Pause" : "Start"}
            </button>
            <button
              className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
              onClick={handleReset}
            >
              Reset
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
