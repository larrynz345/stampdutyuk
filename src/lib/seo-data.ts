export const SEO_PRICES = [
  50_000, 75_000, 100_000, 125_000, 150_000, 175_000, 200_000, 225_000, 250_000,
  275_000, 300_000, 325_000, 350_000, 375_000, 400_000, 425_000, 450_000, 475_000,
  500_000, 525_000, 550_000, 575_000, 600_000, 625_000, 650_000, 675_000, 700_000,
  750_000, 800_000, 850_000, 900_000, 950_000, 1_000_000, 1_100_000, 1_200_000,
  1_300_000, 1_400_000, 1_500_000, 1_750_000, 2_000_000, 2_500_000, 3_000_000,
  4_000_000, 5_000_000,
];

export interface CityData {
  slug: string;
  name: string;
  avgPrice: number;
  region: string;
}

export const UK_CITIES: CityData[] = [
  { slug: "london", name: "London", avgPrice: 523_000, region: "Greater London" },
  { slug: "manchester", name: "Manchester", avgPrice: 245_000, region: "North West" },
  { slug: "birmingham", name: "Birmingham", avgPrice: 225_000, region: "West Midlands" },
  { slug: "leeds", name: "Leeds", avgPrice: 230_000, region: "Yorkshire" },
  { slug: "liverpool", name: "Liverpool", avgPrice: 180_000, region: "North West" },
  { slug: "bristol", name: "Bristol", avgPrice: 340_000, region: "South West" },
  { slug: "sheffield", name: "Sheffield", avgPrice: 200_000, region: "Yorkshire" },
  { slug: "newcastle", name: "Newcastle", avgPrice: 195_000, region: "North East" },
  { slug: "nottingham", name: "Nottingham", avgPrice: 210_000, region: "East Midlands" },
  { slug: "leicester", name: "Leicester", avgPrice: 220_000, region: "East Midlands" },
  { slug: "coventry", name: "Coventry", avgPrice: 215_000, region: "West Midlands" },
  { slug: "cardiff", name: "Cardiff", avgPrice: 250_000, region: "Wales" },
  { slug: "edinburgh", name: "Edinburgh", avgPrice: 310_000, region: "Scotland" },
  { slug: "glasgow", name: "Glasgow", avgPrice: 175_000, region: "Scotland" },
  { slug: "bath", name: "Bath", avgPrice: 430_000, region: "South West" },
  { slug: "oxford", name: "Oxford", avgPrice: 480_000, region: "South East" },
  { slug: "cambridge", name: "Cambridge", avgPrice: 470_000, region: "East of England" },
  { slug: "brighton", name: "Brighton", avgPrice: 395_000, region: "South East" },
  { slug: "reading", name: "Reading", avgPrice: 355_000, region: "South East" },
  { slug: "southampton", name: "Southampton", avgPrice: 260_000, region: "South East" },
  { slug: "portsmouth", name: "Portsmouth", avgPrice: 265_000, region: "South East" },
  { slug: "york", name: "York", avgPrice: 310_000, region: "Yorkshire" },
  { slug: "exeter", name: "Exeter", avgPrice: 310_000, region: "South West" },
  { slug: "norwich", name: "Norwich", avgPrice: 240_000, region: "East of England" },
  { slug: "plymouth", name: "Plymouth", avgPrice: 210_000, region: "South West" },
  { slug: "derby", name: "Derby", avgPrice: 190_000, region: "East Midlands" },
  { slug: "wolverhampton", name: "Wolverhampton", avgPrice: 185_000, region: "West Midlands" },
  { slug: "aberdeen", name: "Aberdeen", avgPrice: 165_000, region: "Scotland" },
  { slug: "swansea", name: "Swansea", avgPrice: 185_000, region: "Wales" },
  { slug: "milton-keynes", name: "Milton Keynes", avgPrice: 320_000, region: "South East" },
  { slug: "sunderland", name: "Sunderland", avgPrice: 145_000, region: "North East" },
  { slug: "bournemouth", name: "Bournemouth", avgPrice: 310_000, region: "South West" },
  { slug: "luton", name: "Luton", avgPrice: 255_000, region: "East of England" },
  { slug: "stoke-on-trent", name: "Stoke-on-Trent", avgPrice: 150_000, region: "West Midlands" },
  { slug: "cheltenham", name: "Cheltenham", avgPrice: 370_000, region: "South West" },
  { slug: "guildford", name: "Guildford", avgPrice: 520_000, region: "South East" },
  { slug: "chester", name: "Chester", avgPrice: 280_000, region: "North West" },
  { slug: "winchester", name: "Winchester", avgPrice: 500_000, region: "South East" },
  { slug: "st-albans", name: "St Albans", avgPrice: 580_000, region: "East of England" },
  { slug: "harrogate", name: "Harrogate", avgPrice: 350_000, region: "Yorkshire" },
];

export function priceToSlug(price: number): string {
  return price.toString();
}

export function slugToPrice(slug: string): number | null {
  const num = parseInt(slug, 10);
  return isNaN(num) || num <= 0 ? null : num;
}

export function formatPriceForUrl(price: number): string {
  if (price >= 1_000_000) {
    const m = price / 1_000_000;
    return m % 1 === 0 ? `${m}m` : `${m}m`;
  }
  return `${(price / 1000).toFixed(0)}k`;
}

export function formatPriceForTitle(price: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(price);
}
