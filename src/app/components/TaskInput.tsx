"use client";
import React, { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";

interface TaskInputProps {
  addTask: (task: string) => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ addTask }) => {
  const [task, setTask] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task.trim()) {
      addTask(task);
      setTask("");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center space-x-2 border rounded-2xl px-4 py-2 bg-gray-100">
        <TextareaAutosize
          minRows={1}
          maxRows={5}
          placeholder="Type your message..."
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="flex-1 resize-none border-none bg-transparent focus:ring-0 focus:outline-none text-sm"
        />
        <Button type="submit" className="shrink-0">
          Send
        </Button>
      </div>
    </form>
  );
};

export default TaskInput;
