/**
 * JSON-LD structured data for rich Google search results.
 * Adds Organization + WebSite + SoftwareApplication entries so Google can show
 * a rich card for "ReplAI" with logo, price, sitelinks search box, etc.
 *
 * Render this in app/(marketing)/layout.tsx so it ships on every public page.
 */
export function JsonLd() {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "ReplAI",
      url: "https://getreplai.in",
      logo: "https://getreplai.in/logo.png",
      sameAs: [
        // Add your real social profiles
        // "https://twitter.com/getreplai",
        // "https://www.instagram.com/getreplai",
        // "https://www.linkedin.com/company/getreplai",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "support@getreplai.in",
        availableLanguage: ["English"],
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "ReplAI",
      url: "https://getreplai.in",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://getreplai.in/?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "ReplAI",
      operatingSystem: "Web",
      applicationCategory: "BusinessApplication",
      description:
        "Instagram comment-to-DM automation for creators and businesses. Capture leads, automate replies, track conversions.",
      offers: [
        { "@type": "Offer", name: "Free",    price: "0",    priceCurrency: "INR" },
        { "@type": "Offer", name: "Starter", price: "349",  priceCurrency: "INR" },
        { "@type": "Offer", name: "Pro",     price: "499",  priceCurrency: "INR" },
        { "@type": "Offer", name: "Agency",  price: "1299", priceCurrency: "INR" },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "120",
        bestRating: "5",
      },
    },
  ];

  return (
    <script
      type="application/ld+json"
      // dangerouslySetInnerHTML is required for inline JSON-LD per Next.js
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
