import type { MetadataRoute } from "next";

const SITE_URL = "https://getreplai.in";

/**
 * Generates /robots.txt at build time.
 * Lives at:  https://getreplai.in/robots.txt
 *
 * Rules:
 *  - Allow all crawlers on public marketing + auth pages
 *  - Disallow /dashboard, /auth/callback, /api — these are user-specific,
 *    auth-gated, or backend-internal and have zero SEO value
 *  - Point crawlers at the sitemap so they discover indexable pages directly
 *
 * Docs: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/dashboard/*",
          "/auth/callback",
          "/api/",
          "/_next/",
        ],
      },
      // Block aggressive AI scrapers if you want. Comment out to allow.
      // { userAgent: "GPTBot", disallow: "/" },
      // { userAgent: "CCBot",  disallow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
