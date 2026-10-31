export const PRICE = 974900;
export const TAX_ANNUAL = 10592.51;
export const RATE = 0.075;
export const TERM_YEARS = 30;
export const CLOSING_COST = 29247;
export const LISTING_ESTIMATE = 6698;
export const PREQUAL_CAP = 250000;
export const DEFAULT_DOWN_PAYMENT = 700000;
export const RATES = { usdc: 1, btc: 77369, eth: 2244.92 };
export const QUOTE_DATE = "October 31, 2026";

export const ASSETS = [
  { id: "usdc", name: "USD Coin", ticker: "USDC" },
  { id: "btc", name: "Bitcoin", ticker: "BTC" },
  { id: "eth", name: "Ethereum", ticker: "ETH" },
];

const LISTING_PHOTOS = Array.from({ length: 52 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return {
    src: `/photos/${n}.webp`,
    alt: `2120 Marquis Court, listing photo ${i + 1} of 52`,
  };
});

const FLOOR_PLANS = [
  { src: "/photos/floor-hero.png", alt: "Main floor plan, including the screened pool and garage", plan: true },
  { src: "/photos/floor-a.png", alt: "Upper floor plan", plan: true },
  { src: "/photos/floor-b.png", alt: "Office level floor plan", plan: true },
];

export const PHOTOS = [...LISTING_PHOTOS, ...FLOOR_PLANS];

export function previewPhotos(count = 8) {
  const photos = PHOTOS.filter((photo) => !photo.plan);
  const plans = PHOTOS.filter((photo) => photo.plan);
  const roomCount = Math.max(1, count - 1);
  return [...photos.slice(0, roomCount), plans[0]];
}

export const PRICE_HISTORY = [
  ["Oct 15, 2026", "Price reduced", 974900],
  ["Sep 12, 2026", "Price reduced", 999900],
  ["Aug 26, 2026", "Price reduced", 1100000],
  ["Aug 11, 2026", "Price reduced", 1174900],
  ["Jul 22, 2026", "Price reduced", 1199900],
  ["Jun 30, 2026", "Price reduced", 1250000],
  ["Jun 5, 2026", "Listed", 1290000],
  ["Dec 6, 2023", "Listing removed", null],
  ["Nov 19, 2023", "Listed", 1399000],
  ["Nov 17, 2023", "Pending sale", 1399000],
  ["Nov 13, 2023", "Listed", 1399000],
  ["Jul 21, 2020", "Sold", 567000],
  ["Jun 19, 2020", "Pending sale", 589500],
  ["Jun 14, 2020", "Price reduced", 589500],
  ["May 5, 2020", "Price reduced", 599500],
  ["Mar 19, 2020", "Listed", 615000],
  ["Jan 14, 2020", "Listing removed", 579000],
  ["Oct 8, 2019", "Price reduced", 579000],
  ["Sep 9, 2019", "Price reduced", 589000],
  ["Jun 20, 2019", "Price reduced", 599000],
  ["Jun 12, 2019", "Price reduced", 639500],
  ["Apr 21, 2019", "Price reduced", 650000],
  ["Mar 21, 2019", "Price reduced", 685000],
  ["Mar 4, 2019", "Listed", 699000],
  ["May 24, 2018", "Sold", 275700],
  ["Aug 30, 2000", "Sold", 265000],
];

export const TAX_HISTORY = [
  ["2025", 10593, 658570],
  ["2024", 10357, 640010],
  ["2023", 9996, 640010],
  ["2022", 8707, 621370],
  ["2021", 8570, 567223],
  ["2020", 8910, 547535],
  ["2019", 8767, 533301],
  ["2018", 8767, 326284],
  ["2017", 4790, 326284],
  ["2016", 4773, 313000],
  ["2015", 4758, 310824],
  ["2014", 4632, 378064],
  ["2013", null, 303800],
  ["2012", null, 300868],
  ["2011", null, 317167],
  ["2010", null, 343686],
  ["2009", null, 417425],
  ["2008", null, 508913],
  ["2007", null, 561408],
  ["2006", null, 509651],
  ["2005", null, 386348],
  ["2004", null, 360861],
  ["2003", null, 348387],
  ["2002", null, 307441],
  ["2000", null, 234654],
  ["1999", null, 234654],
];

export const SCHOOLS = [
  ["Trinity Oaks Elementary", "PK–5", "1.3 mi", "1827 Trinity Oaks Boulevard", "8/10"],
  ["Seven Springs Middle", "6–8", "1.9 mi", "2441 Little Road", "7/10"],
  ["James W. Mitchell High", "9–12", "2 mi", "2323 Little Road", "7/10"],
];

export const LISTING_FACTS = [
  ["Type", "Single family residence"],
  ["Built", "1984"],
  ["Lot", "1.46 acres"],
  ["Zestimate®", "$--", true],
  ["Price", "$200/sqft"],
  ["HOA", "$--", true],
  ["On market", "148 days"],
];

export const SPEC_GROUPS = [
  {
    title: "Interior",
    rows: [
      ["Bedrooms", "5"],
      ["Full baths", "4"],
      ["Half bath", "1"],
      ["Living area", "4,870 sq ft"],
      ["Stories", "2"],
      ["Room count", "15"],
      ["Flooring", "Luxury vinyl and tile"],
      ["Fireplaces", "Two, wood-burning"],
      ["Laundry", "Inside, laundry room, washer hookup"],
      ["Other rooms", "Bonus room, family room, utility room, loft, in-law suite"],
      ["Appliances", "Cooktop, dishwasher, disposal, range, refrigerator, washer, dryer, water softener"],
      ["Ceiling fans", "Yes"],
      ["Doors", "Sliding doors"],
      ["Furnished", "No"],
      ["Total structure area", "6,694 sq ft"],
    ],
  },
  {
    title: "Rooms",
    rows: [
      ["Primary bedroom", "First floor · walk-in closet · 19 × 14 · 266 sq ft"],
      ["Office loft", "Second floor · walk-in closet · 16 × 26 · 416 sq ft"],
      ["Bedroom 2", "Second floor · built-in closet · 15 × 12 · 180 sq ft"],
      ["Bedroom 4", "Second floor · built-in closet · 15 × 13 · 195 sq ft"],
      ["Bedroom", "Second floor · built-in closet · 12 × 19 · 228 sq ft"],
      ["Primary bathroom", "First floor"],
      ["Bathroom 2", "Second floor · 9 × 9.5 · 85.5 sq ft"],
      ["Small bathroom", "First floor · 6 × 6 · 36 sq ft"],
      ["Bathroom 4", "Second floor"],
      ["Dining room", "First floor · 15 × 12 · 180 sq ft"],
      ["Foyer", "First floor · 17 × 11 · 187 sq ft"],
      ["Kitchen", "First floor · 21 × 12 · 252 sq ft"],
      ["Laundry", "First floor · 13 × 11 · 143 sq ft"],
      ["Living room", "First floor · 24 × 18 · 432 sq ft"],
      ["Second living room", "First floor · 15 × 22 · 330 sq ft"],
    ],
  },
  {
    title: "Systems",
    rows: [
      ["Cooling", "Central air, 2020 system"],
      ["Heating", "Central"],
      ["Water heater", "2021 commercial-grade tankless"],
      ["Roof", "Shingle, 2021"],
      ["Windows", "Double pane, hurricane-impact"],
      ["Kitchen", "Quartz counters, shaker cabinets, remodeled baths"],
      ["Pool equipment", "Commercial grade"],
      ["Cable", "Available and connected"],
      ["Electric", "Available, connected, on the property"],
    ],
  },
  {
    title: "Exterior and lot",
    rows: [
      ["Style", "Contemporary"],
      ["Construction", "Block, concrete, stone, wood frame"],
      ["Foundation", "Slab"],
      ["Pool", "Private in-ground saltwater, screened"],
      ["Screened outdoor space", "About 3,000 sq ft"],
      ["Garage", "4-car attached"],
      ["Parking", "4 attached garage spaces, plus uncovered"],
      ["Parking features", "Guest, open, oversized, RV with 50-amp hookup"],
      ["Other structures", "Shed"],
      ["Attached", "Yes, garage attached to the house"],
      ["Lot", "1.46 acres · 63,667 sq ft"],
      ["Landscaping", "Mature, landscaped"],
      ["Flood insurance", "Required · FEMA zone AE"],
      ["Zoning", "ER"],
      ["Special conditions", "None"],
      ["Condition", "Completed · not new construction"],
      ["Pet fee", "$0 a month"],
      ["Road", "Paved, asphalt"],
      ["Subdivision", "Cornett Woods"],
      ["View", "Trees and woods, beside a bird sanctuary"],
      ["Faces", "Southwest"],
      ["Flood zone", "AE, high-risk special flood hazard area"],
      ["Water", "Well"],
      ["Sewer", "Septic"],
    ],
  },
  {
    title: "Record",
    rows: [
      ["Home type", "Single family residence"],
      ["List price", "$974,900"],
      ["Price per sq ft", "$200"],
      ["2025 property tax", "$10,592.51 · table rounds to $10,593"],
      ["2025 tax assessment", "$658,570"],
      ["Tax assessed value on the listing facts", "$1,061,159"],
      ["HOA", "$--"],
      ["Ownership", "Fee simple"],
      ["Homestead", "Yes"],
      ["Rent", "None reported"],
      ["Listing financing", "Cash, conventional, VA"],
      ["On market", "June 5, 2026 · 148 days"],
      ["Listing updated", "October 15, 2026"],
      ["County", "Pasco"],
      ["Region", "New Port Richey"],
      ["Parcel", "162628011.0000.00003.0"],
      ["Legal", "Cornett Woods PB 21 PG 51 Lot 3"],
      ["MLS", "Stellar MLS W7886474"],
      ["Listed by", "Nicholas Vavoulis, Re/Max Marketing Specialists · 727-234-3743"],
      ["Brokerage phone", "727-853-7801"],
      ["Year built", "1984"],
      ["Virtual tour", "Included on the listing"],
      ["Zestimate®", "$--"],
      ["Rent estimate", "Not published"],
    ],
  },
];

export function payment(principal, annualRate = RATE, years = TERM_YEARS) {
  if (principal <= 0) return 0;
  const n = years * 12;
  const r = annualRate / 12;
  const growth = (1 + r) ** n;
  return (principal * r * growth) / (growth - 1);
}

const TAX_MONTHLY = TAX_ANNUAL / 12;
export const INSURANCE_MONTHLY = LISTING_ESTIMATE - payment(PRICE * 0.8) - TAX_MONTHLY;

export function cents(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function usd(n, digits = 0) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function percentLabel(p) {
  const n = Math.round(p * 1000) / 10;
  return Number.isInteger(n) ? `${n}%` : `${n.toFixed(1)}%`;
}

export function cryptoText(asset, amount) {
  if (asset === "wire") return "Wire transfer";
  if (asset === "cash") return "Cash deposit";
  if (asset === "usdc") {
    return `${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;
  }
  if (asset === "btc") {
    return `${amount.toLocaleString("en-US", { maximumFractionDigits: 8 })} BTC`;
  }
  return `${amount.toLocaleString("en-US", { maximumFractionDigits: 6 })} ETH`;
}

export function when(iso) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function freshAccount() {
  return {
    name: "",
    email: "",
    phone: "",
    timeline: "60–90 days",
    prequalified: false,
    downPercent: 0.2,
    paidDown: 0,
    paidClosing: 0,
    paidPrincipal: 0,
    balances: { usdc: 180000, btc: 0.55, eth: 12 },
    payments: [],
    docs: { contract: false, insurance: false, appraisal: false },
  };
}

export function buildFigures(state, terms) {
  const downPayment = terms
    ? cents(Math.max(0, Number(terms.downPayment) || DEFAULT_DOWN_PAYMENT))
    : cents(PRICE * state.downPercent);
  const deposited = terms
    ? cents(Math.min(PREQUAL_CAP, Math.max(0, Number(terms.deposited) || 0)))
    : 0;
  const towardDown = cents(Math.min(downPayment, deposited + state.paidDown));
  const loan = cents(Math.max(0, PRICE - downPayment - state.paidPrincipal));
  const pi = payment(loan);
  const tax = TAX_MONTHLY;
  const ins = INSURANCE_MONTHLY;
  const downRatio = PRICE > 0 ? downPayment / PRICE : 0;
  const pmi = downRatio < 0.2 - 1e-9 && loan > 0 ? (loan * 0.005) / 12 : 0;
  const parts = {
    pi: cents(pi),
    tax: cents(tax),
    ins: cents(ins),
    pmi: cents(pmi),
    hoa: 0,
  };
  const total = cents(parts.pi + parts.tax + parts.ins + parts.pmi);
  const remainingDown = cents(Math.max(0, downPayment - towardDown));
  const remainingClosing = cents(Math.max(0, CLOSING_COST - state.paidClosing));
  const usdBalance = cents(
    state.balances.usdc * RATES.usdc +
      state.balances.btc * RATES.btc +
      state.balances.eth * RATES.eth,
  );
  return {
    plannedDown: downPayment,
    downPayment,
    prequalifiedFunds: deposited,
    prequalifiedCap: PREQUAL_CAP,
    deposited,
    towardDown,
    closing: CLOSING_COST,
    loan,
    parts,
    total,
    remainingDown,
    remainingClosing,
    cashToClose: cents(remainingDown + remainingClosing),
    payoffCap: cents(remainingDown + remainingClosing + loan),
    usdBalance,
    assetUsd: {
      usdc: cents(state.balances.usdc * RATES.usdc),
      btc: cents(state.balances.btc * RATES.btc),
      eth: cents(state.balances.eth * RATES.eth),
    },
  };
}

export function splitAcrossAssets(ids, usdAmount, assetUsd) {
  const usable = ids.filter((id) => (assetUsd[id] || 0) > 0);
  const pool = usable.reduce((sum, id) => sum + assetUsd[id], 0);
  const target = cents(Math.min(usdAmount, pool));
  if (target <= 0 || usable.length === 0) return [];
  let left = target;
  const parts = usable.map((id) => {
    const share = cents(target * (assetUsd[id] / pool));
    const take = cents(Math.min(assetUsd[id], share, left));
    left = cents(left - take);
    return { id, usd: take };
  });
  if (left > 0) {
    const room = [...parts].sort((a, b) => assetUsd[b.id] - assetUsd[a.id] - (b.usd - a.usd));
    for (const part of room) {
      const extra = cents(Math.min(left, assetUsd[part.id] - part.usd));
      if (extra <= 0) continue;
      part.usd = cents(part.usd + extra);
      left = cents(left - extra);
      if (left <= 0) break;
    }
  }
  return parts.filter((part) => part.usd > 0);
}

export function allocate(usdAmount, figures) {
  let left = cents(usdAmount);
  const toDown = cents(Math.min(left, figures.remainingDown));
  left = cents(left - toDown);
  const toClosing = cents(Math.min(left, figures.remainingClosing));
  left = cents(left - toClosing);
  const toPrincipal = cents(Math.min(left, figures.loan));
  return { toDown, toClosing, toPrincipal, applied: cents(toDown + toClosing + toPrincipal) };
}
