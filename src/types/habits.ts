// export interface HabitTrackerProps {
//   id: string;
//   name: string;
//   why: string;
//   minDuration: number;
//   idealDuration: number;
//   frequency: HabitFrequency;
//   customDays?: number[]; // For weekly frequency, days of the week (0-6) to perform the habit
//   completions: Completions;
// }

// export type Completions = {
//   [date: string]: CompletionRecord;
// };

// export type CompletionRecord = {
//   type: HabitCompletionType;
//   duration: number;
//   reason: string;
//   timestamp: string;
// };

export enum LogCompletionType {
  FULL = "COMPLETED",
  PARTIAL = "SKIPPED",
  SKIP = "FAILED",
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

export interface Habit {
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

export interface LogCompletion {
  status: LogCompletionType;
  notes?: string;
  mood?: number;
  energy?: number;
  weather?: JSON;
}
