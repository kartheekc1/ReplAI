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
    <div className="card-rv flex flex-col items-center gap-4 p-6 text-center sm:p-10 md:p-12">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-brand sm:h-16 sm:w-16">
        <Icon size={26} />
      </span>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mx-auto mt-1 max-w-[460px] text-sm text-muted">{body}</p>
      </div>
      {/* Wrap action in a full-width flex container so multiple buttons stack on mobile */}
      {action && (
        <div className="flex w-full max-w-[420px] flex-col gap-2 sm:w-auto sm:flex-row sm:justify-center [&>*]:w-full sm:[&>*]:w-auto">
          {action}
        </div>
      )}
    </div>
  );
}
