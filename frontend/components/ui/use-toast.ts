"use client";
import { useState } from "react";

type ToastProps = {
  id?: string;
  title?: string;
  description?: string;
  action?: any;
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = (props: ToastProps) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...props, id }]);
    return id;
  };

  const dismiss = (toastId?: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  return { toast, dismiss, toasts };
}

export { useToast };