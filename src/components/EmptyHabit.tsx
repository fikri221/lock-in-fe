import { Target } from "lucide-react";
import React from "react";

export default function EmptyHabit() {
  return (
    <>
      <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        Belum ada habit
      </h3>
      <p className="text-gray-500 mb-4">
        Mulai dengan menambahkan habit pertamamu!
      </p>
    </>
  );
}
