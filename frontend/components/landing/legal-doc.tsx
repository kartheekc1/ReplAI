import Link from "next/link";

/**
 * Shared layout for the Privacy Policy + Terms pages.
 * Keeps both pages visually identical and easy to maintain.
 */
export function LegalDoc({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <article className="pt-[calc(var(--nav-h)+48px)] pb-20">
      <div className="container-wide max-w-[760px]">
        <div className="mb-10 border-b border-line pb-8 text-center">
          <span className="eyebrow">
            <span className="dot" /> Legal
          </span>
          <h1 className="display mt-5" style={{ fontSize: "clamp(34px, 4vw, 52px)" }}>
            {title}
          </h1>
          <p className="mt-4 text-sm text-muted">Last updated: {lastUpdated}</p>
        </div>

        <div className="legal-prose">{children}</div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-section-bg p-5 text-sm">
          <span className="text-muted">
            Questions?{" "}
            <a href="mailto:support@getreplai.in" className="font-semibold text-brand hover:underline">
              support@getreplai.in
            </a>
          </span>
          <div className="flex gap-3">
            <Link href="/privacy" className="text-muted hover:text-ink">
              Privacy Policy
            </Link>
            <span className="text-subtle">·</span>
            <Link href="/terms" className="text-muted hover:text-ink">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
