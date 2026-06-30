import { parseStatementText } from "../src/modules/statement-parser/statement-text-parser";

const parsed = parseStatementText(`
29/04/2026 PIX CREDITO DE: JOAO SILVA + R$ 30,00
29/04/2026 TARIFA BANCARIA - R$ 10,00
Saldo do Dia R$ 20,00
`);

if (parsed.totalLines !== 3) {
  throw new Error(`Expected 3 lines, received ${parsed.totalLines}.`);
}

if (parsed.transactions.length !== 2) {
  throw new Error(`Expected 2 transactions, received ${parsed.transactions.length}.`);
}

const [entry, exit] = parsed.transactions;

if (entry.type !== "entry" || entry.payerName !== "JOAO SILVA" || entry.amount !== "30.00") {
  throw new Error("Entry PIX parsing failed.");
}

if (exit.type !== "exit" || exit.amount !== "10.00") {
  throw new Error("Negative amount parsing failed.");
}

if (parsed.ignoredLines !== 1) {
  throw new Error(`Expected 1 ignored line, received ${parsed.ignoredLines}.`);
}

console.log("Parser smoke test passed.");
