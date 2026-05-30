import { DollarSign, Heart, MessageCircle, Send, Target } from "lucide-react";
import { AreaChart, Donut } from "@/components/shared/charts";

const CARDS = [
  { l: "Total comments", v: "48,210", icon: MessageCircle },
  { l: "DMs sent", v: "46,884", icon: Send },
  { l: "Leads captured", v: "9,317", icon: Target },
  { l: "Revenue generated", v: "$184,920", icon: DollarSign },
  { l: "Engagement rate", v: "12.4%", icon: Heart },
];

export function AnalyticsPreview() {
  return (
    <section
      className="section"
      id="analytics"
      style={{ background: "linear-gradient(180deg, transparent, #F8FAFC 50%, transparent)" }}
    >
      <div className="container-wide">
        <div className="section-head">
          <span className="eyebrow">
            <span className="dot" /> Analytics
          </span>
          <h2 className="display">Numbers that prove the ROI</h2>
          <p className="lead">Watch comments turn into conversations, leads, and revenue — in real time.</p>
        </div>
        <div className="card-rv bg-section-bg p-6">
          <div className="mb-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {CARDS.map((c) => (
              <div key={c.l} className="rounded-[13px] border border-line bg-section-bg p-4">
                <c.icon size={18} className="text-brand" />
                <div className="display mt-2.5 text-[26px]">{c.v}</div>
                <div className="mt-0.5 text-[12.5px] text-muted">{c.l}</div>
              </div>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <div className="rounded-[14px] border border-line bg-white p-5">
              <div className="mb-4 flex justify-between">
                <span className="text-sm font-semibold">DMs sent &amp; leads captured</span>
                <span className="text-[12px] text-subtle">Last 30 days</span>
              </div>
              <AreaChart data={[120, 180, 150, 240, 280, 250, 340, 300, 420, 390, 480, 540]} height={170} />
            </div>
            <div className="flex flex-col items-center justify-center rounded-[14px] border border-line bg-white p-5">
              <span className="mb-3 self-start text-sm font-semibold">Conversion rate</span>
              <Donut value={20} label="comment → lead" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
