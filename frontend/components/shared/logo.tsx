import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Brand logo. Renders the SVG logo file from /public/logo.svg.
 *
 * Use `showText={false}` for icon-only contexts (favicons, mobile, etc.).
 * Use `size` to control rendered height in px.
 */
export function Logo({
  size = 28,
  showText = true,
  className,
}: {
  size?: number;
  showText?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 font-bold tracking-tight",
        className
      )}
      style={{ fontSize: 18.5 }}
    >
      <Image
        src="/logo.svg"
        alt="ReplAI"
        width={size}
        height={size}
        priority
        className="shrink-0"
        style={{ width: size, height: size }}
      />
      {showText && <span>ReplAI</span>}
    </span>
  );
}
