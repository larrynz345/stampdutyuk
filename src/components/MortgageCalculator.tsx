"use client";

import { useState } from "react";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(amount);
}

export default function MortgageCalculator() {
  const [income1, setIncome1] = useState("");
  const [income2, setIncome2] = useState("");
  const [deposit, setDeposit] = useState("");

  const parsedIncome1 = parseInt(income1.replace(/,/g, ""), 10) || 0;
  const parsedIncome2 = parseInt(income2.replace(/,/g, ""), 10) || 0;
  const parsedDeposit = parseInt(deposit.replace(/,/g, ""), 10) || 0;

  const combinedIncome = parsedIncome1 + parsedIncome2;
  const maxBorrowing = combinedIncome * 4.5;
  const totalBudget = maxBorrowing + parsedDeposit;
  const hasResult = parsedIncome1 > 0;

  function handleNumericInput(setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value.replace(/[^0-9]/g, ""));
    };
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <div className="space-y-5">
          <div>
            <label htmlFor="income1" className="block text-sm font-semibold text-gray-700 mb-2">
              Your Annual Income
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl font-semibold">£</span>
              <input
                id="income1"
                type="text"
                inputMode="numeric"
                value={income1}
                onChange={handleNumericInput(setIncome1)}
                placeholder="e.g. 45000"
                className="w-full pl-10 pr-4 py-4 text-xl border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="income2" className="block text-sm font-semibold text-gray-700 mb-2">
              Second Applicant Income <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl font-semibold">£</span>
              <input
                id="income2"
                type="text"
                inputMode="numeric"
                value={income2}
                onChange={handleNumericInput(setIncome2)}
                placeholder="e.g. 35000"
                className="w-full pl-10 pr-4 py-4 text-xl border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="deposit" className="block text-sm font-semibold text-gray-700 mb-2">
              Deposit Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl font-semibold">£</span>
              <input
                id="deposit"
                type="text"
                inputMode="numeric"
                value={deposit}
                onChange={handleNumericInput(setDeposit)}
                placeholder="e.g. 30000"
                className="w-full pl-10 pr-4 py-4 text-xl border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {hasResult && (
          <div className="mt-8 space-y-4">
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white text-center">
              <p className="text-green-100 text-sm mb-1">You could borrow up to</p>
              <p className="text-4xl font-bold">{formatCurrency(maxBorrowing)}</p>
              <p className="text-green-200 text-sm mt-2">
                Based on {formatCurrency(combinedIncome)} combined income × 4.5
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Deposit</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(parsedDeposit)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Total Property Budget</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(totalBudget)}</p>
              </div>
            </div>

            <a
              href="https://www.landc.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center px-6 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-lg"
            >
              Get a free mortgage quote
            </a>
            <p className="text-xs text-gray-400 text-center">
              You&apos;ll be redirected to L&amp;C Mortgages, a free, no-obligation mortgage broker.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
