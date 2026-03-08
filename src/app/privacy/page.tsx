import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Stamp Duty UK. Learn how we use cookies, Google Analytics, and Google AdSense.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="py-8 md:py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
          &larr; Back to calculator
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 text-sm leading-relaxed">
          <p>
            Last updated: March 2026. This privacy policy explains how Stamp Duty UK (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) handles information when you visit our website.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Information We Collect</h2>
          <p>
            We do not directly collect, store or process any personal data such as your name, email address, phone number or postal address. We do not require you to create an account or submit any personal information to use our stamp duty calculator.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Google Analytics</h2>
          <p>
            We use Google Analytics to understand how visitors interact with our website. Google Analytics collects information such as:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Pages you visit and time spent on each page</li>
            <li>Your approximate geographic location (city/country level)</li>
            <li>Your browser type, device type and operating system</li>
            <li>Referring website or search terms that led you to our site</li>
          </ul>
          <p>
            This data is collected using cookies and is processed by Google. The information is aggregated and anonymised. We do not use Google Analytics to identify individual visitors. You can opt out of Google Analytics by installing the{" "}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Google Analytics Opt-out Browser Add-on
            </a>.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Google AdSense</h2>
          <p>
            We use Google AdSense to display advertisements on our website. Google AdSense may use cookies and web beacons to serve ads based on your prior visits to this or other websites. Google&apos;s use of advertising cookies enables it and its partners to serve ads based on your browsing history.
          </p>
          <p>
            You may opt out of personalised advertising by visiting{" "}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Google Ads Settings
            </a>{" "}
            or{" "}
            <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              www.aboutads.info
            </a>.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Cookies</h2>
          <p>
            Cookies are small text files stored on your device by your web browser. Our website uses cookies for the following purposes:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><span className="font-medium">Essential cookies:</span> To remember your cookie consent preference.</li>
            <li><span className="font-medium">Analytics cookies:</span> Set by Google Analytics to help us understand site usage.</li>
            <li><span className="font-medium">Advertising cookies:</span> Set by Google AdSense to serve relevant advertisements.</li>
          </ul>
          <p>
            You can control and delete cookies through your browser settings. Please note that disabling cookies may affect the functionality of some parts of the website.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Third-Party Links</h2>
          <p>
            Our website may contain links to third-party websites, including affiliate links. We are not responsible for the privacy practices or content of these external sites. We encourage you to read the privacy policy of any website you visit.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Affiliate Links</h2>
          <p>
            Some links on this site are affiliate links. If you click on an affiliate link and make a purchase or sign up for a service, we may receive a commission at no additional cost to you. This does not influence the information or calculations provided on our site.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Children&apos;s Privacy</h2>
          <p>
            Our website is not directed at children under the age of 13. We do not knowingly collect any information from children.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Contact</h2>
          <p>
            If you have any questions about this privacy policy, please contact us through our website.
          </p>
        </div>
      </div>
    </div>
  );
}
