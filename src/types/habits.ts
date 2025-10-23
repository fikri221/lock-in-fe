export interface HabitTrackerProps {
  id: string;
  name: string;
  why: string;
  minDuration: number;
  idealDuration: number;
  frequency: HabitFrequency;
  customDays?: number[]; // For weekly frequency, days of the week (0-6) to perform the habit
  completions: Completions;
}

type Completions = {
  [date: string]: CompletionRecord;
};

type CompletionRecord = {
  type: HabitCompletionType;
  duration: number;
  reason: string;
  timestamp: string;
};

export enum HabitCompletionType {
  FULL = "full",
  PARTIAL = "partial",
  SKIP = "skip",
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
