export interface Task {
  id: string;
  title: string;
  startMinutes: number;
  durationMinutes: number;
  date: string;
}

export type Tasks = Task[];
