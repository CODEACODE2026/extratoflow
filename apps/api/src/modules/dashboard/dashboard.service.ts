import { Prisma, TransactionStatus, TransactionType } from "@prisma/client";

import { prisma } from "../../database/prisma/client";
import { AppError } from "../../shared/errors/app-error";

type SummaryFilters = {
  month?: string;
  year?: string;
};

type MonthlyFilters = {
  year?: string;
};

type DashboardPeriod = {
  start: Date;
  end: Date;
  month?: string;
  year: number;
};

type DashboardTotals = {
  entry: Prisma.Decimal;
  exit: Prisma.Decimal;
  refund: Prisma.Decimal;
  pending: Prisma.Decimal;
  transmitted: Prisma.Decimal;
  balance: Prisma.Decimal;
  total: Prisma.Decimal;
};

const zeroTotals = (): DashboardTotals => ({
  entry: new Prisma.Decimal(0),
  exit: new Prisma.Decimal(0),
  refund: new Prisma.Decimal(0),
  pending: new Prisma.Decimal(0),
  transmitted: new Prisma.Decimal(0),
  balance: new Prisma.Decimal(0),
  total: new Prisma.Decimal(0)
});

const decimalToString = (value: Prisma.Decimal) => value.toFixed(2);

const parseYear = (year: string | undefined) => {
  const value = year ?? String(new Date().getUTCFullYear());

  if (!/^\d{4}$/.test(value)) {
    throw new AppError("Year must use YYYY format.", 400, "INVALID_YEAR");
  }

  return Number(value);
};

const parseMonthPeriod = (month: string) => {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new AppError("Month must use YYYY-MM format.", 400, "INVALID_MONTH");
  }

  const [yearValue, monthValue] = month.split("-").map(Number);

  if (monthValue < 1 || monthValue > 12) {
    throw new AppError("Month must be between 01 and 12.", 400, "INVALID_MONTH");
  }

  return {
    start: new Date(Date.UTC(yearValue, monthValue - 1, 1)),
    end: new Date(Date.UTC(yearValue, monthValue, 1)),
    month,
    year: yearValue
  };
};

const buildSummaryPeriod = (filters: SummaryFilters): DashboardPeriod => {
  if (filters.month) {
    return parseMonthPeriod(filters.month);
  }

  const year = parseYear(filters.year);

  return {
    start: new Date(Date.UTC(year, 0, 1)),
    end: new Date(Date.UTC(year + 1, 0, 1)),
    year
  };
};

const buildDateWhere = (period: DashboardPeriod): Prisma.TransactionWhereInput => ({
  paymentDate: {
    gte: period.start,
    lt: period.end
  }
});

const sumAmount = async (where: Prisma.TransactionWhereInput) => {
  const result = await prisma.transaction.aggregate({
    where,
    _sum: {
      amount: true
    },
    _count: {
      _all: true
    }
  });

  return {
    amount: result._sum.amount ?? new Prisma.Decimal(0),
    count: result._count._all
  };
};

export const getDashboardSummary = async (filters: SummaryFilters) => {
  const period = buildSummaryPeriod(filters);
  const dateWhere = buildDateWhere(period);

  const [entries, exits, refunds, pending, transmitted, imports] = await Promise.all([
    sumAmount({ ...dateWhere, type: TransactionType.entry }),
    sumAmount({ ...dateWhere, type: TransactionType.exit }),
    sumAmount({ ...dateWhere, type: TransactionType.refund }),
    sumAmount({ ...dateWhere, status: TransactionStatus.pending }),
    sumAmount({ ...dateWhere, status: TransactionStatus.transmitted }),
    prisma.import.count({
      where: {
        createdAt: {
          gte: period.start,
          lt: period.end
        }
      }
    })
  ]);

  return {
    period: {
      month: period.month ?? null,
      year: period.year,
      start: period.start,
      end: period.end
    },
    totals: {
      entry: decimalToString(entries.amount),
      exit: decimalToString(exits.amount),
      refund: decimalToString(refunds.amount),
      pending: decimalToString(pending.amount),
      transmitted: decimalToString(transmitted.amount),
      balance: decimalToString(entries.amount.plus(refunds.amount).minus(exits.amount))
    },
    counts: {
      entry: entries.count,
      exit: exits.count,
      refund: refunds.count,
      pending: pending.count,
      transmitted: transmitted.count,
      imports
    }
  };
};

export const getDashboardMonthly = async (filters: MonthlyFilters) => {
  const year = parseYear(filters.year);
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));
  const months = Array.from({ length: 12 }, (_, index) => ({
    month: `${year}-${String(index + 1).padStart(2, "0")}`,
    totals: zeroTotals(),
    counts: {
      entry: 0,
      exit: 0,
      refund: 0,
      pending: 0,
      transmitted: 0,
      total: 0
    }
  }));

  const transactions = await prisma.transaction.findMany({
    where: {
      paymentDate: {
        gte: start,
        lt: end
      }
    },
    select: {
      paymentDate: true,
      type: true,
      status: true,
      amount: true
    }
  });

  for (const transaction of transactions) {
    const monthIndex = transaction.paymentDate.getUTCMonth();
    const bucket = months[monthIndex];

    bucket.totals.total = bucket.totals.total.plus(transaction.amount);
    bucket.counts.total += 1;

    if (transaction.type === TransactionType.entry) {
      bucket.totals.entry = bucket.totals.entry.plus(transaction.amount);
      bucket.counts.entry += 1;
    } else if (transaction.type === TransactionType.exit) {
      bucket.totals.exit = bucket.totals.exit.plus(transaction.amount);
      bucket.counts.exit += 1;
    } else {
      bucket.totals.refund = bucket.totals.refund.plus(transaction.amount);
      bucket.counts.refund += 1;
    }

    if (transaction.status === TransactionStatus.pending) {
      bucket.totals.pending = bucket.totals.pending.plus(transaction.amount);
      bucket.counts.pending += 1;
    } else {
      bucket.totals.transmitted = bucket.totals.transmitted.plus(transaction.amount);
      bucket.counts.transmitted += 1;
    }

    bucket.totals.balance = bucket.totals.entry.plus(bucket.totals.refund).minus(bucket.totals.exit);
  }

  return {
    year,
    months: months.map((bucket) => ({
      month: bucket.month,
      totals: {
        entry: decimalToString(bucket.totals.entry),
        exit: decimalToString(bucket.totals.exit),
        refund: decimalToString(bucket.totals.refund),
        pending: decimalToString(bucket.totals.pending),
        transmitted: decimalToString(bucket.totals.transmitted),
        balance: decimalToString(bucket.totals.balance),
        total: decimalToString(bucket.totals.total)
      },
      counts: bucket.counts
    }))
  };
};
