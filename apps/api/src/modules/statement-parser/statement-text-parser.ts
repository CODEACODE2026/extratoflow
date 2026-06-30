import { TransactionType } from "@prisma/client";

import type { ParsedStatementTransaction, ParseStatementResult } from "./statement-parser.types";

const DATE_BR_REGEX = /\b(\d{2})\/(\d{2})\/(\d{4})\b/;
const MONEY_REGEX = /([+-])?\s*(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2}|\d+,\d{2})\s*([CD])?\b/i;
const PIX_CREDIT_MARKER = "PIX CREDITO DE";

const toIsoDate = (day: string, month: string, year: string) => `${year}-${month}-${day}`;

const normalizeMoney = (value: string) => value.replace(/\./g, "").replace(",", ".");

const cleanText = (value: string) => value.replace(/\s+/g, " ").trim();

const hasTransactionSignal = (line: string) => {
  return line.toUpperCase().includes(PIX_CREDIT_MARKER) || Boolean(extractMoney(line));
};

const isStatementPeriodLine = (line: string) => {
  const dateMatches = line.match(new RegExp(DATE_BR_REGEX.source, "g")) ?? [];

  return dateMatches.length > 1 && !hasTransactionSignal(line);
};

const extractMoney = (line: string) => {
  const match = line.match(MONEY_REGEX);

  if (!match) {
    return undefined;
  }

  return {
    raw: match[0],
    sign: match[1] ?? (match[3]?.toUpperCase() === "D" ? "-" : ""),
    amount: normalizeMoney(match[2]),
    index: match.index ?? -1
  };
};

const parsePixCreditLine = (line: string, paymentDate: string): ParsedStatementTransaction | undefined => {
  if (!line.toUpperCase().includes(PIX_CREDIT_MARKER)) {
    return undefined;
  }

  const money = extractMoney(line);
  if (!money) {
    return undefined;
  }

  const payerStartIndex = line.toUpperCase().indexOf(PIX_CREDIT_MARKER) + PIX_CREDIT_MARKER.length;
  const payerEndIndex = money?.index && money.index > payerStartIndex ? money.index : line.length;
  const payerName = cleanText(
    line
      .slice(payerStartIndex, payerEndIndex)
      .replace(DATE_BR_REGEX, "")
      .replace(/^[:\s-]+/, "")
  );
  const warnings: string[] = [];

  if (!payerName) {
    warnings.push("Pagador nao identificado.");
  }

  return {
    paymentDate,
    type: TransactionType.entry,
    payerName: payerName || null,
    descriptionText: null,
    amount: money.amount,
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

const shouldAppendNextLine = (line: string) => {
  if (/saldo do dia/i.test(line)) {
    return false;
  }

  const upperLine = line.toUpperCase();
  return !DATE_BR_REGEX.test(line) && !upperLine.includes(PIX_CREDIT_MARKER);
};

export const parseStatementText = (text: string): ParseStatementResult => {
  const lines = text
    .split(/\r?\n/)
    .map(cleanText)
    .filter(Boolean);

  let currentDate: string | undefined;
  let ignoredLines = 0;
  const transactions: ParsedStatementTransaction[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    let line = lines[index];

    if (/saldo do dia/i.test(line)) {
      ignoredLines += 1;
      continue;
    }

    const dateMatch = isStatementPeriodLine(line) ? null : line.match(DATE_BR_REGEX);

    if (dateMatch) {
      currentDate = toIsoDate(dateMatch[1], dateMatch[2], dateMatch[3]);
    }

    if (!currentDate) {
      ignoredLines += 1;
      continue;
    }

    if (line.toUpperCase().includes(PIX_CREDIT_MARKER) && !extractMoney(line)) {
      const parts = [line];
      let lookahead = index + 1;

      while (lookahead < lines.length && shouldAppendNextLine(lines[lookahead])) {
        parts.push(lines[lookahead]);

        if (extractMoney(lines[lookahead])) {
          break;
        }

        lookahead += 1;
      }

      const mergedLine = cleanText(parts.join(" "));

      if (extractMoney(mergedLine)) {
        line = mergedLine;
        index = lookahead;
      }
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
