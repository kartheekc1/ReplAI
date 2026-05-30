const LOGOS = ["Lumen", "Northwind", "Bloomtree", "Vellum", "Cadence", "Orbital", "Halcyon", "Driftwood"];

const STATS = [
  { v: "10,000+", l: "creators & brands" },
  { v: "2M+", l: "DMs sent" },
  { v: "95%", l: "automation success rate" },
  { v: "4.9/5", l: "average rating" },
];

export function SocialProof() {
  return (
    <section className="relative z-[1] py-16">
      <div className="container-wide">
        <p className="mb-8 text-center text-[13px] font-semibold uppercase tracking-[0.08em] text-subtle">
          Trusted by creators and businesses worldwide
        </p>
        <div
          className="overflow-hidden"
          style={{
            maskImage: "linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)",
            WebkitMaskImage: "linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)",
          }}
        >
          <div className="flex w-max gap-14 animate-marquee">
            {[...LOGOS, ...LOGOS].map((l, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 text-[21px] font-bold tracking-tight text-subtle opacity-70"
              >
                <span className="grid h-[22px] w-[22px] place-items-center rounded-md bg-surface-3 text-[13px]">◆</span>
                {l}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.l} className="text-center">
              <div className="display text-[42px]">{s.v}</div>
              <div className="mt-1 text-sm text-muted">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
