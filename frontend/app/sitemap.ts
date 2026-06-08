import type { MetadataRoute } from "next";

const SITE_URL = "https://getreplai.in";

/**
 * Generates /sitemap.xml at build time.
 * Lives at:  https://getreplai.in/sitemap.xml
 *
 * Priority guidelines (Google ignores absolute numbers but uses relative ordering):
 *   1.00  → home (most important)
 *   0.80  → top-funnel public pages (auth, legal)
 *   0.50  → secondary auth pages
 *   0.30  → app/dashboard pages (auth-required, low SEO value but listed for completeness)
 *
 * Change frequency hints — Google treats as a hint, not a contract.
 *
 * Docs: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Public, indexable, SEO-relevant pages
  const marketing: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,                  lastModified: now, changeFrequency: "weekly",  priority: 1.0  },
    { url: `${SITE_URL}/privacy`,           lastModified: now, changeFrequency: "yearly",  priority: 0.4  },
    { url: `${SITE_URL}/terms`,             lastModified: now, changeFrequency: "yearly",  priority: 0.4  },
  ];

  const auth: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/login`,             lastModified: now, changeFrequency: "monthly", priority: 0.6  },
    { url: `${SITE_URL}/register`,          lastModified: now, changeFrequency: "monthly", priority: 0.8  },
    { url: `${SITE_URL}/forgot-password`,   lastModified: now, changeFrequency: "yearly",  priority: 0.3  },
  ];

  // Dashboard pages — included because you asked for them, but they're
  // auth-gated. robots.txt also disallows /dashboard so Googlebot will see
  // these URLs in the sitemap and skip them at crawl time. Safe to remove
  // if you'd rather not declare them at all.
  const dashboard: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/dashboard`,             lastModified: now, changeFrequency: "daily", priority: 0.3 },
    { url: `${SITE_URL}/dashboard/accounts`,    lastModified: now, changeFrequency: "daily", priority: 0.3 },
    { url: `${SITE_URL}/dashboard/analytics`,   lastModified: now, changeFrequency: "daily", priority: 0.3 },
    { url: `${SITE_URL}/dashboard/automations`, lastModified: now, changeFrequency: "daily", priority: 0.3 },
    { url: `${SITE_URL}/dashboard/billing`,     lastModified: now, changeFrequency: "weekly",priority: 0.3 },
    { url: `${SITE_URL}/dashboard/leads`,       lastModified: now, changeFrequency: "daily", priority: 0.3 },
    { url: `${SITE_URL}/dashboard/settings`,    lastModified: now, changeFrequency: "monthly",priority: 0.3 },
  ];

  return [...marketing, ...auth, ...dashboard];
}
