// 2026 policy and dated screenshot evidence. See SOURCES.md.
export const BASIC_2026 = [
  900, 1100, 1500, 1900, 4000, 6200, 8500, 11000, 13700, 16600, 19600, 22900,
  26300, 30000, 33900, 38100, 42400, 47000, 51900, 57000, 62400, 68100, 74000,
  80200, 86700, 93600, 100000, 108000, 115000, 124000, 132000, 141000, 150000,
  160000, 170000, 181000, 192000,
];
export const FUNDS = [
  {
    id: "PIATAF",
    name: "Public Islamic Asia Tactical Allocation Fund",
    type: "unit",
    shariah: true,
    category: "Asia allocation",
    r3: 34.09,
    r5: 14.91,
    r10: 13.19,
    r1: 50.01,
    risk: "Very high",
    epf: false,
    code: 39,
    color: "#67e8bc",
  },
  {
    id: "PAIF",
    name: "Public Asia Ittikal Fund",
    type: "unit",
    shariah: true,
    category: "Asia equity",
    r3: 24.67,
    r5: 8.09,
    r10: 8.98,
    r1: 26.03,
    risk: "Very high",
    epf: true,
    code: 27,
    color: "#76bdff",
  },
  {
    id: "PRS-ISEQF",
    name: "Public Mutual PRS Islamic Strategic Equity Fund",
    type: "prs",
    shariah: true,
    category: "Retirement equity",
    r3: 25.4,
    r5: 10.51,
    r10: 10.27,
    r1: 31.92,
    risk: "Very high",
    epf: false,
    code: 130,
    color: "#d6b782",
  },
  {
    id: "PCIF",
    name: "Public China Ittikal",
    type: "unit",
    shariah: true,
    r5: 5.95,
    r10: 8.15,
  },
  {
    id: "PAPFF",
    name: "Public Asia Pacific Focus",
    type: "unit",
    shariah: false,
    r5: null,
    r10: null,
  },
  {
    id: "PeAEVGF",
    name: "Public e-Asia Evolving Growth",
    type: "unit",
    shariah: false,
    r5: null,
    r10: null,
  },
  {
    id: "PCSF",
    name: "Public China Select",
    type: "unit",
    shariah: false,
    r5: 7.46,
    r10: 8.22,
  },
  {
    id: "PSTEF",
    name: "Public Select Treasures Equity",
    type: "unit",
    shariah: false,
    r5: 3.3,
    r10: 7.74,
  },
  {
    id: "PFEDF",
    name: "Public Far-East Dividend",
    type: "unit",
    shariah: false,
    r5: 9.21,
    r10: 7.15,
  },
  {
    id: "PLTF",
    name: "Public Lifestyle & Technology",
    type: "unit",
    shariah: false,
    r5: 6.7,
    r10: null,
  },
  {
    id: "PRS-MDF",
    name: "PRS Moderate",
    type: "prs",
    shariah: false,
    r5: 8.75,
    r10: 7.47,
  },
  {
    id: "PRS-IGRF",
    name: "PRS Islamic Growth",
    type: "prs",
    shariah: true,
    r5: 7.94,
    r10: 9.25,
  },
  {
    id: "PRS-GRF",
    name: "PRS Growth",
    type: "prs",
    shariah: false,
    r5: 2.76,
    r10: 4.64,
  },
  {
    id: "PRS-IMDF",
    name: "PRS Islamic Moderate",
    type: "prs",
    shariah: true,
    r5: 2.41,
    r10: 4.68,
  },
  {
    id: "PRS-EQF",
    name: "PRS Equity",
    type: "prs",
    shariah: false,
    r5: 5.3,
    r10: 7.87,
  },
  {
    id: "PRS-SEQF",
    name: "PRS Strategic Equity",
    type: "prs",
    shariah: false,
    r5: 2.45,
    r10: 5.28,
  },
  {
    id: "PRS-CVF",
    name: "PRS Conservative",
    type: "prs",
    shariah: false,
    r5: 3.89,
    r10: 4.65,
  },
  {
    id: "PRS-ICVF",
    name: "PRS Islamic Conservative",
    type: "prs",
    shariah: true,
    r5: 2.88,
    r10: 3.68,
  },
];
export const finite = (n, min = 0, max = 1e9) =>
  Math.min(max, Math.max(min, Number.isFinite(Number(n)) ? Number(n) : min));
export function eligible(age, balance, member = true) {
  age = Number(age);
  balance = finite(balance);
  if (!Number.isInteger(age) || age < 18 || age > 54)
    return { supported: false, amount: 0, basic: null, excess: 0, raw: 0 };
  const basic = BASIC_2026[age - 18],
    excess = Math.max(0, balance - basic),
    raw = excess * 0.3;
  return {
    supported: true,
    basic,
    excess,
    raw,
    amount: member && raw >= 1000 ? Math.floor(raw * 100) / 100 : 0,
  };
}
export function shortlist(filter = "all", funds = FUNDS) {
  return funds
    .filter(
      (f) =>
        f.shariah &&
        Number.isFinite(f.r5) &&
        Number.isFinite(f.r10) &&
        f.r5 > 8 &&
        f.r10 > 8,
    )
    .filter(
      (f) =>
        filter === "all" ||
        (filter === "prs"
          ? f.type === "prs"
          : filter === "epf"
            ? f.epf
            : f.type === "unit"),
    )
    .sort((a, b) => b.r10 - a.r10 || b.r5 - a.r5 || a.id.localeCompare(b.id))
    .slice(0, 3);
}
export function project({
  initial = 0,
  monthly = 0,
  years = 10,
  rate = 8,
  fee = 0,
}) {
  initial = finite(initial);
  monthly = finite(monthly);
  years = Math.round(finite(years, 1, 30));
  rate = finite(rate, -50, 30);
  fee = finite(fee, 0, 10);
  const monthlyRate = (1 + rate / 100) ** (1 / 12) - 1,
    chargeFactor = 1 + fee / 100;
  let value = initial / chargeFactor,
    fees = initial - value;
  const points = [{ year: 0, value, contributed: initial, fees }];
  for (let month = 1; month <= years * 12; month++) {
    value = value * (1 + monthlyRate) + monthly / chargeFactor;
    fees += monthly - monthly / chargeFactor;
    if (month % 12 === 0)
      points.push({
        year: month / 12,
        value,
        contributed: initial + monthly * month,
        fees,
      });
  }
  const end = points.at(-1);
  return { ...end, gain: end.value - end.contributed, points };
}
const BANDS = [
  [5000, 0],
  [20000, 0.01],
  [35000, 0.03],
  [50000, 0.06],
  [70000, 0.11],
  [100000, 0.19],
  [400000, 0.25],
  [600000, 0.26],
  [2000000, 0.28],
  [Infinity, 0.3],
];
export function incomeTax(income) {
  let tax = 0,
    lower = 0;
  income = finite(income);
  for (const [upper, rate] of BANDS) {
    tax += Math.max(0, Math.min(income, upper) - lower) * rate;
    lower = upper;
    if (income <= upper) break;
  }
  return tax;
}
export function prsTax({
  contribution = 3000,
  annuity = 0,
  income = 80000,
  resident = true,
}) {
  const room = Math.max(0, 3000 - finite(annuity)),
    relief = resident ? Math.min(finite(contribution), room) : 0,
    before = incomeTax(income),
    after = incomeTax(Math.max(0, finite(income) - relief));
  return {
    room,
    relief,
    saving: before - after,
    before,
    after,
    remaining: Math.max(0, room - relief),
  };
}
