import { useDroppable } from "@dnd-kit/core";
import React from "react";

export default function CalendarDropContainer({ children }: React.PropsWithChildren<object>) {
  const { setNodeRef } = useDroppable({ id: "calendar-container" });
  return <div ref={setNodeRef} className="relative">{children}</div>;
}
