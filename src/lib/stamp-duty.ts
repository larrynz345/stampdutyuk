export type BuyerType = "standard" | "first-time" | "additional";
export type PropertyLocation = "england" | "scotland" | "wales";

interface TaxBand {
  from: number;
  to: number;
  rate: number;
}

// England & Northern Ireland — SDLT
const STANDARD_BANDS: TaxBand[] = [
  { from: 0, to: 250_000, rate: 0 },
  { from: 250_000, to: 925_000, rate: 0.05 },
  { from: 925_000, to: 1_500_000, rate: 0.1 },
  { from: 1_500_000, to: Infinity, rate: 0.12 },
];

const FIRST_TIME_BANDS: TaxBand[] = [
  { from: 0, to: 425_000, rate: 0 },
  { from: 425_000, to: 625_000, rate: 0.05 },
];

const ADDITIONAL_SURCHARGE = 0.05;

// Scotland — LBTT
const SCOTLAND_BANDS: TaxBand[] = [
  { from: 0, to: 145_000, rate: 0 },
  { from: 145_000, to: 250_000, rate: 0.02 },
  { from: 250_000, to: 325_000, rate: 0.05 },
  { from: 325_000, to: 750_000, rate: 0.1 },
  { from: 750_000, to: Infinity, rate: 0.12 },
];

const SCOTLAND_FIRST_TIME_BANDS: TaxBand[] = [
  { from: 0, to: 175_000, rate: 0 },
  { from: 175_000, to: 250_000, rate: 0.02 },
  { from: 250_000, to: 325_000, rate: 0.05 },
  { from: 325_000, to: 750_000, rate: 0.1 },
  { from: 750_000, to: Infinity, rate: 0.12 },
];

const SCOTLAND_ADDITIONAL_SURCHARGE = 0.06;

// Wales — LTT
const WALES_BANDS: TaxBand[] = [
  { from: 0, to: 225_000, rate: 0 },
  { from: 225_000, to: 400_000, rate: 0.06 },
  { from: 400_000, to: 750_000, rate: 0.075 },
  { from: 750_000, to: 1_500_000, rate: 0.1 },
  { from: 1_500_000, to: Infinity, rate: 0.12 },
];

const WALES_ADDITIONAL_SURCHARGE = 0.04;

const NON_UK_RESIDENT_SURCHARGE = 0.02;

export interface BandBreakdown {
  from: number;
  to: number;
  rate: number;
  taxable: number;
  tax: number;
}

export interface StampDutyResult {
  totalTax: number;
  effectiveRate: number;
  breakdown: BandBreakdown[];
  buyerType: BuyerType;
  propertyPrice: number;
  location: PropertyLocation;
  taxName: string;
}

function calculateBands(price: number, bands: TaxBand[], surcharge: number): BandBreakdown[] {
  return bands
    .filter((band) => price > band.from)
    .map((band) => {
      const taxable = Math.min(price, band.to) - band.from;
      const rate = band.rate + surcharge;
      return {
        from: band.from,
        to: Math.min(price, band.to),
        rate,
        taxable,
        tax: Math.round(taxable * rate),
      };
    });
}

export function getTaxName(location: PropertyLocation): string {
  if (location === "scotland") return "LBTT";
  if (location === "wales") return "LTT";
  return "SDLT";
}

export function calculateStampDuty(
  price: number,
  buyerType: BuyerType,
  location: PropertyLocation = "england",
  nonResident: boolean = false,
): StampDutyResult {
  const taxName = getTaxName(location);

  if (price <= 0) {
    return { totalTax: 0, effectiveRate: 0, breakdown: [], buyerType, propertyPrice: price, location, taxName };
  }

  const residentSurcharge = nonResident ? NON_UK_RESIDENT_SURCHARGE : 0;
  let breakdown: BandBreakdown[];

  if (location === "scotland") {
    const additionalSurcharge = buyerType === "additional" ? SCOTLAND_ADDITIONAL_SURCHARGE : 0;
    const bands = buyerType === "first-time" ? SCOTLAND_FIRST_TIME_BANDS : SCOTLAND_BANDS;
    breakdown = calculateBands(price, bands, additionalSurcharge + residentSurcharge);
  } else if (location === "wales") {
    // Wales has no first-time buyer relief
    const additionalSurcharge = buyerType === "additional" ? WALES_ADDITIONAL_SURCHARGE : 0;
    breakdown = calculateBands(price, WALES_BANDS, additionalSurcharge + residentSurcharge);
  } else {
    // England & Northern Ireland
    if (buyerType === "first-time" && price <= 625_000) {
      breakdown = calculateBands(price, FIRST_TIME_BANDS, residentSurcharge);
    } else if (buyerType === "additional") {
      breakdown = calculateBands(price, STANDARD_BANDS, ADDITIONAL_SURCHARGE + residentSurcharge);
    } else {
      breakdown = calculateBands(price, STANDARD_BANDS, residentSurcharge);
    }
  }

  const totalTax = breakdown.reduce((sum, b) => sum + b.tax, 0);
  const effectiveRate = price > 0 ? (totalTax / price) * 100 : 0;

  return { totalTax, effectiveRate, breakdown, buyerType, propertyPrice: price, location, taxName };
}

/**
 * Reverse calculator: given a budget (deposit + stamp duty budget),
 * find the maximum property price the user can afford.
 * Uses binary search since tax is monotonically increasing.
 */
export function reverseCalculate(
  deposit: number,
  stampDutyBudget: number,
  buyerType: BuyerType,
  location: PropertyLocation = "england",
  nonResident: boolean = false,
): { maxPrice: number; actualTax: number; totalBudget: number } {
  if (deposit <= 0 && stampDutyBudget <= 0) {
    return { maxPrice: 0, actualTax: 0, totalBudget: 0 };
  }

  // Binary search for the max property price where tax <= stampDutyBudget
  // The property price = deposit (what you can put toward the property)
  // plus any leftover from the stamp duty budget.
  // Actually: user has deposit (goes to property) + stampDutyBudget (covers tax).
  // Max price they can afford = deposit + (stampDutyBudget - tax(price)).
  // We need: price such that tax(price) <= stampDutyBudget AND price <= deposit + stampDutyBudget - tax(price)
  // i.e. price + tax(price) <= deposit + stampDutyBudget

  const totalBudget = deposit + stampDutyBudget;
  let lo = 0;
  let hi = totalBudget;

  for (let i = 0; i < 100; i++) {
    const mid = Math.floor((lo + hi + 1) / 2);
    const result = calculateStampDuty(mid, buyerType, location, nonResident);
    if (mid + result.totalTax <= totalBudget) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
    if (lo >= hi) break;
  }

  const actualTax = calculateStampDuty(lo, buyerType, location, nonResident).totalTax;
  return { maxPrice: lo, actualTax, totalBudget };
}

/**
 * Returns the current UK tax year string (e.g. "2025/26").
 * UK tax year runs April 6 to April 5.
 */
export function getCurrentTaxYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed, so April = 3
  const day = now.getDate();
  const taxYearStart = month > 3 || (month === 3 && day >= 6) ? year : year - 1;
  return `${taxYearStart}/${String(taxYearStart + 1).slice(-2)}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(amount);
}

export function formatPercent(rate: number): string {
  return `${rate.toFixed(2)}%`;
}
