import { FormEvent, useState } from "react";
import { CheckCircle2, FileText, Search } from "lucide-react";

import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { Input } from "../../components/ui/Input";
import { Toast } from "../../components/ui/Toast";
import { ApiError } from "../../lib/api/client";
import { applyBulkInvoice, prepareBulkInvoice, type BulkInvoiceFilters, type BulkInvoicePreview } from "../../lib/api/invoices";
import type { Transaction, TransactionType } from "../../lib/api/transactions";
import { formatCurrency } from "../../lib/formatters/currency";
import "./invoices.css";

const currentMonth = () => {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const formatDate = (date: string) => {
  const isoDate = date.slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return date;
  }

  const [year, month, day] = isoDate.split("-");

  return `${day}/${month}/${year}`;
};

export function InvoicesPage() {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [descriptionText, setDescriptionText] = useState("");
  const [filters, setFilters] = useState<BulkInvoiceFilters>({ month: currentMonth(), type: "" });
  const [preview, setPreview] = useState<BulkInvoicePreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePrepare = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!filters.month) {
      setError("Selecione o mes.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      setPreview(await prepareBulkInvoice(invoiceNumber.trim(), filters));
    } catch (prepareError) {
      setError(prepareError instanceof ApiError ? prepareError.message : "Nao foi possivel gerar a previa. Verifique filtros, permissao e banco de dados.");
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!preview || preview.transactions.length === 0) {
      setError("Gere uma previa com registros antes de confirmar.");
      return;
    }

    if (!invoiceNumber.trim()) {
      setError("Informe o numero da nota para confirmar a aplicacao.");
      return;
    }

    setApplying(true);
    setError(null);

    try {
      const result = await applyBulkInvoice(
        invoiceNumber.trim(),
        preview.transactions.map((transaction) => transaction.id),
        descriptionText
      );
      setSuccess(`${result.affectedCount} movimentacoes atualizadas.`);
      setPreview(null);
    } catch (applyError) {
      setError(applyError instanceof ApiError ? applyError.message : "Nao foi possivel aplicar a nota em massa.");
    } finally {
      setApplying(false);
    }
  };

  const columns = [
    {
      key: "date",
      header: "Data",
      render: (row: Transaction) => formatDate(row.paymentDate)
    },
    {
      key: "payer",
      header: "Pagador",
      render: (row: Transaction) => row.payerName ?? "-"
    },
    {
      key: "description",
      header: "Descricao",
      render: (row: Transaction) => row.descriptionText ?? "-"
    },
    {
      key: "type",
      header: "Tipo",
      render: (row: Transaction) => <Badge tone={row.type}>{row.type === "entry" ? "Entrada" : "Saida"}</Badge>
    },
    {
      key: "invoice",
      header: "Nota atual",
      render: (row: Transaction) => row.invoiceNumber ?? "-"
    },
    {
      key: "status",
      header: "Status",
      render: (row: Transaction) => (
        <Badge tone={row.status === "pending" ? "pending" : "transmitted"}>
          {row.status === "pending" ? "Pendente" : "Transmitida"}
        </Badge>
      )
    },
    {
      align: "right" as const,
      key: "amount",
      header: "Valor",
      render: (row: Transaction) => formatCurrency(Number(row.amount))
    }
  ];

  return (
    <>
      <form className="invoice-form" onSubmit={handlePrepare}>
        <div className="invoice-form__header">
          <div>
            <h2>Lancamento mensal</h2>
            <p>Gere uma previa e aplique nota/descricao nos registros do periodo, mesmo se ja estiverem transmitidos.</p>
          </div>
          <Button leadingIcon={<FileText size={16} />} loading={loading} type="submit">
            Gerar previa
          </Button>
        </div>
        <div className="invoice-filter-grid">
          <Input label="Mes" onChange={(event) => setFilters((current) => ({ ...current, month: event.target.value }))} type="month" value={filters.month} />
          <Input label="Numero da nota" onChange={(event) => setInvoiceNumber(event.target.value)} placeholder="Obrigatorio para confirmar" value={invoiceNumber} />
          <Input label="Descricao para salvar" onChange={(event) => setDescriptionText(event.target.value)} placeholder="Opcional" value={descriptionText} />
          <label className="field" htmlFor="bulk-type">
            <span className="field__label">Tipo</span>
            <select className="field__control" id="bulk-type" onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value as TransactionType | "" }))} value={filters.type}>
              <option value="">Todos</option>
              <option value="entry">Entrada</option>
              <option value="exit">Saida</option>
            </select>
          </label>
          <div className="invoice-search">
            <Search aria-hidden="true" size={16} />
            <input aria-label="Filtrar pagador" onChange={(event) => setFilters((current) => ({ ...current, payerName: event.target.value }))} placeholder="Pagador" value={filters.payerName ?? ""} />
          </div>
          <div className="invoice-search">
            <Search aria-hidden="true" size={16} />
            <input aria-label="Filtrar descricao" onChange={(event) => setFilters((current) => ({ ...current, description: event.target.value }))} placeholder="Descricao" value={filters.description ?? ""} />
          </div>
        </div>
      </form>

      {error ? (
        <section className="invoice-error" role="alert">
          <Badge tone="error">Erro</Badge>
          <p>{error}</p>
        </section>
      ) : null}

      {preview ? (
        <>
          <section className="invoice-preview-summary" aria-label="Resumo da previa">
            <article>
              <span>Nota</span>
              <strong>{invoiceNumber.trim() || "Nao informada"}</strong>
            </article>
            <article>
              <span>Registros afetados</span>
              <strong>{preview.affectedCount}</strong>
            </article>
            <article>
              <span>Total financeiro</span>
              <strong>{formatCurrency(Number(preview.totalAmount))}</strong>
            </article>
            <Button leadingIcon={<CheckCircle2 size={16} />} loading={applying} onClick={handleApply}>
              Confirmar aplicacao
            </Button>
          </section>

          <section className="panel">
            <header className="panel__header">
              <div>
                <h2>Previa de lancamento mensal</h2>
                <p>Registros pendentes ou transmitidos serao atualizados com a nota e descricao informadas.</p>
              </div>
              <Badge tone="pending">{filters.month}</Badge>
            </header>
            <DataTable
              columns={columns}
              emptyDescription="Ajuste os filtros para localizar movimentacoes do periodo."
              emptyTitle="Nenhum registro na previa"
              getRowKey={(row) => row.id}
              rows={preview.transactions}
            />
          </section>
        </>
      ) : (
        <section className="panel">
          <div className="empty-state">
            <strong>Nenhuma previa gerada</strong>
            <p>Informe o mes e gere a previa. O numero da nota so e obrigatorio para confirmar.</p>
          </div>
        </section>
      )}

      {success ? (
        <div className="toast-region" aria-live="polite">
          <Toast tone="success" title={success} />
        </div>
      ) : null}
    </>
  );
}
