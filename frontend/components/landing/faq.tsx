"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const ITEMS = [
  {
    q: "Is this allowed by Instagram?",
    a: "Yes. ReplAI uses Instagram's official Messaging API for Business and Creator accounts, so every DM is fully compliant with their terms.",
  },
  {
    q: "Do I need to share my Instagram password?",
    a: "Never. You connect securely through Instagram's official OAuth flow — we never see or store your password.",
  },
  {
    q: "How fast are DMs sent after a comment?",
    a: "Typically within 1–3 seconds. ReplAI listens to your posts in real time and responds the instant a keyword matches.",
  },
  {
    q: "Can I customize the messages?",
    a: "Completely. Write your own copy, add buttons and links, personalize with the commenter's name, or let AI smart replies adapt the tone for you.",
  },
  {
    q: "What happens if I hit my DM limit?",
    a: "You'll get a heads-up before you reach it, and you can upgrade any time. Automations pause gracefully rather than failing.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes — there are no contracts. Cancel or change plans whenever you like, right from the billing page.",
  },
];

export function FAQ() {
  return (
    <section className="section" id="faq">
      <div className="container-wide max-w-[820px]">
        <div className="section-head">
          <span className="eyebrow">
            <span className="dot" /> FAQ
          </span>
          <h2 className="display">Questions, answered</h2>
        </div>
        <Accordion type="single" collapsible defaultValue="item-0" className="flex flex-col gap-3">
          {ITEMS.map((it, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{it.q}</AccordionTrigger>
              <AccordionContent>{it.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
