import type { RequestHandler } from "express";

import { getDashboardMonthly, getDashboardSummary } from "./dashboard.service";

const getQueryValue = (value: unknown) => (typeof value === "string" ? value : undefined);

export const getDashboardSummaryController: RequestHandler = async (request, response, next) => {
  try {
    response.json({
      summary: await getDashboardSummary({
        month: getQueryValue(request.query.month),
        year: getQueryValue(request.query.year)
      })
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardMonthlyController: RequestHandler = async (request, response, next) => {
  try {
    response.json({
      monthly: await getDashboardMonthly({
        year: getQueryValue(request.query.year)
      })
    });
  } catch (error) {
    next(error);
  }
};
