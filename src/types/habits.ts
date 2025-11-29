export enum LogCompletionType {
  COMPLETED = "COMPLETED",
  SKIPPED = "SKIPPED",
  FAILED = "FAILED",
}

export enum HabitFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
}

export enum HabitViewMode {
  TODAY = "today",
  CALENDAR = "calendar",
  INSIGHTS = "insights",
}

export interface CreateHabitRequest {
  name: string;
  description?: string;
  type?: string;
  icon?: string;
  color?: string;
  scheduledTime?: string;
  isWeatherDependent?: boolean;
  requiresGoodWeather?: boolean;
  isActive: boolean;
}

export interface UpdateHabitRequest {
  name?: string;
  description?: string;
  type?: string;
  icon?: string;
  color?: string;
  scheduledTime?: string;
  isWeatherDependent?: boolean;
  requiresGoodWeather?: boolean;
  isActive?: boolean;
}

export interface Habit extends CreateHabitRequest {
  id: string;
  currentStreak: number;
  totalCompletions: number;
  logs?: LogCompletion[];
  createdAt: string; // tambahkan
  updatedAt: string; // tambahkan
}

export interface LogCompletion {
  status: LogCompletionType;
  notes?: string;
  mood?: number;
  energy?: number;
  weather?: JSON;
}
