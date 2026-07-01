import { apiRequest } from "./client";

export type DashboardSummary = {
  period: {
    month: string | null;
    year: number;
    start: string;
    end: string;
  };
  totals: {
    entry: string;
    exit: string;
    refund: string;
    pending: string;
    transmitted: string;
    balance: string;
  };
  counts: {
    entry: number;
    exit: number;
    refund: number;
    pending: number;
    transmitted: number;
    imports: number;
  };
};

export type MonthlyIndicator = {
  month: string;
  totals: {
    entry: string;
    exit: string;
    refund: string;
    pending: string;
    transmitted: string;
    balance: string;
    total: string;
  };
  counts: {
    entry: number;
    exit: number;
    refund: number;
    pending: number;
    transmitted: number;
    total: number;
  };
};

type DashboardSummaryResponse = {
  summary: DashboardSummary;
};

type DashboardMonthlyResponse = {
  monthly: {
    year: number;
    months: MonthlyIndicator[];
  };
};

export const getDashboardSummary = async (month: string) => {
  const response = await apiRequest<DashboardSummaryResponse>(`/dashboard/summary?month=${encodeURIComponent(month)}`);

  return response.summary;
};

export const getDashboardMonthly = async (year: string) => {
  const response = await apiRequest<DashboardMonthlyResponse>(`/dashboard/monthly?year=${encodeURIComponent(year)}`);

  return response.monthly;
};
