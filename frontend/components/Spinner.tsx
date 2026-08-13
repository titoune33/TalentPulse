import { Loader2 } from "lucide-react";

export function Spinner({ label = "Chargement…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
