export type BuyerType = "standard" | "first-time" | "additional";

interface TaxBand {
  from: number;
  to: number;
  rate: number;
}

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

export function calculateStampDuty(price: number, buyerType: BuyerType): StampDutyResult {
  if (price <= 0) {
    return { totalTax: 0, effectiveRate: 0, breakdown: [], buyerType, propertyPrice: price };
  }

  let breakdown: BandBreakdown[];

  if (buyerType === "first-time" && price <= 625_000) {
    breakdown = calculateBands(price, FIRST_TIME_BANDS, 0);
  } else if (buyerType === "additional") {
    breakdown = calculateBands(price, STANDARD_BANDS, ADDITIONAL_SURCHARGE);
  } else {
    breakdown = calculateBands(price, STANDARD_BANDS, 0);
  }

  const totalTax = breakdown.reduce((sum, b) => sum + b.tax, 0);
  const effectiveRate = price > 0 ? (totalTax / price) * 100 : 0;

  return { totalTax, effectiveRate, breakdown, buyerType, propertyPrice: price };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(amount);
}

export function formatPercent(rate: number): string {
  return `${rate.toFixed(2)}%`;
}
