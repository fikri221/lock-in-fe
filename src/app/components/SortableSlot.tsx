import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableSlotProps {
  id: string;
}

export function SortableSlot({ id }: SortableSlotProps) {
  const { setNodeRef, attributes, listeners, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="w-full ml-6 h-42 border-dashed border-2 border-gray-200 rounded bg-gray-50"
    />
  );
}