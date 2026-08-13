"use client";

import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

export function Field({ label, hint, error, children }: FieldProps) {
  return (
    <div className="space-y-1">
      {label && <label className="label">{label}</label>}
      {children}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", invalid, ...props }, ref) => (
    <input
      ref={ref}
      className={`input ${
        invalid ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""
      } ${className}`}
      {...props}
    />
  )
);
Input.displayName = "Input";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", invalid, children, ...props }, ref) => (
    <select
      ref={ref}
      className={`input ${invalid ? "border-red-400" : ""} ${className}`}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";
