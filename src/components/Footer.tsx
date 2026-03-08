import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-3">Stamp Duty UK</h3>
            <p className="text-sm">
              Free UK Stamp Duty Land Tax calculator. Calculate SDLT for residential
              properties, first-time buyers, and additional properties.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Popular Calculations</h3>
            <ul className="space-y-1 text-sm">
              {[250_000, 300_000, 400_000, 500_000, 750_000, 1_000_000].map((p) => (
                <li key={p}>
                  <Link href={`/stamp-duty-on-${p}`} className="hover:text-white transition-colors">
                    Stamp Duty on £{p.toLocaleString("en-GB")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Stamp Duty by City</h3>
            <ul className="space-y-1 text-sm">
              {["london", "manchester", "birmingham", "bristol", "edinburgh", "leeds"].map((c) => (
                <li key={c}>
                  <Link href={`/stamp-duty-in-${c}`} className="hover:text-white transition-colors capitalize">
                    Stamp Duty in {c.charAt(0).toUpperCase() + c.slice(1)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>
            Rates are based on current HMRC Stamp Duty Land Tax bands for England and Northern Ireland.
            This calculator is for guidance only and does not constitute financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
