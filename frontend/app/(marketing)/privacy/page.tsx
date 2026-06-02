import type { Metadata } from "next";
import { LegalDoc } from "@/components/landing/legal-doc";

export const metadata: Metadata = {
  title: "Privacy Policy — ReplAI",
  description:
    "How ReplAI collects, uses, and protects your personal information and Instagram data.",
};

export default function PrivacyPage() {
  return (
    <LegalDoc title="Privacy Policy" lastUpdated="June 2026">
      <p>
        Welcome to ReplAI (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). We respect your
        privacy and are committed to protecting your personal information.
      </p>

      <h2>Information We Collect</h2>
      <p>We may collect the following information:</p>
      <ul>
        <li>Name and email address</li>
        <li>Instagram account information</li>
        <li>Facebook account information</li>
        <li>Profile information provided through Meta Login</li>
        <li>Usage and analytics data</li>
        <li>Payment information (processed securely through third-party payment providers)</li>
      </ul>

      <h2>How We Use Your Information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Provide and maintain our services</li>
        <li>Connect your Instagram account</li>
        <li>Enable automation features</li>
        <li>Improve platform performance</li>
        <li>Communicate with users</li>
        <li>Provide customer support</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>Instagram and Meta Data</h2>
      <p>
        ReplAI uses Meta&apos;s APIs to access authorized Instagram account data solely for providing
        automation and analytics features requested by the user.
      </p>
      <p>We do not sell or share your Instagram data with third parties.</p>

      <h2>Data Security</h2>
      <p>
        We implement industry-standard security measures to protect user information from unauthorized
        access, disclosure, or misuse.
      </p>

      <h2>Third-Party Services</h2>
      <p>We may use trusted third-party services including:</p>
      <ul>
        <li>Meta Platforms, Inc.</li>
        <li>Payment processors</li>
        <li>Analytics providers</li>
        <li>Cloud hosting providers</li>
      </ul>
      <p>These services may process information in accordance with their own privacy policies.</p>

      <h2>Data Retention</h2>
      <p>We retain user data only as long as necessary to provide services and comply with legal obligations.</p>
      <p>Users may request deletion of their account and associated data at any time.</p>

      <h2>User Rights</h2>
      <p>Users may:</p>
      <ul>
        <li>Access their personal data</li>
        <li>Request correction of inaccurate information</li>
        <li>Request deletion of their account</li>
        <li>Withdraw permissions granted through Meta</li>
      </ul>

      <h2>Contact</h2>
      <p>For privacy-related questions:</p>
      <p>
        Email:{" "}
        <a href="mailto:support@getreplai.in" className="font-semibold text-brand hover:underline">
          support@getreplai.in
        </a>
      </p>

      <h2>Changes to this Policy</h2>
      <p>
        We may update this Privacy Policy periodically. Continued use of the platform constitutes
        acceptance of any changes.
      </p>
    </LegalDoc>
  );
}
