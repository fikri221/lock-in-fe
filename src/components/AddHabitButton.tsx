import React from "react";

interface AddHabitButtonProps {
  setShowAddModal: (show: boolean) => void;
}

export default function AddHabitButton({
  setShowAddModal,
}: AddHabitButtonProps) {
  return (
    <button
      onClick={() => setShowAddModal(true)}
      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
    >
      Tambah Habit
    </button>
  );
}
