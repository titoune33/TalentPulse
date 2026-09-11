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
    <div className="space-y-1.5">
      {label && <label className="label">{label}</label>}
      {children}
      {hint && !error && <p className="text-micro tracking-normal text-ink-3">{hint}</p>}
      {error && <p className="text-micro tracking-normal text-danger-600">{error}</p>}
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
      className={`input ${invalid ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500/15" : ""} ${className}`}
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
      className={`input cursor-pointer appearance-none bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9 ${invalid ? "border-danger-500" : ""} ${className}`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2382868E' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

interface TextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  rows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", ...props }, ref) => (
    <textarea ref={ref} className={`input resize-y ${className}`} {...props} />
  )
);
Textarea.displayName = "Textarea";
