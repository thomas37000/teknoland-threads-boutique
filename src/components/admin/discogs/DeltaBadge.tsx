import { cn } from "@/lib/utils";

interface DeltaBadgeProps {
  label: string;
  delta: number;
  tone: "collection" | "wantlist";
}

/** Small animated pill that shows +N when delta > 0. */
export function DeltaBadge({ label, delta, tone }: DeltaBadgeProps) {
  if (delta <= 0) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        "animate-in fade-in zoom-in duration-300",
        tone === "collection"
          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          : "bg-rose-500/15 text-rose-600 dark:text-rose-400",
      )}
    >
      {label} +{delta}
    </span>
  );
}