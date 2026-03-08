"use client";

import { useState } from "react";
import { calculateStampDuty, formatCurrency, formatPercent, type BuyerType } from "@/lib/stamp-duty";

export default function Calculator({ initialPrice = 0 }: { initialPrice?: number }) {
  const [priceInput, setPriceInput] = useState(initialPrice > 0 ? initialPrice.toString() : "");
  const [buyerType, setBuyerType] = useState<BuyerType>("standard");

  const price = parseInt(priceInput.replace(/,/g, ""), 10) || 0;
  const result = calculateStampDuty(price, buyerType);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <div className="mb-6">
          <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2">
            Property Price
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl font-semibold">£</span>
            <input
              id="price"
              type="text"
              inputMode="numeric"
              value={priceInput}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, "");
                setPriceInput(raw);
              }}
              placeholder="Enter property price"
              className="w-full pl-10 pr-4 py-4 text-xl border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Buyer Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(
              [
                { value: "standard", label: "Standard", desc: "Moving home" },
                { value: "first-time", label: "First-Time Buyer", desc: "First property" },
                { value: "additional", label: "Additional Property", desc: "Second home / BTL" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setBuyerType(opt.value)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  buyerType === opt.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="block font-semibold text-sm">{opt.label}</span>
                <span className="block text-xs text-gray-500 mt-0.5">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {price > 0 && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
              <div className="text-center">
                <p className="text-blue-100 text-sm mb-1">Stamp Duty to Pay</p>
                <p className="text-4xl font-bold">{formatCurrency(result.totalTax)}</p>
                <p className="text-blue-200 text-sm mt-2">
                  Effective rate: {formatPercent(result.effectiveRate)}
                </p>
              </div>
            </div>

            {result.breakdown.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Tax Band Breakdown</h3>
                <div className="space-y-2">
                  {result.breakdown.map((band, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm text-gray-600">
                          {formatCurrency(band.from)} – {formatCurrency(band.to)}
                        </span>
                        <span className="ml-2 text-xs font-medium text-gray-400">
                          @ {(band.rate * 100).toFixed(0)}%
                        </span>
                      </div>
                      <span className="font-semibold text-gray-800">{formatCurrency(band.tax)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.totalTax === 0 && (
              <p className="text-center text-green-600 font-medium">
                No stamp duty to pay on this property!
              </p>
            )}

            <a
              href="https://www.landc.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center px-6 py-5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors text-lg shadow-md shadow-blue-600/25"
            >
              Get a free mortgage quote &rarr;
            </a>
            <p className="text-xs text-gray-400 text-center">
              Compare deals from 90+ lenders. Free, no-obligation service.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
