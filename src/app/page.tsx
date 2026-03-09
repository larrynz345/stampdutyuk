import type { Metadata } from "next";
import Calculator from "@/components/Calculator";
import MortgageCalculator from "@/components/MortgageCalculator";
import Link from "next/link";
import { UK_CITIES, SEO_PRICES, formatPriceForTitle } from "@/lib/seo-data";

export const metadata: Metadata = {
  title: "UK Stamp Duty Calculator 2025 | Free SDLT Calculator",
  description:
    "Calculate UK Stamp Duty Land Tax (SDLT) instantly. Free calculator for standard buyers, first-time buyers, and additional properties. Updated for 2025 rates.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <div className="py-8 md:py-12 px-4">
      <div className="max-w-6xl mx-auto text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          UK Stamp Duty Calculator
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Calculate how much Stamp Duty Land Tax (SDLT) you&apos;ll pay on your property
          purchase in England or Northern Ireland. Updated with the latest 2025 rates.
        </p>
        <span className="inline-flex items-center gap-1.5 mt-4 px-3 py-1 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 text-xs font-medium rounded-full border border-green-200 dark:border-green-800">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 01.208 1.04l-5 7.5a.75.75 0 01-1.154.114l-3-3a.75.75 0 011.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 011.04-.207z" clipRule="evenodd" />
          </svg>
          Updated for 2025/26 HMRC rates
        </span>
      </div>

      <Calculator />

      <section className="max-w-4xl mx-auto mt-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            How Much Can I Borrow?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Estimate your maximum mortgage borrowing based on your income. Most lenders offer up to 4.5 times your combined annual income.
          </p>
        </div>
        <MortgageCalculator />
      </section>

      <section className="max-w-4xl mx-auto mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Current UK Stamp Duty Rates (2025)
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Standard Rate</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>0% up to £250,000</li>
              <li>5% on £250,001 – £925,000</li>
              <li>10% on £925,001 – £1,500,000</li>
              <li>12% above £1,500,000</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">First-Time Buyers</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>0% up to £425,000</li>
              <li>5% on £425,001 – £625,000</li>
              <li className="text-amber-600">Only on properties up to £625,000</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Additional Properties</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>5% up to £250,000</li>
              <li>10% on £250,001 – £925,000</li>
              <li>15% on £925,001 – £1,500,000</li>
              <li>17% above £1,500,000</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Stamp Duty by Property Price
        </h2>
        <p className="text-gray-600 mb-6">
          Browse stamp duty calculations for common property prices across the UK.
        </p>
        <div className="flex flex-wrap gap-2">
          {SEO_PRICES.filter((_, i) => i % 2 === 0).map((price) => (
            <Link
              key={price}
              href={`/stamp-duty-on/${price}`}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors"
            >
              {formatPriceForTitle(price)}
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Stamp Duty by City
        </h2>
        <p className="text-gray-600 mb-6">
          Find stamp duty estimates based on average property prices in UK cities.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {UK_CITIES.map((city) => (
            <Link
              key={city.slug}
              href={`/stamp-duty-in/${city.slug}`}
              className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <span className="block font-medium text-gray-800 text-sm">{city.name}</span>
              <span className="block text-xs text-gray-500">{city.region}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {[
            {
              q: "What is Stamp Duty Land Tax (SDLT)?",
              a: "Stamp Duty Land Tax is a tax you pay when buying property or land in England and Northern Ireland over a certain price. The amount depends on the purchase price, whether it's your first home, and whether you already own property.",
            },
            {
              q: "Do first-time buyers pay stamp duty?",
              a: "First-time buyers benefit from stamp duty relief. You pay no stamp duty on the first £425,000 of a property priced up to £625,000, and 5% on the portion between £425,001 and £625,000. If the property costs more than £625,000, standard rates apply.",
            },
            {
              q: "What is the additional property surcharge?",
              a: "If you're buying an additional property (such as a second home or buy-to-let), you pay a 5% surcharge on top of the standard stamp duty rates. This applies to the entire purchase price.",
            },
            {
              q: "When do I pay stamp duty?",
              a: "You must pay SDLT within 14 days of completing your property purchase. Your solicitor or conveyancer usually handles the payment and filing of the SDLT return on your behalf.",
            },
          ].map(({ q, a }) => (
            <details key={q} className="bg-white rounded-xl p-5 shadow-sm group">
              <summary className="font-semibold text-gray-800 cursor-pointer list-none flex items-center justify-between">
                {q}
                <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <p className="mt-3 text-gray-600 text-sm">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
