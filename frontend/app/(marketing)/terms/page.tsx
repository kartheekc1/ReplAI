import type { Metadata } from "next";
import { LegalDoc } from "@/components/landing/legal-doc";

export const metadata: Metadata = {
  title: "Terms & Conditions — ReplAI",
  description:
    "The terms and conditions that govern your use of the ReplAI Instagram automation platform.",
};

export default function TermsPage() {
  return (
    <LegalDoc title="Terms & Conditions" lastUpdated="June 2026">
      <p>By accessing or using ReplAI, you agree to these Terms and Conditions.</p>

      <h2>Acceptance of Terms</h2>
      <p>By using ReplAI, you agree to comply with all applicable laws and these Terms.</p>
      <p>If you do not agree, please do not use the service.</p>

      <h2>Description of Service</h2>
      <p>
        ReplAI provides Instagram automation, messaging, analytics, and lead-generation tools through
        Meta-authorized APIs.
      </p>

      <h2>User Responsibilities</h2>
      <p>Users agree:</p>
      <ul>
        <li>To provide accurate information</li>
        <li>To comply with Meta&apos;s policies</li>
        <li>Not to use the platform for spam or illegal activities</li>
        <li>Not to attempt unauthorized access to the platform</li>
      </ul>

      <h2>Meta Platform Compliance</h2>
      <p>Users must comply with Meta&apos;s:</p>
      <ul>
        <li>Platform Terms</li>
        <li>Developer Policies</li>
        <li>Instagram Terms of Use</li>
      </ul>
      <p>ReplAI is not affiliated with or endorsed by Meta Platforms, Inc.</p>

      <h2>Account Security</h2>
      <p>Users are responsible for maintaining the security of their account credentials.</p>

      <h2>Payments and Subscriptions</h2>
      <p>Paid subscriptions may be offered through the platform.</p>
      <p>Subscription fees are billed according to the selected plan.</p>
      <p>Failure to pay may result in suspension of services.</p>

      <h2>Service Availability</h2>
      <p>We strive to provide reliable services but do not guarantee uninterrupted availability.</p>
      <p>Features may change, be updated, or discontinued without notice.</p>

      <h2>Limitation of Liability</h2>
      <p>ReplAI shall not be liable for:</p>
      <ul>
        <li>Loss of revenue</li>
        <li>Business interruptions</li>
        <li>Loss of data</li>
        <li>Actions taken by Meta or Instagram</li>
      </ul>
      <p>Use of the service is at your own risk.</p>

      <h2>Termination</h2>
      <p>We reserve the right to suspend or terminate accounts that violate these Terms.</p>

      <h2>Intellectual Property</h2>
      <p>
        All platform content, branding, software, and intellectual property remain the property of
        ReplAI.
      </p>

      <h2>Governing Law</h2>
      <p>These Terms shall be governed by applicable laws of India.</p>

      <h2>Contact</h2>
      <p>Questions regarding these Terms:</p>
      <p>
        <a href="mailto:support@getreplai.in" className="font-semibold text-brand hover:underline">
          support@getreplai.in
        </a>
      </p>

      <h2>Changes to Terms</h2>
      <p>
        We may modify these Terms at any time. Continued use of the service constitutes acceptance of
        updated Terms.
      </p>
    </LegalDoc>
  );
}
