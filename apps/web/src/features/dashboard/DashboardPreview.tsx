import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, RefreshCw, Upload } from "lucide-react";

import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { Input } from "../../components/ui/Input";
import { MetricCard } from "../../components/ui/MetricCard";
import { getDashboardMonthly, getDashboardSummary, type DashboardSummary, type MonthlyIndicator } from "../../lib/api/dashboard";
import { formatCurrency } from "../../lib/formatters/currency";
import "./dashboard.css";

type DashboardState = {
  summary: DashboardSummary | null;
  monthly: MonthlyIndicator[];
};

const currentMonth = () => {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const formatApiCurrency = (value: string) => formatCurrency(Number(value));

const formatMonthLabel = (month: string) => {
  const [year, monthValue] = month.split("-").map(Number);
  const date = new Date(year, monthValue - 1, 1);

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric"
  }).format(date);
};

const getTotalCount = (summary: DashboardSummary | null) => {
  if (!summary) {
    return 0;
  }

  return summary.counts.entry + summary.counts.exit;
};

const getMaxMonthlyAmount = (months: MonthlyIndicator[]) => {
  return Math.max(
    1,
    ...months.map((month) => Math.max(Number(month.totals.entry), Number(month.totals.exit), Number(month.totals.pending)))
  );
};

export function DashboardPreview() {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [dashboard, setDashboard] = useState<DashboardState>({ monthly: [], summary: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedYear = selectedMonth.slice(0, 4);
  const totalCount = getTotalCount(dashboard.summary);
  const maxMonthlyAmount = useMemo(() => getMaxMonthlyAmount(dashboard.monthly), [dashboard.monthly]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [summary, monthly] = await Promise.all([
        getDashboardSummary(selectedMonth),
        getDashboardMonthly(selectedYear)
      ]);

      setDashboard({
        summary,
        monthly: monthly.months
      });
    } catch {
      setError("Nao foi possivel carregar os indicadores. Verifique a sessao, a API e o banco de dados.");
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const monthlyColumns = [
    {
      key: "month",
      header: "Mes",
      render: (row: MonthlyIndicator) => formatMonthLabel(row.month)
    },
    {
      align: "right" as const,
      key: "entry",
      header: "Entradas",
      render: (row: MonthlyIndicator) => formatApiCurrency(row.totals.entry)
    },
    {
      align: "right" as const,
      key: "exit",
      header: "Saidas",
      render: (row: MonthlyIndicator) => formatApiCurrency(row.totals.exit)
    },
    {
      align: "right" as const,
      key: "pending",
      header: "Pendente",
      render: (row: MonthlyIndicator) => formatApiCurrency(row.totals.pending)
    },
    {
      align: "right" as const,
      key: "balance",
      header: "Saldo",
      render: (row: MonthlyIndicator) => formatApiCurrency(row.totals.balance)
    },
    {
      align: "right" as const,
      key: "count",
      header: "Registros",
      render: (row: MonthlyIndicator) => row.counts.total
    }
  ];

  if (loading) {
    return (
      <>
        <section className="dashboard-toolbar" aria-label="Periodo do dashboard">
          <Input label="Mes" onChange={(event) => setSelectedMonth(event.target.value)} type="month" value={selectedMonth} />
          <Button disabled leadingIcon={<RefreshCw size={16} />} loading variant="secondary">
            Atualizar
          </Button>
        </section>
        <section className="metric-grid" aria-label="Carregando indicadores">
          {["Entradas", "Saidas", "Pendentes", "Transmitidos"].map((label) => (
            <article className="metric-card metric-card--loading" key={label}>
              <span className="skeleton-line skeleton-line--short" />
              <span className="skeleton-line skeleton-line--value" />
              <span className="skeleton-line" />
            </article>
          ))}
        </section>
        <section className="panel">
          <div className="dashboard-loading-table">
            <span className="skeleton-line skeleton-line--title" />
            <span className="skeleton-line" />
            <span className="skeleton-line" />
            <span className="skeleton-line" />
          </div>
        </section>
      </>
    );
  }

  if (error) {
    return (
      <>
        <section className="dashboard-toolbar" aria-label="Periodo do dashboard">
          <Input label="Mes" onChange={(event) => setSelectedMonth(event.target.value)} type="month" value={selectedMonth} />
          <Button leadingIcon={<RefreshCw size={16} />} onClick={loadDashboard} variant="secondary">
            Tentar novamente
          </Button>
        </section>
        <section className="dashboard-error" role="alert">
          <Badge tone="error">Erro</Badge>
          <h2>Indicadores indisponiveis</h2>
          <p>{error}</p>
        </section>
      </>
    );
  }

  const summary = dashboard.summary;

  return (
    <>
      <section className="dashboard-toolbar" aria-label="Periodo do dashboard">
        <Input label="Mes" onChange={(event) => setSelectedMonth(event.target.value)} type="month" value={selectedMonth} />
        <Button leadingIcon={<RefreshCw size={16} />} onClick={loadDashboard} variant="secondary">
          Atualizar
        </Button>
      </section>

      <section className="metric-grid" aria-label="Indicadores financeiros">
        <MetricCard
          label="Entradas"
          period={formatMonthLabel(selectedMonth)}
          tone="entry"
          value={summary ? formatApiCurrency(summary.totals.entry) : formatCurrency(0)}
        />
        <MetricCard
          label="Saidas"
          period={formatMonthLabel(selectedMonth)}
          tone="exit"
          value={summary ? formatApiCurrency(summary.totals.exit) : formatCurrency(0)}
        />
        <MetricCard
          action={<Button leadingIcon={<ArrowRight size={15} />} size="sm" variant="secondary">Ver</Button>}
          label="Pendentes"
          period={`${summary?.counts.pending ?? 0} movimentacoes`}
          tone="pending"
          value={summary ? formatApiCurrency(summary.totals.pending) : formatCurrency(0)}
        />
        <MetricCard
          label="Transmitidos"
          period={`${summary?.counts.transmitted ?? 0} movimentacoes`}
          tone="transmitted"
          value={summary ? formatApiCurrency(summary.totals.transmitted) : formatCurrency(0)}
        />
      </section>

      <section className="action-band" aria-label="Pendencias do periodo">
        <div>
          <Badge tone={summary && summary.counts.pending > 0 ? "pending" : "transmitted"}>
            {summary && summary.counts.pending > 0 ? "Revisao mensal" : "Periodo em dia"}
          </Badge>
          <h2>
            {summary && summary.counts.pending > 0
              ? `${summary.counts.pending} movimentacoes aguardam numero da nota`
              : "Nenhuma pendencia no periodo selecionado"}
          </h2>
          <p>{`Periodo ativo: ${formatMonthLabel(selectedMonth)}`}</p>
        </div>
        <div className="action-band__actions">
          <Button leadingIcon={<Upload size={16} />}>Importar PDF</Button>
          <Button variant="secondary">Lancamento mensal</Button>
        </div>
      </section>

      {totalCount === 0 ? (
        <section className="panel">
          <div className="empty-state dashboard-empty">
            <strong>Nenhuma movimentacao no periodo</strong>
            <p>Importe um extrato ou selecione outro mes para acompanhar os indicadores financeiros.</p>
            <Button leadingIcon={<Upload size={16} />}>Importar PDF</Button>
          </div>
        </section>
      ) : null}

      <section className="panel">
        <header className="panel__header">
          <div>
            <h2>Indicadores por mes</h2>
            <p>{`Resumo mensal de ${selectedYear}.`}</p>
          </div>
          <Badge tone="neutral">{`${dashboard.monthly.length} meses`}</Badge>
        </header>

        <div className="monthly-bars" aria-label="Comparativo mensal">
          {dashboard.monthly.map((month) => (
            <div className="monthly-bars__row" key={month.month}>
              <span>{month.month.slice(5)}</span>
              <div className="monthly-bars__track">
                <span
                  className="monthly-bars__bar monthly-bars__bar--entry"
                  style={{ width: `${(Number(month.totals.entry) / maxMonthlyAmount) * 100}%` }}
                />
                <span
                  className="monthly-bars__bar monthly-bars__bar--exit"
                  style={{ width: `${(Number(month.totals.exit) / maxMonthlyAmount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <DataTable
          columns={monthlyColumns}
          emptyDescription="Importe extratos para montar os indicadores mensais."
          emptyTitle="Sem indicadores mensais"
          getRowKey={(row) => row.month}
          rows={dashboard.monthly}
        />
      </section>
    </>
  );
}
