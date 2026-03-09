"use client";

import { useState, useCallback } from "react";
import { calculateStampDuty, formatCurrency, formatPercent, type BuyerType } from "@/lib/stamp-duty";

const QUICK_PRICES = [
  { label: "£250k", value: 250_000 },
  { label: "£400k", value: 400_000 },
  { label: "£500k", value: 500_000 },
  { label: "£750k", value: 750_000 },
  { label: "£1M", value: 1_000_000 },
];

const BUYER_OPTIONS = [
  {
    value: "standard" as BuyerType,
    label: "Standard",
    desc: "Moving home or not a first-time buyer",
    tip: "Standard SDLT rates apply to most property purchases in England and Northern Ireland.",
  },
  {
    value: "first-time" as BuyerType,
    label: "First-Time Buyer",
    desc: "Purchasing your first property",
    tip: "Relief available on properties up to £625,000. No tax on the first £425,000.",
  },
  {
    value: "additional" as BuyerType,
    label: "Additional Property",
    desc: "Second home or buy-to-let",
    tip: "A 5% surcharge applies on top of standard rates for additional properties.",
  },
];

function formatWithCommas(value: string): string {
  const num = value.replace(/[^0-9]/g, "");
  if (!num) return "";
  return parseInt(num, 10).toLocaleString("en-GB");
}

export default function Calculator({ initialPrice = 0 }: { initialPrice?: number }) {
  const [priceInput, setPriceInput] = useState(initialPrice > 0 ? initialPrice.toLocaleString("en-GB") : "");
  const [buyerType, setBuyerType] = useState<BuyerType>("standard");
  const [showTip, setShowTip] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const price = parseInt(priceInput.replace(/,/g, ""), 10) || 0;
  const result = calculateStampDuty(price, buyerType);
  const maxBandTax = result.breakdown.length > 0 ? Math.max(...result.breakdown.map((b) => b.tax)) : 0;

  const handlePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPriceInput(formatWithCommas(e.target.value));
  }, []);

  const handleQuickPrice = useCallback((value: number) => {
    setPriceInput(value.toLocaleString("en-GB"));
  }, []);

  const handleShare = useCallback(async () => {
    const url = window.location.origin + (price > 0 ? `/stamp-duty-on-${price}` : "/");
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [price]);

  const handleDownload = useCallback(() => {
    const lines = [
      "UK Stamp Duty Calculation",
      `Date: ${new Date().toLocaleDateString("en-GB")}`,
      "",
      `Property Price: ${formatCurrency(price)}`,
      `Buyer Type: ${BUYER_OPTIONS.find((o) => o.value === buyerType)?.label}`,
      "",
      `Total Stamp Duty: ${formatCurrency(result.totalTax)}`,
      `Effective Rate: ${formatPercent(result.effectiveRate)}`,
      "",
      "Band Breakdown:",
      ...result.breakdown.map(
        (b) => `  ${formatCurrency(b.from)} - ${formatCurrency(b.to)} @ ${(b.rate * 100).toFixed(0)}% = ${formatCurrency(b.tax)}`
      ),
      "",
      `Property Price: ${formatCurrency(price)}`,
      `Stamp Duty:     ${formatCurrency(result.totalTax)}`,
      `Total Cost:     ${formatCurrency(price + result.totalTax)}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `stamp-duty-${price}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [price, buyerType, result]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-3 space-y-6">
          {/* Price Input Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 transition-colors">
            <label htmlFor="price" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Property Price
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xl font-semibold">£</span>
              <input
                id="price"
                type="text"
                inputMode="numeric"
                value={priceInput}
                onChange={handlePriceChange}
                placeholder="Enter property price"
                className="w-full pl-10 pr-4 py-4 text-xl border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {QUICK_PRICES.map((qp) => (
                <button
                  key={qp.value}
                  onClick={() => handleQuickPrice(qp.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${
                    price === qp.value
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                  }`}
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Buyer Type Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 transition-colors">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Buyer Status</label>
            <div className="space-y-3">
              {BUYER_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    buyerType === opt.value
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  <input
                    type="radio"
                    name="buyerType"
                    value={opt.value}
                    checked={buyerType === opt.value}
                    onChange={() => setBuyerType(opt.value)}
                    className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="block font-semibold text-sm text-gray-900 dark:text-white">{opt.label}</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">{opt.desc}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowTip(showTip === opt.value ? null : opt.value);
                    }}
                    className="shrink-0 w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-xs font-bold flex items-center justify-center hover:bg-indigo-100 dark:hover:bg-indigo-900 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    aria-label={`Info about ${opt.label}`}
                  >
                    ?
                  </button>
                  {showTip === opt.value && (
                    <div className="absolute mt-8 right-4 z-10 max-w-xs p-3 rounded-lg bg-gray-900 dark:bg-gray-700 text-white text-xs shadow-lg">
                      {opt.tip}
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Mortgage CTA Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl shadow-lg p-6 md:p-8 text-white">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                  <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.432z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Need a mortgage?</h3>
                <p className="text-indigo-200 text-sm mt-1">
                  Compare deals from 90+ lenders. Free, no-obligation service via L&C Mortgages.
                </p>
                <a
                  href="https://www.landc.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 px-6 py-3 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors text-sm"
                >
                  Get a free quote &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Sticky) */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-6 space-y-6">
            {/* Results Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 transition-colors">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                Your Stamp Duty
              </h2>

              {/* Total SDLT */}
              <div className="text-center py-4">
                <p className="text-4xl md:text-5xl font-bold text-indigo-600">
                  {price > 0 ? formatCurrency(result.totalTax) : "£0"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Effective rate:{" "}
                  <span className="font-semibold text-gray-700 dark:text-gray-200">
                    {formatPercent(result.effectiveRate)}
                  </span>
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Tax portion</span>
                  <span>{price > 0 ? formatPercent(result.effectiveRate) : "0.00%"}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(result.effectiveRate, 100)}%` }}
                  />
                </div>
              </div>

              {/* Band Breakdown */}
              {result.breakdown.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Tax by Band
                  </h3>
                  <div className="space-y-3">
                    {result.breakdown.map((band, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">
                            {(band.rate * 100).toFixed(0)}%
                          </span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {formatCurrency(band.tax)}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-400 dark:bg-indigo-500 rounded-full transition-all duration-500"
                            style={{
                              width: maxBandTax > 0 ? `${(band.tax / maxBandTax) * 100}%` : "0%",
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {formatCurrency(band.from)} &ndash; {formatCurrency(band.to)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.totalTax === 0 && price > 0 && (
                <p className="text-center text-green-600 dark:text-green-400 font-medium mt-4">
                  No stamp duty to pay!
                </p>
              )}

              {/* Cost Summary */}
              {price > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 space-y-2">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Cost Summary
                  </h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Property price</span>
                    <span className="text-gray-800 dark:text-gray-200">{formatCurrency(price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Stamp duty</span>
                    <span className="text-indigo-600 font-medium">+ {formatCurrency(result.totalTax)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-gray-900 dark:text-white">Total cost</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(price + result.totalTax)}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              {price > 0 && (
                <div className="mt-6 flex gap-2">
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
                      <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 005.656 5.656l3-3a4 4 0 00-.225-5.865z" />
                    </svg>
                    {copied ? "Copied!" : "Share"}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                      <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                    </svg>
                    Download
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
