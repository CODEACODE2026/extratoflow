import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

type ToastTone = "success" | "error" | "warning" | "info";

type ToastProps = {
  tone?: ToastTone;
  title: string;
  children?: ReactNode;
};

const toastIcons = {
  success: CheckCircle2,
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info
};

export function Toast({ children, title, tone = "info" }: ToastProps) {
  const Icon = toastIcons[tone];

  return (
    <div className={["toast", `toast--${tone}`].join(" ")} role={tone === "error" ? "alert" : "status"}>
      <Icon aria-hidden="true" size={18} />
      <div>
        <strong>{title}</strong>
        {children ? <p>{children}</p> : null}
      </div>
    </div>
  );
}
