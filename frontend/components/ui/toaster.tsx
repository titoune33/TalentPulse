"use client";
import { useToast } from "./use-toast";
export function Toaster() {
  const { toasts } = useToast();
  return (
    <div className="fixed top-4 right-4 z-50 w-96 space-y-4">
      {toasts.map(function ({ id, title, description, action }) {
        return (
          <div key={id} className="relative w-full overflow-hidden rounded-lg border bg-background p-6 shadow-lg">
            <div className="flex">
              <div className="flex-1">
                {title && <h5 className="mb-1 font-medium">{title}</h5>}
                {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
              </div>
            </div>
            {action}
          </div>
        );
      })}
    </div>
  );
}