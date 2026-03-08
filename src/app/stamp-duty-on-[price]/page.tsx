import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Calculator from "@/components/Calculator";
import Link from "next/link";
import { calculateStampDuty, formatCurrency, formatPercent } from "@/lib/stamp-duty";
import { SEO_PRICES, slugToPrice, formatPriceForTitle } from "@/lib/seo-data";

interface Props {
  params: Promise<{ price: string }>;
}

export async function generateStaticParams() {
  return SEO_PRICES.map((price) => ({ price: price.toString() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { price: slug } = await params;
  const price = slugToPrice(slug);
  if (!price) return {};
  const formatted = formatPriceForTitle(price);
  const result = calculateStampDuty(price, "standard");
  return {
    title: `Stamp Duty on ${formatted} Property | SDLT Calculator`,
    description: `Calculate stamp duty on a ${formatted} property. Standard SDLT: ${formatCurrency(result.totalTax)} (${formatPercent(result.effectiveRate)} effective rate). See breakdowns for first-time buyers and additional properties.`,
    alternates: { canonical: `/stamp-duty-on-${slug}` },
  };
}

export default async function StampDutyOnPricePage({ params }: Props) {
  const { price: slug } = await params;
  const price = slugToPrice(slug);
  if (!price || price > 100_000_000) notFound();

  const standard = calculateStampDuty(price, "standard");
  const firstTime = calculateStampDuty(price, "first-time");
  const additional = calculateStampDuty(price, "additional");
  const formatted = formatPriceForTitle(price);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How much stamp duty do I pay on a ${formatted} property?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `For a standard buyer, the stamp duty on a ${formatted} property is ${formatCurrency(standard.totalTax)}. First-time buyers pay ${formatCurrency(firstTime.totalTax)}, and additional property buyers pay ${formatCurrency(additional.totalTax)}.`,
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
          Stamp Duty on a {formatted} Property
        </h1>
        <p className="text-lg text-gray-600">
          Here&apos;s how much stamp duty you&apos;ll pay on a {formatted} property in England
          or Northern Ireland, for each buyer type.
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

      <Calculator initialPrice={price} />

      <section className="max-w-4xl mx-auto mt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Detailed Breakdown for {formatted}
        </h2>
        <div className="bg-white rounded-xl p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 text-gray-500 font-medium">Tax Band</th>
                <th className="text-right py-2 px-4 text-gray-500 font-medium">Standard</th>
                <th className="text-right py-2 px-4 text-gray-500 font-medium">First-Time</th>
                <th className="text-right py-2 pl-4 text-gray-500 font-medium">Additional</th>
              </tr>
            </thead>
            <tbody>
              {standard.breakdown.map((band, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 pr-4 text-gray-700">
                    {formatCurrency(band.from)} – {formatCurrency(band.to)}
                  </td>
                  <td className="text-right py-2 px-4">{formatCurrency(band.tax)}</td>
                  <td className="text-right py-2 px-4">
                    {firstTime.breakdown[i] ? formatCurrency(firstTime.breakdown[i].tax) : "–"}
                  </td>
                  <td className="text-right py-2 pl-4">
                    {additional.breakdown[i] ? formatCurrency(additional.breakdown[i].tax) : "–"}
                  </td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="py-3 pr-4">Total</td>
                <td className="text-right py-3 px-4">{formatCurrency(standard.totalTax)}</td>
                <td className="text-right py-3 px-4">{formatCurrency(firstTime.totalTax)}</td>
                <td className="text-right py-3 pl-4">{formatCurrency(additional.totalTax)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="max-w-4xl mx-auto mt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Other Price Points</h2>
        <div className="flex flex-wrap gap-2">
          {SEO_PRICES.filter((p) => p !== price)
            .slice(0, 20)
            .map((p) => (
              <Link
                key={p}
                href={`/stamp-duty-on-${p}`}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                {formatPriceForTitle(p)}
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
