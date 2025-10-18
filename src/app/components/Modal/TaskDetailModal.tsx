// components/TaskDetailModal.jsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Task } from "@/types/task";

interface TaskDetailModalProps {
    task: Task | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

// Helper untuk format waktu
const formatTime = (totalMinutes: number) => {
  if (totalMinutes == null) return "";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

export function TaskDetailModal({ task, isOpen, onOpenChange }: TaskDetailModalProps) {
  if (!task) return null; // Jangan render apa-apa jika tidak ada task yang dipilih

  const startTime = formatTime(task.startMinutes);
  const endTime = formatTime(task.startMinutes + task.durationMinutes);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription>
            Detail Jadwal
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p><strong>Waktu:</strong> {startTime} - {endTime}</p>
          <p><strong>Durasi:</strong> {task.durationMinutes} menit</p>
          {/* Anda bisa menambahkan detail lain seperti deskripsi, dll. di sini */}
        </div>
      </DialogContent>
    </Dialog>
  );
}