import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Edit3, FileText, RefreshCw, Search } from "lucide-react";

import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Pagination } from "../../components/ui/Pagination";
import { Toast } from "../../components/ui/Toast";
import {
  applyInvoiceToTransaction,
  listTransactions,
  updateTransaction,
  type Transaction,
  type TransactionFilters,
  type TransactionStatus,
  type TransactionType
} from "../../lib/api/transactions";
import { formatCurrency } from "../../lib/formatters/currency";
import "./transactions.css";

type EditForm = {
  paymentDate: string;
  type: TransactionType;
  amount: string;
  payerName: string;
  descriptionText: string;
};

const currentMonth = () => {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const toMonthFromDay = (day: string) => day.slice(0, 7);

const toDateInputValue = (date: string) => date.slice(0, 10);

const formatDate = (date: string) => {
  const isoDate = date.slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return date;
  }

  const [year, month, day] = isoDate.split("-");

  return `${day}/${month}/${year}`;
};

const toEditForm = (transaction: Transaction): EditForm => ({
  amount: transaction.amount,
  descriptionText: transaction.descriptionText ?? "",
  payerName: transaction.payerName ?? "",
  paymentDate: toDateInputValue(transaction.paymentDate),
  type: transaction.type
});

export function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({
    month: currentMonth(),
    page: 1,
    perPage: 25,
    status: "all",
    type: "all"
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({
    balanceAmount: "0.00",
    entryAmount: "0.00",
    exitAmount: "0.00",
    pendingAmount: "0.00",
    transmittedAmount: "0.00"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [invoiceTransaction, setInvoiceTransaction] = useState<Transaction | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await listTransactions(filters);
      setTransactions(result.transactions);
      setTotal(result.pagination.total);
      setSummary(result.summary);
    } catch {
      setError("Nao foi possivel carregar as movimentacoes. Verifique a sessao, a API e o banco de dados.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const listedAmount = useMemo(() => {
    return transactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  }, [transactions]);
  const selectedPeriod = filters.dateStart && filters.dateEnd ? filters.dateStart : (filters.month ?? "Sem periodo");
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 25;

  const updateFilters = (patch: Partial<TransactionFilters>) => {
    setFilters((current) => ({
      ...current,
      ...patch,
      page: 1
    }));
  };

  const handleDayChange = (day: string) => {
    updateFilters({
      dateEnd: day || undefined,
      dateStart: day || undefined,
      month: day ? toMonthFromDay(day) : filters.month
    });
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditForm(toEditForm(transaction));
    setFormError(null);
  };

  const closeEditModal = () => {
    if (!saving) {
      setEditingTransaction(null);
      setEditForm(null);
    }
  };

  const openInvoiceModal = (transaction: Transaction) => {
    setInvoiceTransaction(transaction);
    setInvoiceNumber(transaction.invoiceNumber ?? "");
    setFormError(null);
  };

  const closeInvoiceModal = () => {
    if (!saving) {
      setInvoiceTransaction(null);
      setInvoiceNumber("");
    }
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingTransaction || !editForm) {
      return;
    }

    if (!editForm.paymentDate || Number(editForm.amount) <= 0) {
      setFormError("Informe data e valor valido.");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      await updateTransaction(editingTransaction.id, {
        amount: editForm.amount,
        descriptionText: editForm.descriptionText.trim() || null,
        payerName: editForm.payerName.trim() || null,
        paymentDate: editForm.paymentDate,
        type: editForm.type
      });
      setSuccess("Movimentacao atualizada.");
      closeEditModal();
      await loadTransactions();
    } catch {
      setFormError("Nao foi possivel salvar a movimentacao.");
    } finally {
      setSaving(false);
    }
  };

  const handleInvoiceSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!invoiceTransaction) {
      return;
    }

    if (!invoiceNumber.trim()) {
      setFormError("Informe o numero da nota.");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      await applyInvoiceToTransaction(invoiceTransaction.id, invoiceNumber.trim());
      setSuccess("Nota lancada na movimentacao.");
      closeInvoiceModal();
      await loadTransactions();
    } catch {
      setFormError("Nao foi possivel lancar a nota.");
    } finally {
      setSaving(false);
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
      align: "right" as const,
      key: "amount",
      header: "Valor",
      render: (row: Transaction) => (
        <strong className={row.type === "entry" ? "transaction-amount transaction-amount--entry" : "transaction-amount transaction-amount--exit"}>
          {formatCurrency(Number(row.amount))}
        </strong>
      )
    },
    {
      key: "type",
      header: "Tipo",
      render: (row: Transaction) => <Badge tone={row.type}>{row.type === "entry" ? "Entrada" : "Saida"}</Badge>
    },
    {
      key: "status",
      header: "Status",
      render: (row: Transaction) => (
        <Badge tone={row.status === "pending" ? "pending" : "transmitted"}>
          {row.status === "pending" ? "Pendente" : "Transmitido"}
        </Badge>
      )
    },
    {
      key: "invoice",
      header: "Nota",
      render: (row: Transaction) => row.invoiceNumber ?? "-"
    },
    {
      align: "right" as const,
      key: "actions",
      header: "",
      render: (row: Transaction) => (
        <div className="transaction-actions">
          <Button aria-label="Editar movimentacao" leadingIcon={<Edit3 size={16} />} onClick={() => openEditModal(row)} size="icon" variant="ghost" />
          <Button aria-label="Lancar nota" leadingIcon={<FileText size={16} />} onClick={() => openInvoiceModal(row)} size="icon" variant="ghost" />
        </div>
      )
    }
  ];

  return (
    <>
      <section className="transactions-toolbar" aria-label="Filtros de movimentacoes">
        <div className="transactions-toolbar__header">
          <div>
            <h2>Filtros</h2>
            <p>Os totais abaixo consideram o periodo e todos os filtros selecionados.</p>
          </div>
          <Button leadingIcon={<RefreshCw size={16} />} onClick={loadTransactions} variant="secondary">
            Atualizar
          </Button>
        </div>
        <div className="transactions-filter-grid">
          <Input
            label="Mes"
            onChange={(event) => updateFilters({ dateEnd: undefined, dateStart: undefined, month: event.target.value })}
            type="month"
            value={filters.month}
          />
          <Input
            label="Dia"
            onChange={(event) => handleDayChange(event.target.value)}
            type="date"
            value={filters.dateStart ?? ""}
          />
          <label className="field" htmlFor="transaction-status-filter">
            <span className="field__label">Status</span>
            <select
              className="field__control"
              id="transaction-status-filter"
              onChange={(event) => updateFilters({ status: event.target.value as TransactionStatus | "all" })}
              value={filters.status}
            >
              <option value="all">Todos</option>
              <option value="pending">Pendentes</option>
              <option value="transmitted">Transmitidos</option>
            </select>
          </label>
          <label className="field" htmlFor="transaction-type-filter">
            <span className="field__label">Tipo</span>
            <select
              className="field__control"
              id="transaction-type-filter"
              onChange={(event) => updateFilters({ type: event.target.value as TransactionType | "all" })}
              value={filters.type}
            >
              <option value="all">Todos</option>
              <option value="entry">Entrada</option>
              <option value="exit">Saida</option>
            </select>
          </label>
          <div className="transaction-search">
            <Search aria-hidden="true" size={16} />
            <input
              aria-label="Buscar pagador"
              onChange={(event) => updateFilters({ payerName: event.target.value })}
              placeholder="Pagador"
              type="search"
              value={filters.payerName ?? ""}
            />
          </div>
          <div className="transaction-search">
            <Search aria-hidden="true" size={16} />
            <input
              aria-label="Buscar descricao"
              onChange={(event) => updateFilters({ description: event.target.value })}
              placeholder="Descricao"
              type="search"
              value={filters.description ?? ""}
            />
          </div>
        </div>
      </section>

      {error ? (
        <section className="transactions-error" role="alert">
          <Badge tone="error">Erro</Badge>
          <h2>Movimentacoes indisponiveis</h2>
          <p>{error}</p>
        </section>
      ) : null}

      <section className="transaction-summary" aria-label="Resumo dos filtros">
        <div className="transaction-summary__card">
          <span>Registros filtrados</span>
          <strong>{total}</strong>
          <small>{`${transactions.length} listados nesta pagina`}</small>
        </div>
        <div className="transaction-summary__card">
          <span>Total de entradas</span>
          <strong className="transaction-amount--entry">{formatCurrency(Number(summary.entryAmount))}</strong>
          <small>Periodo + filtros atuais</small>
        </div>
        <div className="transaction-summary__card">
          <span>Total de saidas</span>
          <strong className="transaction-amount--exit">{formatCurrency(Number(summary.exitAmount))}</strong>
          <small>Periodo + filtros atuais</small>
        </div>
        <div className="transaction-summary__card">
          <span>Saldo filtrado</span>
          <strong>{formatCurrency(Number(summary.balanceAmount))}</strong>
          <small>{`Valor listado: ${formatCurrency(listedAmount)}`}</small>
        </div>
      </section>

      <section className="panel">
        <header className="panel__header">
          <div>
            <h2>Movimentacoes</h2>
            <p>Consulte, edite e lance nota individual por registro.</p>
          </div>
          <Badge tone="neutral">{selectedPeriod}</Badge>
        </header>

        {loading ? (
          <div className="transactions-loading" aria-label="Carregando movimentacoes">
            <span className="skeleton-line skeleton-line--title" />
            <span className="skeleton-line" />
            <span className="skeleton-line" />
            <span className="skeleton-line" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            emptyDescription="Importe um extrato ou ajuste os filtros para consultar movimentacoes."
            emptyTitle="Nenhuma movimentacao encontrada"
            getRowKey={(row) => row.id}
            rows={transactions}
          />
        )}
        {!loading ? (
          <Pagination
            onPageChange={(nextPage) => setFilters((current) => ({ ...current, page: nextPage }))}
            onPerPageChange={(nextPerPage) => setFilters((current) => ({ ...current, page: 1, perPage: nextPerPage }))}
            page={page}
            perPage={perPage}
            total={total}
          />
        ) : null}
      </section>

      <Modal
        description="Atualize os dados principais da movimentacao."
        footer={
          <>
            <Button disabled={saving} onClick={closeEditModal} variant="secondary">Cancelar</Button>
            <Button form="transaction-edit-form" loading={saving} type="submit">Salvar</Button>
          </>
        }
        onClose={closeEditModal}
        open={Boolean(editingTransaction && editForm)}
        title="Editar movimentacao"
      >
        {editForm ? (
          <form className="transaction-form" id="transaction-edit-form" onSubmit={handleEditSubmit}>
            {formError ? <div className="login-alert login-alert--error" role="alert">{formError}</div> : null}
            <Input label="Data" onChange={(event) => setEditForm((current) => current && { ...current, paymentDate: event.target.value })} type="date" value={editForm.paymentDate} />
            <label className="field" htmlFor="transaction-edit-type">
              <span className="field__label">Tipo</span>
              <select className="field__control" id="transaction-edit-type" onChange={(event) => setEditForm((current) => current && { ...current, type: event.target.value as TransactionType })} value={editForm.type}>
                <option value="entry">Entrada</option>
                <option value="exit">Saida</option>
              </select>
            </label>
            <Input label="Valor" min="0.01" onChange={(event) => setEditForm((current) => current && { ...current, amount: event.target.value })} step="0.01" type="number" value={editForm.amount} />
            <Input label="Pagador" onChange={(event) => setEditForm((current) => current && { ...current, payerName: event.target.value })} value={editForm.payerName} />
            <Input label="Descricao" onChange={(event) => setEditForm((current) => current && { ...current, descriptionText: event.target.value })} value={editForm.descriptionText} />
          </form>
        ) : null}
      </Modal>

      <Modal
        description="Ao salvar, a movimentacao passa para transmitida."
        footer={
          <>
            <Button disabled={saving} onClick={closeInvoiceModal} variant="secondary">Cancelar</Button>
            <Button form="transaction-invoice-form" loading={saving} type="submit">Lancar nota</Button>
          </>
        }
        onClose={closeInvoiceModal}
        open={Boolean(invoiceTransaction)}
        title="Lancar nota"
      >
        <form className="transaction-form" id="transaction-invoice-form" onSubmit={handleInvoiceSubmit}>
          {formError ? <div className="login-alert login-alert--error" role="alert">{formError}</div> : null}
          <Input label="Numero da nota" onChange={(event) => setInvoiceNumber(event.target.value)} placeholder="Ex: 12345" value={invoiceNumber} />
        </form>
      </Modal>

      {success ? (
        <div className="toast-region" aria-live="polite">
          <Toast tone="success" title={success} />
        </div>
      ) : null}
    </>
  );
}
