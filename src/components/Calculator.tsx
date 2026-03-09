"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  calculateStampDuty,
  reverseCalculate,
  formatCurrency,
  formatPercent,
  getTaxName,
  type BuyerType,
  type PropertyLocation,
} from "@/lib/stamp-duty";

const QUICK_PRICES = [
  { label: "£250k", value: 250_000 },
  { label: "£400k", value: 400_000 },
  { label: "£500k", value: 500_000 },
  { label: "£750k", value: 750_000 },
  { label: "£1M", value: 1_000_000 },
];

const LOCATIONS: { value: PropertyLocation; label: string }[] = [
  { value: "england", label: "England / N. Ireland" },
  { value: "scotland", label: "Scotland" },
  { value: "wales", label: "Wales" },
];

const BUYER_OPTIONS: { value: BuyerType; label: string; urlKey: string }[] = [
  { value: "standard", label: "Standard", urlKey: "std" },
  { value: "first-time", label: "First-Time", urlKey: "ftb" },
  { value: "additional", label: "Additional", urlKey: "add" },
];

function buyerFromUrl(key: string | null): BuyerType {
  if (key === "ftb") return "first-time";
  if (key === "add") return "additional";
  return "standard";
}

function buyerToUrl(bt: BuyerType): string {
  return BUYER_OPTIONS.find((o) => o.value === bt)?.urlKey ?? "std";
}

function formatWithCommas(value: string): string {
  const num = value.replace(/[^0-9]/g, "");
  if (!num) return "";
  return parseInt(num, 10).toLocaleString("en-GB");
}

type CalcTab = "calculator" | "reverse";

export default function Calculator({ initialPrice = 0 }: { initialPrice?: number }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const initDone = useRef(false);

  // Read initial state from URL params (only on home page)
  const urlPrice = isHomePage ? parseInt(searchParams.get("price") || "", 10) || 0 : 0;
  const urlBuyer = isHomePage ? buyerFromUrl(searchParams.get("buyer")) : "standard";
  const urlLocation = isHomePage
    ? (["england", "scotland", "wales"].includes(searchParams.get("location") || "") ? searchParams.get("location") as PropertyLocation : "england")
    : "england";

  const effectiveInitialPrice = urlPrice || initialPrice;

  const [tab, setTab] = useState<CalcTab>("calculator");
  const [priceInput, setPriceInput] = useState(effectiveInitialPrice > 0 ? effectiveInitialPrice.toLocaleString("en-GB") : "");
  const [buyerType, setBuyerType] = useState<BuyerType>(urlPrice ? urlBuyer : "standard");
  const [location, setLocation] = useState<PropertyLocation>(urlPrice ? urlLocation : "england");
  const [nonResident, setNonResident] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reverse calculator state
  const [depositInput, setDepositInput] = useState("");
  const [budgetInput, setBudgetInput] = useState("");

  const price = parseInt(priceInput.replace(/,/g, ""), 10) || 0;
  const result = calculateStampDuty(price, buyerType, location, nonResident);
  const maxBandTax = result.breakdown.length > 0 ? Math.max(...result.breakdown.map((b) => b.tax)) : 0;
  const taxName = getTaxName(location);

  // Reverse calc
  const deposit = parseInt(depositInput.replace(/,/g, ""), 10) || 0;
  const sdBudget = parseInt(budgetInput.replace(/,/g, ""), 10) || 0;
  const reverseResult = reverseCalculate(deposit, sdBudget, buyerType, location, nonResident);

  // Animated counter for stamp duty total
  const displayTax = tab === "calculator" && price > 0 ? result.totalTax : 0;
  const motionTax = useMotionValue(displayTax);
  const springTax = useSpring(motionTax, { stiffness: 200, damping: 30 });
  const animatedTax = useTransform(springTax, (v) =>
    formatCurrency(Math.round(v))
  );
  useEffect(() => {
    motionTax.set(displayTax);
  }, [displayTax, motionTax]);

  // Key that changes when calculation changes, for result card pulse
  const resultKey = `${displayTax}-${result.effectiveRate}`;

  // URL state sync (home page only)
  useEffect(() => {
    if (!isHomePage) return;
    // Skip first render to avoid overwriting URL on mount
    if (!initDone.current) {
      initDone.current = true;
      return;
    }
    const params = new URLSearchParams();
    if (price > 0) params.set("price", price.toString());
    if (buyerType !== "standard") params.set("buyer", buyerToUrl(buyerType));
    if (location !== "england") params.set("location", location);
    const qs = params.toString();
    const newUrl = qs ? `${pathname}?${qs}` : pathname;
    window.history.replaceState(null, "", newUrl);
  }, [price, buyerType, location, isHomePage, pathname]);

  const handlePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPriceInput(formatWithCommas(e.target.value));
  }, []);

  const handleQuickPrice = useCallback((value: number) => {
    setPriceInput(value.toLocaleString("en-GB"));
  }, []);

  const handleShare = useCallback(async () => {
    let url: string;
    if (isHomePage) {
      const params = new URLSearchParams();
      if (price > 0) params.set("price", price.toString());
      if (buyerType !== "standard") params.set("buyer", buyerToUrl(buyerType));
      if (location !== "england") params.set("location", location);
      const qs = params.toString();
      url = window.location.origin + (qs ? `/?${qs}` : "/");
    } else {
      url = window.location.href;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [price, buyerType, location, isHomePage]);

  const handleDownload = useCallback(() => {
    const lines = [
      `UK ${taxName} Calculation`,
      `Date: ${new Date().toLocaleDateString("en-GB")}`,
      "",
      `Property Price: ${formatCurrency(price)}`,
      `Buyer Type: ${BUYER_OPTIONS.find((o) => o.value === buyerType)?.label}`,
      `Location: ${LOCATIONS.find((l) => l.value === location)?.label}`,
      `Non-UK Resident: ${nonResident ? "Yes" : "No"}`,
      "",
      `Total ${taxName}: ${formatCurrency(result.totalTax)}`,
      `Effective Rate: ${formatPercent(result.effectiveRate)}`,
      "",
      "Band Breakdown:",
      ...result.breakdown.map(
        (b) => `  ${formatCurrency(b.from)} - ${formatCurrency(b.to)} @ ${(b.rate * 100).toFixed(0)}% = ${formatCurrency(b.tax)}`
      ),
      "",
      `Property Price: ${formatCurrency(price)}`,
      `${taxName}:${" ".repeat(Math.max(1, 14 - taxName.length))}${formatCurrency(result.totalTax)}`,
      `Total Cost:     ${formatCurrency(price + result.totalTax)}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `stamp-duty-${price}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [price, buyerType, location, nonResident, result, taxName]);

  return (
    <div className="max-w-6xl mx-auto pb-20 md:pb-0">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tab Switcher */}
          <div className="flex bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-1.5 transition-colors">
            {(
              [
                { value: "calculator", label: "Calculator" },
                { value: "reverse", label: "Reverse Calculator" },
              ] as const
            ).map((t) => (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                  tab === t.value
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Location Toggle */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 transition-colors">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Property Location
            </label>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc.value}
                  onClick={() => setLocation(loc.value)}
                  className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                    location === loc.value
                      ? "bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {loc.label}
                </button>
              ))}
            </div>

            {/* Non-UK Resident Toggle */}
            <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Non-UK Resident</span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">+2% surcharge on all bands</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={nonResident}
                onClick={() => setNonResident(!nonResident)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  nonResident ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    nonResident ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {tab === "calculator" ? (
            <>
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
                    onFocus={(e) => e.target.select()}
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

              {/* Buyer Type Card — Pill Toggle */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 transition-colors">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Buyer Type</label>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                  {BUYER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setBuyerType(opt.value)}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                        buyerType === opt.value
                          ? "bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {buyerType === "first-time" && location === "england" && (
                  <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                    Relief applies to properties up to £625,000. Standard rates apply above this.
                  </p>
                )}
                {buyerType === "first-time" && location === "wales" && (
                  <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                    Wales does not offer first-time buyer relief. Standard LTT rates apply.
                  </p>
                )}
                {buyerType === "additional" && (
                  <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    {location === "scotland"
                      ? "6% ADS surcharge applies on top of LBTT rates."
                      : location === "wales"
                        ? "4% higher rate surcharge applies on top of LTT rates."
                        : "5% surcharge applies on top of standard SDLT rates."}
                  </p>
                )}
              </div>
            </>
          ) : (
            /* Reverse Calculator */
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 transition-colors space-y-5">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter your total budget and we&apos;ll calculate the maximum property price you can afford after {taxName}.
              </p>

              <div>
                <label htmlFor="deposit" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Deposit / Property Funds
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xl font-semibold">£</span>
                  <input
                    id="deposit"
                    type="text"
                    inputMode="numeric"
                    value={depositInput}
                    onChange={(e) => setDepositInput(formatWithCommas(e.target.value))}
                    onFocus={(e) => e.target.select()}
                    placeholder="e.g. 50,000"
                    className="w-full pl-10 pr-4 py-4 text-xl border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="sdbudget" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {taxName} Budget
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xl font-semibold">£</span>
                  <input
                    id="sdbudget"
                    type="text"
                    inputMode="numeric"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(formatWithCommas(e.target.value))}
                    onFocus={(e) => e.target.select()}
                    placeholder="e.g. 15,000"
                    className="w-full pl-10 pr-4 py-4 text-xl border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Buyer Type — Pill Toggle */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Buyer Type</label>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                  {BUYER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setBuyerType(opt.value)}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                        buyerType === opt.value
                          ? "bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {(deposit > 0 || sdBudget > 0) && (
                <div className="bg-indigo-50 dark:bg-indigo-950 rounded-xl p-5 space-y-3">
                  <div className="text-center">
                    <p className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wide">
                      Maximum Property Price
                    </p>
                    <p className="text-3xl font-bold text-indigo-600 mt-1">
                      {formatCurrency(reverseResult.maxPrice)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-indigo-200 dark:border-indigo-800">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{taxName} payable</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(reverseResult.actualTax)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total budget used</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {formatCurrency(reverseResult.maxPrice + reverseResult.actualTax)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN (Sticky) — hidden on mobile, visible on lg */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-6 space-y-6">
            {/* Results Card */}
            <motion.div
              key={resultKey}
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: [1, 1.01, 1], opacity: [1, 0.95, 1] }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 transition-colors"
            >
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                Your {taxName}
              </h2>

              {/* Total */}
              <div className="text-center py-4">
                <motion.p className="text-4xl md:text-5xl font-bold text-indigo-600">
                  {animatedTax}
                </motion.p>
                {/* Prominent effective rate */}
                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950 rounded-full">
                  <span className="text-xs font-medium text-indigo-500 dark:text-indigo-400 uppercase tracking-wide">Effective rate</span>
                  <span className="text-lg font-bold text-indigo-600">
                    {price > 0 && tab === "calculator" ? formatPercent(result.effectiveRate) : "0.00%"}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Tax vs. property value</span>
                  <span>{price > 0 && tab === "calculator" ? formatPercent(result.effectiveRate) : "0.00%"}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${tab === "calculator" ? Math.min(result.effectiveRate, 100) : 0}%` }}
                  />
                </div>
              </div>

              {/* Band Breakdown */}
              {tab === "calculator" && result.breakdown.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Tax by Band
                  </h3>
                  <div className="space-y-3">
                    {result.breakdown.map((band, i) => {
                      const isADS = location === "scotland" && buyerType === "additional" && band.from === 0 && band.rate === 0.08 && i === result.breakdown.length - 1;
                      return (
                      <div key={i}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">
                            {isADS ? "ADS 8%" : `${(band.rate * 100).toFixed(0)}%`}
                          </span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {formatCurrency(band.tax)}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${isADS ? "bg-amber-400 dark:bg-amber-500" : "bg-indigo-400 dark:bg-indigo-500"} rounded-full transition-all duration-500`}
                            style={{
                              width: maxBandTax > 0 ? `${(band.tax / maxBandTax) * 100}%` : "0%",
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {isADS ? "Additional Dwelling Supplement (full price)" : <>{formatCurrency(band.from)} &ndash; {formatCurrency(band.to)}</>}
                        </p>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {tab === "calculator" && result.totalTax === 0 && price > 0 && (
                <p className="text-center text-green-600 dark:text-green-400 font-medium mt-4">
                  No {taxName} to pay!
                </p>
              )}

              {/* Cost Summary */}
              {tab === "calculator" && price > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 space-y-2">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Cost Summary
                  </h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Property price</span>
                    <span className="text-gray-800 dark:text-gray-200">{formatCurrency(price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{taxName}</span>
                    <span className="text-indigo-600 font-medium">+ {formatCurrency(result.totalTax)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-gray-900 dark:text-white">Total cost</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(price + result.totalTax)}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              {tab === "calculator" && price > 0 && (
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

              {/* Next Step — Mortgage CTA */}
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Next Step
                </h3>
                <a
                  href="https://www.loan.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-950 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors group"
                >
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                      Compare mortgage rates at Loan.co.uk &rarr;
                    </span>
                    <span className="block text-xs text-indigo-500 dark:text-indigo-400 mt-0.5">
                      Free mortgage comparison. No obligation.
                    </span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0 text-indigo-400 dark:text-indigo-500 group-hover:translate-x-0.5 transition-transform">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide shrink-0">
            Your {taxName}
          </p>
          <motion.p className="text-2xl font-bold text-indigo-600 mx-3">
            {animatedTax}
          </motion.p>
          <span className="shrink-0 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 rounded-full text-xs font-bold text-indigo-600">
            {price > 0 && tab === "calculator" ? formatPercent(result.effectiveRate) : "0.00%"}
          </span>
        </div>
      </div>
    </div>
  );
}
