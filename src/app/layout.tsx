import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import { getCurrentTaxYear } from "@/lib/stamp-duty";

const taxYear = getCurrentTaxYear();

export const metadata: Metadata = {
  title: {
    default: `UK Stamp Duty Calculator ${taxYear} | SDLT Calculator`,
    template: "%s | Stamp Duty UK",
  },
  description:
    `Free UK Stamp Duty Land Tax (SDLT) calculator for ${taxYear}. Calculate stamp duty for standard buyers, first-time buyers, and additional properties in England & Northern Ireland.`,
  keywords: ["stamp duty calculator", "SDLT calculator", "UK stamp duty", "stamp duty land tax", "property tax UK"],
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Stamp Duty UK",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="2ptnR5lbkCCC5ZEQ1oD759uswUaNr5TW8obzw6Ytjn8" />
      </head>
      <body className="bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen flex flex-col antialiased transition-colors">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
