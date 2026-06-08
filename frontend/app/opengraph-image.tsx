import { ImageResponse } from "next/og";

/**
 * Dynamic Open Graph image for the home page.
 * Served at:  https://getreplai.in/opengraph-image
 *
 * Next.js 15 picks this up automatically and overrides the static
 * /og.png referenced in layout.tsx. To make it the default for every
 * page that doesn't set its own, leave it in app/ root (here).
 *
 * Docs: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
 */

export const runtime = "edge";
export const alt = "ReplAI - Turn Instagram comments into customers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #5B5FF8 0%, #7C3AED 50%, #00C2A8 100%)",
          padding: "80px 90px",
          fontFamily: "system-ui, sans-serif",
          color: "white",
        }}
      >
        {/* Top — logomark + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 800,
            }}
          >
            R
          </div>
          <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: "-0.02em" }}>
            ReplAI
          </div>
        </div>

        {/* Middle — headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              maxWidth: 980,
            }}
          >
            Turn Instagram comments into customers.
          </div>
          <div style={{ fontSize: 30, opacity: 0.9, maxWidth: 880, lineHeight: 1.35 }}>
            Auto-DM keyword triggers. Capture leads. Track revenue. On autopilot.
          </div>
        </div>

        {/* Bottom — URL */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            alignItems: "center",
            fontSize: 24,
            opacity: 0.85,
          }}
        >
          <div>getreplai.in</div>
          <div
            style={{
              padding: "12px 22px",
              borderRadius: 100,
              background: "rgba(255,255,255,0.15)",
              fontWeight: 600,
            }}
          >
            Start free →
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
