import type { LucideIcon } from "lucide-react";
import { Sparkline } from "@/components/shared/charts";

export function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  up = true,
  spark,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  delta?: string;
  up?: boolean;
  spark?: number[];
}) {
  return (
    <div className="card-rv p-5">
      <div className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-[10px] border border-secondary/22 bg-brand/10 text-brand">
          <Icon size={18} />
        </span>
        {delta && (
          <span
            className={`inline-flex items-center gap-1 text-[12.5px] font-semibold ${
              up ? "text-success" : "text-danger"
            }`}
          >
            {up ? "↑" : "↓"} {delta}
          </span>
        )}
      </div>
      <div className="mt-3.5 font-display text-[30px] leading-none">{value}</div>
      <div className="mt-2 flex items-end justify-between">
        <span className="text-[13px] text-muted">{label}</span>
        {spark && <Sparkline data={spark} width={70} height={26} color={up ? "#22C55E" : "#EF4444"} />}
      </div>
    </div>
  );
}
