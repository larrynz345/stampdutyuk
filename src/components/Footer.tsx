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

        <div className="border-t border-gray-800 mt-8 pt-8 space-y-4 text-xs text-gray-500">
          <p>
            <span className="text-gray-400 font-semibold">Disclaimer:</span> This calculator is for guidance purposes only and does not constitute financial, legal or tax advice. Stamp duty calculations are based on current HMRC, Revenue Scotland and Welsh Revenue Authority rates. Always consult a qualified solicitor or financial adviser before making property decisions. We endeavour to keep information accurate and up to date but accept no liability for errors or omissions.
          </p>
          <p>
            <span className="text-gray-400 font-semibold">Affiliate Disclosure:</span> Some links on this site are affiliate links. If you use them we may earn a commission at no extra cost to you.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4 text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
