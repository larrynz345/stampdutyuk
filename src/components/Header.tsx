import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900">
          Stamp Duty <span className="text-blue-600">UK</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900 transition-colors">Calculator</Link>
          <Link href="/stamp-duty-on-300000" className="hover:text-gray-900 transition-colors">Examples</Link>
        </nav>
      </div>
    </header>
  );
}
