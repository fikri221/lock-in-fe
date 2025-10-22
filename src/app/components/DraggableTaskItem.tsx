"use client";
import { Task } from "@/types/task";
import { useDraggable } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import React from "react";

interface DraggableTaskItemProps {
  task: Task;
  hourHeightInRem: number;
  overlapIndex?: number;
  overlapCount?: number;
  onTaskClick: (task: Task) => void;
  dragPreviewData?: { startTime: number; endTime: number } | null;
  isPreview?: boolean; // Flag untuk styling
}

// Format waktu untuk ditampilkan (opsional)
const formatTime = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
};

export default React.memo(function DraggableTaskItem({
  task,
  dragPreviewData,
  isPreview = false,
  hourHeightInRem,
  overlapIndex = 0, // Default 0
  overlapCount = 1, // Default 1
  onTaskClick,
}: DraggableTaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    });

  // Kalkulasi posisi dan tinggi berdasarkan menit
  const topPositionInRem = (task.startMinutes / 60) * hourHeightInRem;
  const heightInRem = (task.durationMinutes / 60) * hourHeightInRem;

  // SNAP TRANSFORM
  let snappedTransform = transform;
  if (transform && isDragging && !isPreview) {
    // Konversi 1rem = 16px
    const pixelsPerRem = 16;
    const hourHeightInPixels = hourHeightInRem * pixelsPerRem;
    const pixelsPerSnap = (hourHeightInPixels / 60) * 15; // 15 menit

    // Hitung posisi absolut setelah transform
    const currentTopPixels = topPositionInRem * pixelsPerRem;
    const newTopPixels = currentTopPixels + transform.y;

    // Snap ke grid terdekat
    const snappedTopPixels =
      Math.round(newTopPixels / pixelsPerSnap) * pixelsPerSnap;

    // Hitung transform Y yang di-snap
    const snappedY = snappedTopPixels - currentTopPixels;

    snappedTransform = {
      ...transform,
      y: snappedY,
    };
  }

  const startTime = formatTime(
    dragPreviewData ? dragPreviewData.startTime : task.startMinutes
  );
  const endTime = formatTime(
    dragPreviewData
      ? dragPreviewData.endTime
      : task.startMinutes + task.durationMinutes
  );

  // Kalkulasi lebar dan posisi kiri berdasarkan overlap
  // Jika overlapCount adalah 1, berarti tidak ada tumpang tindih
  // Jika overlapCount adalah 2, berarti ada 2 item yang tumpang tindih
  // Jika overlapCount adalah 3, berarti ada 3 item yang tumpang tindih
  // dst.
  const safeOverlapCount = Math.max(overlapCount ?? 1, 1);
  const widthPercent = 100 / safeOverlapCount;

  // const widthPercent = isOverlapped ? 50 : 100; // Contoh: 50% jika overlapped, 100% jika tidak
  // const leftPercent = isOverlapped ? widthPercent * overlapIndex : 0; // Geser berdasarkan index jika overlapped
  // Kalkulasi left dalam persen berdasarkan index dan lebar
  const leftPercent = widthPercent * overlapIndex;

  // const overlappedStyle =
  //   overlapCount > 1
  //     ? {
  //         width: `calc(${widthPercent}% - 8px)`,
  //         left: `calc(${leftPercent}% + 5px)`,
  //       }
  //     : {
  //         width: "calc(100% - 10px)",
  //         left: "5px",
  //       };

  // Objek style dasar yang sama untuk keduanya (asli & preview)
  const baseStyle: React.CSSProperties = {
    height: `${heightInRem}rem`,
    width:
      overlapCount > 0
        ? `calc((100% / ${overlapCount}) - 8px)`
        : "calc(100% - 10px)",
  };

  // Objek style yang akan digabungkan
  let finalStyle: React.CSSProperties;

  if (isPreview) {
    // Ambil ukuran asli elemen sebelum di-drag
    const originalWidth = "100%";

    finalStyle = {
      ...baseStyle,
      width: originalWidth, // fix: hindari calc relatif terhadap viewport
      position: "relative", // biar tidak bergantung posisi absolute parent
      left: 0,
      boxShadow:
        "0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)",
    };
  } else {
    // Style untuk ITEM ASLI (di dalam grid kalender)
    const overlappedPosition =
      overlapCount > 1
        ? { left: `calc(${leftPercent}% + 5px)` }
        : { left: "5px" };

    finalStyle = {
      ...baseStyle,
      ...overlappedPosition, // Terapkan 'left'
      top: `${topPositionInRem}rem`, // Terapkan 'top'
      transform: snappedTransform
        ? `translate3d(${snappedTransform.x}px, ${snappedTransform.y}px, 0)`
        : undefined,
      visibility: isDragging ? "hidden" : "visible", // Sembunyikan item asli saat di-drag
    };
  }

  // --- Style untuk posisi dan transformasi ---
  // const style = {
  //   ...overlappedStyle,
  //   opacity: isDragging && !isPreview ? 0 : 1, // Sembunyikan item asli saat drag, kecuali ini preview
  //   top: `${topPositionInRem}rem`,
  //   height: `${heightInRem}rem`,
  //   // Terapkan transform HANYA jika ini bukan preview
  //   // Preview akan diposisikan oleh DragOverlay
  //   transform:
  //     !isPreview && transform
  //       ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
  //       : undefined,
  //   boxShadow: isPreview
  //     ? "0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)"
  //     : undefined,
  //   // Kita gunakan variabel CSS untuk warna agar bisa dipakai di hover juga
  //   "--task-color": `var(--color-${color})`,
  // };

  // Buat fungsi click handler terpisah untuk logika tambahan
  const handleClick = () => {
    // Hanya panggil onTaskClick jika item tidak sedang di-drag
    // Ini mencegah modal terbuka saat Anda baru mulai menggeser item.
    if (!isDragging && onTaskClick) {
      onTaskClick(task);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={finalStyle} // Gunakan style final yang sudah dikondisikan
      // Gabungkan semua kelas styling di sini
      className={`
        absolute z-10 flex items-stretch text-left
        p-3 pr-1 rounded-lg
        bg-gray-800 dark:bg-slate-800
        border-l-4 border-gray-500 dark:border-gray-400
        shadow-sm hover:shadow-md hover:bg-gray-600 dark:hover:bg-slate-700/50
        ${isPreview ? "z-50" : ""}
      `}
    >
      {/* DIV KONTEN (untuk diklik) */}
      <div className="flex-grow cursor-pointer" onClick={handleClick}>
        <p className="font-semibold text-sm text-white dark:text-gray-100">
          {task.title}
        </p>
        <p className="text-xs text-white dark:text-gray-400 mt-1">
          {startTime} - {endTime}
        </p>
      </div>

      {/* DRAG HANDLE */}
      <div
        className="flex-shrink-0 w-8 flex items-center justify-center cursor-grab text-gray-400 hover:text-white"
        {...listeners}
        {...attributes}
      >
        {/* Ikon grip dari lucide-react atau SVG Anda */}
        <GripVertical size={18} />
      </div>
    </div>
  );
});
