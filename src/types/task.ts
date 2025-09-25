export interface Task {
  id: string;
  title: string;
  startMinutes: number;
  durationMinutes: number;
  startTime: string;
  endTime: string;
}

export type Tasks = Task[];
