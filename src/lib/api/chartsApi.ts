import { api } from "../api";
import {
  TargetChartData,
  ScoreDataPoint,
  HistoryDataPoint,
  CalendarChartResponse,
  FrequencyDataPoint,
  ChartPeriod,
} from "@/types/habits";

export const chartsApi = {
  /**
   * Get target vs actual for time periods
   */
  getTargetChart: async (habitId: string): Promise<TargetChartData> => {
    const response = await api.get(`/habits/${habitId}/charts/target`);
    return { ...response.data.data, unit: response.data.unit };
  },

  /**
   * Get score chart data (percentage over time)
   */
  getScoreChart: async (
    habitId: string,
    period: ChartPeriod = "day",
  ): Promise<ScoreDataPoint[]> => {
    const response = await api.get(`/habits/${habitId}/charts/score`, {
      params: { period },
    });
    return response.data.data;
  },

  /**
   * Get history chart data (actual values)
   */
  getHistoryChart: async (
    habitId: string,
    period: ChartPeriod = "day",
  ): Promise<HistoryDataPoint[]> => {
    const response = await api.get(`/habits/${habitId}/charts/history`, {
      params: { period },
    });
    return response.data.data;
  },

  /**
   * Get calendar heatmap data
   */
  getCalendarChart: async (
    habitId: string,
    months: number = 3,
  ): Promise<CalendarChartResponse> => {
    const response = await api.get(`/habits/${habitId}/charts/calendar`, {
      params: { months },
    });
    return response.data;
  },

  /**
   * Get frequency chart data
   */
  getFrequencyChart: async (habitId: string): Promise<FrequencyDataPoint[]> => {
    const response = await api.get(`/habits/${habitId}/charts/frequency`);
    return response.data.data;
  },
};
