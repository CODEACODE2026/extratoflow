import type { HTMLAttributes } from "react";

type BadgeTone = "neutral" | "entry" | "exit" | "refund" | "pending" | "transmitted" | "error";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({ children, className = "", tone = "neutral", ...props }: BadgeProps) {
  return (
    <span className={["badge", `badge--${tone}`, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </span>
  );
}
