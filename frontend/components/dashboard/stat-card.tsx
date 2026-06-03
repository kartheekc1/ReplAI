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
    <div className="card-rv p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="grid h-9 w-9 place-items-center rounded-[10px] border border-secondary/22 bg-brand/10 text-brand sm:h-10 sm:w-10">
          <Icon size={18} />
        </span>
        {delta && (
          <span
            className={`inline-flex items-center gap-1 text-[12px] font-semibold sm:text-[12.5px] ${
              up ? "text-success" : "text-danger"
            }`}
          >
            {up ? "↑" : "↓"} {delta}
          </span>
        )}
      </div>
      <div className="mt-3 font-display text-[24px] leading-none sm:mt-3.5 sm:text-[30px]">
        {value}
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <span className="truncate text-[12.5px] text-muted sm:text-[13px]">{label}</span>
        {spark && (
          <Sparkline data={spark} width={60} height={24} color={up ? "#22C55E" : "#EF4444"} />
        )}
      </div>
    </div>
  );
}
