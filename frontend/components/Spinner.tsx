import { Loader2 } from "lucide-react";

export function Spinner({ label = "Chargement…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-ink-3">
      <Loader2 className="h-5 w-5 animate-spin text-ink-4" />
      <p className="text-small">{label}</p>
    </div>
  );
}
