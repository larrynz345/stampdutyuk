import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Calculator from "@/components/Calculator";
import Link from "next/link";
import { calculateStampDuty, formatCurrency, formatPercent } from "@/lib/stamp-duty";
import { UK_CITIES, formatPriceForTitle } from "@/lib/seo-data";

interface Props {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  return UK_CITIES.map((city) => ({ city: city.slug }));
}

function findCity(slug: string) {
  return UK_CITIES.find((c) => c.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: slug } = await params;
  const city = findCity(slug);
  if (!city) return {};
  const result = calculateStampDuty(city.avgPrice, "standard");
  return {
    title: `Stamp Duty in ${city.name} | Average Property ${formatPriceForTitle(city.avgPrice)}`,
    description: `Calculate stamp duty in ${city.name}. Based on the average property price of ${formatPriceForTitle(city.avgPrice)}, standard stamp duty is ${formatCurrency(result.totalTax)}. Compare rates for all buyer types.`,
    alternates: { canonical: `/stamp-duty-in-${slug}` },
  };
}

export default async function StampDutyInCityPage({ params }: Props) {
  const { city: slug } = await params;
  const city = findCity(slug);
  if (!city) notFound();

  const standard = calculateStampDuty(city.avgPrice, "standard");
  const firstTime = calculateStampDuty(city.avgPrice, "first-time");
  const additional = calculateStampDuty(city.avgPrice, "additional");
  const formatted = formatPriceForTitle(city.avgPrice);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How much is stamp duty in ${city.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Based on the average property price of ${formatted} in ${city.name}, a standard buyer would pay ${formatCurrency(standard.totalTax)} in stamp duty. First-time buyers pay ${formatCurrency(firstTime.totalTax)}, and additional property buyers pay ${formatCurrency(additional.totalTax)}.`,
        },
      },
    ],
  };

  return (
    <div className="py-8 md:py-12 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-4xl mx-auto mb-10">
        <Link href="/" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
          &larr; Back to calculator
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Stamp Duty in {city.name}
        </h1>
        <p className="text-lg text-gray-600">
          Stamp duty calculations based on the average property price of {formatted} in {city.name}, {city.region}.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4 mb-10">
        {[
          { label: "Standard Buyer", result: standard, color: "blue" },
          { label: "First-Time Buyer", result: firstTime, color: "green" },
          { label: "Additional Property", result: additional, color: "red" },
        ].map(({ label, result, color }) => (
          <div key={label} className="bg-white rounded-xl p-6 shadow-sm text-center">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className={`text-3xl font-bold text-${color}-600`}>
              {formatCurrency(result.totalTax)}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {formatPercent(result.effectiveRate)} effective rate
            </p>
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto bg-blue-50 rounded-xl p-6 mb-10">
        <h2 className="font-semibold text-blue-900 mb-2">About {city.name} Property Market</h2>
        <p className="text-blue-800 text-sm">
          The average property price in {city.name} is approximately {formatted}.
          {city.name} is located in the {city.region} region. Use the calculator below to
          calculate stamp duty for a specific property price in {city.name}.
        </p>
      </div>

      <Calculator initialPrice={city.avgPrice} />

      <section className="max-w-4xl mx-auto mt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Stamp Duty Breakdown for {formatted} in {city.name}
        </h2>
        <div className="bg-white rounded-xl p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 text-gray-500 font-medium">Tax Band</th>
                <th className="text-right py-2 px-4 text-gray-500 font-medium">Rate</th>
                <th className="text-right py-2 pl-4 text-gray-500 font-medium">Tax</th>
              </tr>
            </thead>
            <tbody>
              {standard.breakdown.map((band, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 pr-4 text-gray-700">
                    {formatCurrency(band.from)} – {formatCurrency(band.to)}
                  </td>
                  <td className="text-right py-2 px-4">{(band.rate * 100).toFixed(0)}%</td>
                  <td className="text-right py-2 pl-4 font-medium">{formatCurrency(band.tax)}</td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="py-3 pr-4" colSpan={2}>Total Stamp Duty</td>
                <td className="text-right py-3 pl-4">{formatCurrency(standard.totalTax)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="max-w-4xl mx-auto mt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Other UK Cities</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {UK_CITIES.filter((c) => c.slug !== city.slug)
            .slice(0, 16)
            .map((c) => (
              <Link
                key={c.slug}
                href={`/stamp-duty-in-${c.slug}`}
                className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <span className="block font-medium text-gray-800 text-sm">{c.name}</span>
                <span className="block text-xs text-gray-500">{formatPriceForTitle(c.avgPrice)} avg</span>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
