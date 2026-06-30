import type { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: string;
  period: string;
  tone?: "neutral" | "entry" | "exit" | "pending" | "transmitted";
  action?: ReactNode;
};

export function MetricCard({ action, label, period, tone = "neutral", value }: MetricCardProps) {
  return (
    <article className={["metric-card", `metric-card--${tone}`].join(" ")}>
      <div>
        <span className="metric-card__label">{label}</span>
        <strong>{value}</strong>
        <span className="metric-card__period">{period}</span>
      </div>
      {action ? <div className="metric-card__action">{action}</div> : null}
    </article>
  );
}
