export enum LogCompletionType {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  SKIPPED = "SKIPPED",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
}

export enum HabitFrequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
}

export enum HabitViewMode {
  TODAY = "TODAY",
  CALENDAR = "CALENDAR",
  INSIGHTS = "INSIGHTS",
}

export interface CreateHabitRequest {
  name: string;
  description?: string;
  category?: string;
  icon?: string;
  color?: string;
  frequency?: HabitFrequency | string;
  habitType: string;
  targetUnit?: string;
  targetValue?: number;
  targetCount?: number;
  targetDays?: number[];
  allowFlexible: boolean;
  scheduledTime?: string;
  isWeatherDependent?: boolean;
  requiresGoodWeather?: boolean;
  reminderEnabled?: boolean;
  isActive: boolean;
}

export interface UpdateHabitRequest {
  name?: string;
  description?: string;
  category?: string;
  icon?: string;
  color?: string;
  frequency?: HabitFrequency | string;
  habitType?: string;
  targetUnit?: string;
  targetValue?: number;
  targetCount?: number;
  targetDays?: number[];
  allowFlexible?: boolean;
  scheduledTime?: string;
  isWeatherDependent?: boolean;
  requiresGoodWeather?: boolean;
  reminderEnabled?: boolean;
  isActive?: boolean;
}

export interface Habit extends CreateHabitRequest {
  id: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  logs?: LogCompletion[];
  createdAt: string;
  updatedAt: string;
}

export interface LogCompletion {
  status: LogCompletionType;
  notes?: string;
  mood?: number;
  energy?: number;
  weather?: JSON;
  cancelledAt?: string;
  cancelledReason?: string;
  progressValue?: number;
}
