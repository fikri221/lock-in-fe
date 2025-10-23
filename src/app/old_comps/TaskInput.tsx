"use client";
import React from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { Tasks } from "@/types/task";

interface TaskInputProps {
  task: Tasks;
  setTask: (task: Tasks) => void;
  onSubmit: () => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ task, setTask, onSubmit }) => {

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (task.length > 0) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center space-x-2 border rounded-2xl px-4 py-2 bg-gray-100">
        <TextareaAutosize
          minRows={1}
          maxRows={5}
          placeholder="Type your message..."
          value={task[0]?.title ?? ""}
          onChange={(e) => {
            const updatedTask = [...task];
            if (updatedTask.length > 0) {
              updatedTask[0] = { ...updatedTask[0], title: e.target.value };
              setTask(updatedTask);
            }
          }}
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
