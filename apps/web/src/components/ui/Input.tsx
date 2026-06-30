import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Input({ className = "", error, hint, id, label, ...props }: InputProps) {
  const inputId = id ?? `input-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const descriptionId = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <label className={["field", className].filter(Boolean).join(" ")} htmlFor={inputId}>
      <span className="field__label">{label}</span>
      <input
        aria-describedby={descriptionId}
        aria-invalid={error ? "true" : undefined}
        className="field__control"
        id={inputId}
        {...props}
      />
      {error ? (
        <span className="field__message field__message--error" id={descriptionId}>
          {error}
        </span>
      ) : hint ? (
        <span className="field__message" id={descriptionId}>
          {hint}
        </span>
      ) : null}
    </label>
  );
}
