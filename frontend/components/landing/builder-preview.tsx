import { Check, ChevronDown, Key, Send } from "lucide-react";

function Node({
  label,
  sub,
  icon,
  accent,
}: {
  label: string;
  sub: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`card-rv w-full max-w-[320px] p-4 ${
        accent ? "border-secondary/40 bg-brand/10" : "bg-section-bg"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`grid h-9 w-9 place-items-center rounded-[10px] text-white ${
            accent ? "bg-brand-gradient" : "bg-surface-3 text-muted"
          }`}
        >
          {icon}
        </span>
        <div>
          <div className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-subtle">
            {label}
          </div>
          <div className="text-[15px] font-semibold">{sub}</div>
        </div>
      </div>
    </div>
  );
}

export function BuilderPreview() {
  return (
    <section className="section" id="builder">
      <div className="container-wide">
        <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="eyebrow">
              <span className="dot" /> Automation builder
            </span>
            <h2 className="display mb-4 mt-4" style={{ fontSize: "clamp(30px,3.8vw,46px)" }}>
              Build flows by dragging, not coding
            </h2>
            <p className="lead mb-7">
              Compose triggers and actions on a visual canvas. Branch on keywords, add delays, collect
              leads, and send follow-ups — all without a single line of code.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                "Drag-and-drop trigger & action blocks",
                "Conditional branching on keywords",
                "Built-in delays and follow-up sequences",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-[14.5px]">
                  <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                    <Check size={13} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="card-rv flex flex-col items-center bg-section-bg p-4 sm:p-7">
            <div className="mb-5 flex w-full items-center justify-between">
              <span className="text-[13.5px] font-semibold text-muted">
                Flow · &ldquo;Link in comments&rdquo;
              </span>
              <span className="inline-flex items-center gap-1.5 text-[12px] text-success">
                <span className="live-dot" /> Active
              </span>
            </div>
            <Node label="Trigger" sub='Keyword = "link"' icon={<Key size={19} />} accent />
            <div className="flex h-9 flex-col items-center">
              <div className="w-0.5 flex-1 bg-brand-gradient" />
              <ChevronDown size={16} className="-mt-1 text-secondary" />
            </div>
            <Node label="Action" sub="Send DM message" icon={<Send size={19} />} />
            <div className="mt-3 w-full max-w-[320px]">
              <div className="card-rv rounded-xl bg-white p-3.5">
                <div className="mb-2 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-subtle">
                  Message
                </div>
                <div className="flex gap-2.5">
                  <span className="h-[26px] w-[26px] shrink-0 rounded-full bg-brand-gradient" />
                  <div className="rounded-[4px_14px_14px_14px] bg-surface-3 px-3.5 py-2.5 text-[13.5px] leading-snug">
                    Hey 👋 Here is the product link. Tap below to grab yours →
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
