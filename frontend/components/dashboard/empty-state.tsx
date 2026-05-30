import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card-rv flex flex-col items-center gap-4 p-12 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand/10 text-brand">
        <Icon size={28} />
      </span>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mx-auto mt-1 max-w-[460px] text-sm text-muted">{body}</p>
      </div>
      {action}
    </div>
  );
}
