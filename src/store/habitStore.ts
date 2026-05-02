import { create } from "zustand";
import { Habit } from "@/types/habits";

interface HabitState {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  // Fungsi untuk mengupdate state, mendukung format (prev) => newPrev
  setHabits: (habits: Habit[] | ((prev: Habit[]) => Habit[])) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useHabitStore = create<HabitState>((set) => ({
  habits: [],
  loading: true, // Default true saat aplikasi pertama kali dimuat
  error: null,
  
  // setHabits dibuat fleksibel agar bisa menerima nilai langsung atau fungsi callback
  // Ini penting untuk Optimistic Updates (karena kita butuh data state sebelumnya)
  setHabits: (habitsOrUpdater) =>
    set((state) => ({
      habits:
        typeof habitsOrUpdater === "function"
          ? habitsOrUpdater(state.habits)
          : habitsOrUpdater,
    })),
    
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
