import { parseStatementText } from "../src/modules/statement-parser/statement-text-parser";

const parsed = parseStatementText(`
Periodo: 01/05/2026 a 31/05/2026
29/04/2026 PIX CREDITO DE: JOAO SILVA + R$ 30,00
29/04/2026 TARIFA BANCARIA - R$ 10,00
Saldo do Dia R$ 20,00
30/04/2026
PIX CREDITO DE: MARIA SOUZA
R$ 1.250,99
30/04/2026 PIX CREDITO DE: SEM VALOR
`);

if (parsed.totalLines !== 8) {
  throw new Error(`Expected 8 lines, received ${parsed.totalLines}.`);
}

if (parsed.transactions.length !== 3) {
  throw new Error(`Expected 3 transactions, received ${parsed.transactions.length}.`);
}

const [entry, exit, multilineEntry] = parsed.transactions;

if (entry.type !== "entry" || entry.payerName !== "JOAO SILVA" || entry.amount !== "30.00") {
  throw new Error("Entry PIX parsing failed.");
}

if (exit.type !== "exit" || exit.amount !== "10.00") {
  throw new Error("Negative amount parsing failed.");
}

if (multilineEntry.type !== "entry" || multilineEntry.payerName !== "MARIA SOUZA" || multilineEntry.amount !== "1250.99") {
  throw new Error("Multiline PIX parsing failed.");
}

if (parsed.ignoredLines !== 4) {
  throw new Error(`Expected 4 ignored lines, received ${parsed.ignoredLines}.`);
}

const periodHeaderParsed = parseStatementText(`
Periodo: 01/05/2026 a 31/05/2026
05/06/2026 PIX CREDITO DE: CLIENTE JUNHO R$ 100,00
`);

if (periodHeaderParsed.transactions[0]?.paymentDate !== "2026-06-05") {
  throw new Error("Statement period header changed the transaction month incorrectly.");
}

console.log("Parser smoke test passed.");
