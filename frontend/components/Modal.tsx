"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-graphite-950/45 backdrop-blur-[2px] animate-fadeIn"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${wide ? "max-w-3xl" : "max-w-lg"} animate-scaleIn overflow-hidden rounded-2xl border border-line bg-surface shadow-float`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h3 className="text-title font-semibold text-ink">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-ink-3 transition hover:bg-sunken hover:text-ink"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2.5 border-t border-line bg-paper/60 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
