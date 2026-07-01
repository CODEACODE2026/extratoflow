import { type CSSProperties, useCallback, useEffect, useMemo, useState } from "react";
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

  return summary.counts.entry + summary.counts.exit + summary.counts.refund;
};

const getMaxMonthlyAmount = (months: MonthlyIndicator[]) => {
  return Math.max(
    1,
    ...months.map((month) =>
      Math.max(Number(month.totals.entry), Number(month.totals.exit), Number(month.totals.refund), Math.abs(Number(month.totals.balance)))
    )
  );
};

const buildBalancePath = (months: MonthlyIndicator[], maxAmount: number) => {
  if (months.length === 0) {
    return "";
  }

  const points = months.map((month, index) => {
    const x = months.length === 1 ? 50 : (index / (months.length - 1)) * 100;
    const balance = Number(month.totals.balance);
    const y = 50 - (Math.max(-maxAmount, Math.min(maxAmount, balance)) / maxAmount) * 34;

    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  return `M ${points.join(" L ")}`;
};

export function DashboardPreview() {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [dashboard, setDashboard] = useState<DashboardState>({ monthly: [], summary: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedYear = selectedMonth.slice(0, 4);
  const totalCount = getTotalCount(dashboard.summary);
  const maxMonthlyAmount = useMemo(() => getMaxMonthlyAmount(dashboard.monthly), [dashboard.monthly]);
  const balancePath = useMemo(() => buildBalancePath(dashboard.monthly, maxMonthlyAmount), [dashboard.monthly, maxMonthlyAmount]);

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
      key: "refund",
      header: "Devolucoes",
      render: (row: MonthlyIndicator) => formatApiCurrency(row.totals.refund)
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
          {["Entradas", "Saidas", "Devolucoes", "Pendentes", "Transmitidos"].map((label) => (
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
          label="Devolucoes"
          period={formatMonthLabel(selectedMonth)}
          tone="refund"
          value={summary ? formatApiCurrency(summary.totals.refund) : formatCurrency(0)}
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

        <div className="dashboard-chart" aria-label="Grafico animado mensal">
          <div className="dashboard-chart__legend">
            <span><i className="dashboard-chart__dot dashboard-chart__dot--entry" />Entradas</span>
            <span><i className="dashboard-chart__dot dashboard-chart__dot--exit" />Saidas</span>
            <span><i className="dashboard-chart__dot dashboard-chart__dot--balance" />Saldo</span>
          </div>

          <div className="dashboard-chart__stage">
            <svg className="dashboard-chart__line" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden="true">
              <path className="dashboard-chart__grid-line" d="M 0 50 L 100 50" />
              {balancePath ? <path className="dashboard-chart__balance-line" d={balancePath} pathLength="1" /> : null}
            </svg>

            <div className="dashboard-chart__columns">
              {dashboard.monthly.map((month, index) => {
                const entryHeight = Math.max(3, (Number(month.totals.entry) / maxMonthlyAmount) * 100);
                const exitHeight = Math.max(3, (Number(month.totals.exit) / maxMonthlyAmount) * 100);
                const hasValue = Number(month.totals.entry) > 0 || Number(month.totals.exit) > 0 || Number(month.totals.refund) > 0 || Number(month.totals.balance) !== 0;

                return (
                  <div className="dashboard-chart__month" key={month.month} title={`${formatMonthLabel(month.month)} - entradas ${formatApiCurrency(month.totals.entry)}, saidas ${formatApiCurrency(month.totals.exit)}`}>
                    <div className="dashboard-chart__bars">
                      <span
                        className="dashboard-chart__bar dashboard-chart__bar--entry"
                        style={{ "--bar-height": `${entryHeight}%`, "--bar-delay": `${index * 70}ms` } as CSSProperties}
                      />
                      <span
                        className="dashboard-chart__bar dashboard-chart__bar--exit"
                        style={{ "--bar-height": `${exitHeight}%`, "--bar-delay": `${index * 70 + 90}ms` } as CSSProperties}
                      />
                    </div>
                    <span className={hasValue ? "dashboard-chart__label is-active" : "dashboard-chart__label"}>{month.month.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>
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
