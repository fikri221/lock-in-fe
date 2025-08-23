// components/AddTaskModal.jsx
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// Update the import path to the correct location of Input
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface AddTaskModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (task: { title: string }) => void;
    selectedHour?: string; // Jam yang dipilih untuk task
}

export function AddTaskModal({ isOpen, onOpenChange, onSave, selectedHour }: AddTaskModalProps) {
  const [title, setTitle] = useState('');

  const handleSave = () => {
    if (title.trim()) {
      onSave({ title });
      setTitle(''); // Reset form
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Task Baru</DialogTitle>
          <DialogDescription>
            Isi detail task untuk jam {selectedHour}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Judul Task
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              className="col-span-3"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}