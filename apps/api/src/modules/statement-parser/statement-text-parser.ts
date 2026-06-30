import { TransactionType } from "@prisma/client";

import type { ParsedStatementTransaction, ParseStatementResult } from "./statement-parser.types";

const DATE_BR_REGEX = /\b(\d{2})\/(\d{2})\/(\d{4})\b/;
const MONEY_REGEX = /([+-])?\s*R\$\s*([\d.]+,\d{2})/;

const toIsoDate = (day: string, month: string, year: string) => `${year}-${month}-${day}`;

const normalizeMoney = (value: string) => value.replace(/\./g, "").replace(",", ".");

const cleanText = (value: string) => value.replace(/\s+/g, " ").trim();

const extractMoney = (line: string) => {
  const match = line.match(MONEY_REGEX);

  if (!match) {
    return undefined;
  }

  return {
    raw: match[0],
    sign: match[1] ?? "",
    amount: normalizeMoney(match[2]),
    index: match.index ?? -1
  };
};

const parsePixCreditLine = (line: string, paymentDate: string): ParsedStatementTransaction | undefined => {
  if (!line.toUpperCase().includes("PIX CREDITO DE")) {
    return undefined;
  }

  const money = extractMoney(line);
  const payerStartIndex = line.toUpperCase().indexOf("PIX CREDITO DE") + "PIX CREDITO DE".length;
  const payerEndIndex = money?.index && money.index > payerStartIndex ? money.index : line.length;
  const payerName = cleanText(line.slice(payerStartIndex, payerEndIndex).replace(/^[:\s-]+/, ""));
  const warnings: string[] = [];

  if (!money) {
    warnings.push("Valor nao identificado.");
  }

  if (!payerName) {
    warnings.push("Pagador nao identificado.");
  }

  return {
    paymentDate,
    type: TransactionType.entry,
    payerName: payerName || null,
    descriptionText: null,
    amount: money?.amount ?? "0.00",
    rawText: line,
    confidence: warnings.length === 0 ? "high" : "low",
    warnings
  };
};

const parseExitLine = (line: string, paymentDate: string): ParsedStatementTransaction | undefined => {
  const money = extractMoney(line);

  if (!money || money.sign !== "-") {
    return undefined;
  }

  const description = cleanText(line.slice(0, money.index).replace(DATE_BR_REGEX, ""));

  return {
    paymentDate,
    type: TransactionType.exit,
    payerName: null,
    descriptionText: description || "Saida",
    amount: money.amount,
    rawText: line,
    confidence: description ? "medium" : "low",
    warnings: description ? [] : ["Descricao da saida nao identificada."]
  };
};

export const parseStatementText = (text: string): ParseStatementResult => {
  const lines = text
    .split(/\r?\n/)
    .map(cleanText)
    .filter(Boolean);

  let currentDate: string | undefined;
  let ignoredLines = 0;
  const transactions: ParsedStatementTransaction[] = [];

  for (const line of lines) {
    if (/saldo do dia/i.test(line)) {
      ignoredLines += 1;
      continue;
    }

    const dateMatch = line.match(DATE_BR_REGEX);

    if (dateMatch) {
      currentDate = toIsoDate(dateMatch[1], dateMatch[2], dateMatch[3]);
    }

    if (!currentDate) {
      ignoredLines += 1;
      continue;
    }

    const pixCredit = parsePixCreditLine(line, currentDate);

    if (pixCredit) {
      transactions.push(pixCredit);
      continue;
    }

    const exit = parseExitLine(line, currentDate);

    if (exit) {
      transactions.push(exit);
      continue;
    }

    ignoredLines += 1;
  }

  return {
    transactions,
    ignoredLines,
    totalLines: lines.length
  };
};
