import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";

export const metadata: Metadata = {
  title: {
    default: "UK Stamp Duty Calculator 2025 | SDLT Calculator",
    template: "%s | Stamp Duty UK",
  },
  description:
    "Free UK Stamp Duty Land Tax (SDLT) calculator. Calculate stamp duty for standard buyers, first-time buyers, and additional properties in England & Northern Ireland.",
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
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
