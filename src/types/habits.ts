export enum LogCompletionType {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  SKIPPED = "SKIPPED",
  CANCELLED = "CANCELLED",
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
  category?: string;
  icon?: string;
  color?: string;
  habitType: string;
  targetUnit?: string;
  targetValue?: number;
  targetCount?: number;
  allowFlexible: boolean;
  scheduledTime?: string;
  isWeatherDependent?: boolean;
  requiresGoodWeather?: boolean;
  isActive: boolean;
}

export interface UpdateHabitRequest {
  name?: string;
  description?: string;
  category?: string;
  icon?: string;
  color?: string;
  habitType?: string;
  targetUnit?: string;
  targetValue?: number;
  targetCount?: number;
  allowFlexible?: boolean;
  scheduledTime?: string;
  isWeatherDependent?: boolean;
  requiresGoodWeather?: boolean;
  isActive?: boolean;
}

export interface Habit extends CreateHabitRequest {
  id: string;
  currentStreak: number;
  longestStreak: number;
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
  cancelledAt?: string;
  cancelledReason?: string;
}
