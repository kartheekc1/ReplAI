import { ArrowRight, Star } from "lucide-react";

const T = [
  {
    name: "Maya Rodriguez",
    role: "Skincare creator · 340K",
    quote:
      "ReplAI replaced my whole VA team. Comments turn into DMs while I sleep — my link clicks tripled in week one.",
    before: "2.1%",
    after: "8.4%",
    metric: "comment → click",
  },
  {
    name: "Devin Park",
    role: "Founder, Northwind Goods",
    quote:
      "We launched a product drop and captured 4,200 emails from comments in 48 hours. The ROI is honestly absurd.",
    before: "$0",
    after: "$62K",
    metric: "launch revenue",
  },
  {
    name: "Lena Hoffmann",
    role: "Fitness coach · 180K",
    quote:
      "Setup took five minutes. The AI replies sound exactly like me and my DMs finally feel personal at scale.",
    before: "40/day",
    after: "900/day",
    metric: "DMs handled",
  },
];

export function Testimonials() {
  return (
    <section className="section" id="testimonials">
      <div className="container-wide">
        <div className="section-head">
          <span className="eyebrow">
            <span className="dot" /> Testimonials
          </span>
          <h2 className="display">Loved by creators who grew with it</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {T.map((x) => (
            <div key={x.name} className="card-rv card-rv-hover flex flex-col p-6">
              <div className="mb-3 flex gap-1 text-warning">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} size={15} fill="currentColor" />
                ))}
              </div>
              <p className="mb-5 flex-1 text-[15.5px] leading-[1.55]">&ldquo;{x.quote}&rdquo;</p>
              <div className="mb-4 flex gap-3 border-y border-line py-3.5">
                <div className="flex-1">
                  <div className="text-[11px] uppercase tracking-wider text-subtle">Before</div>
                  <div className="font-display text-[21px] text-muted">{x.before}</div>
                </div>
                <div className="grid place-items-center text-brand">
                  <ArrowRight size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-[11px] uppercase tracking-wider text-subtle">After</div>
                  <div className="grad-text font-display text-[21px]">{x.after}</div>
                  <div className="text-[10.5px] text-subtle">{x.metric}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-gradient text-sm font-bold text-white">
                  {x.name.split(" ").map((w) => w[0]).join("")}
                </span>
                <div>
                  <div className="text-sm font-semibold">{x.name}</div>
                  <div className="text-[12.5px] text-muted">{x.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
