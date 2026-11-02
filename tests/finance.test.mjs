import test from "node:test";
import assert from "node:assert/strict";
import {
  BASIC_2026,
  eligible,
  shortlist,
  project,
  prsTax,
  incomeTax,
} from "../finance.mjs";
const near = (actual, expected, tolerance = 1e-6) =>
  assert.ok(
    Math.abs(actual - expected) < tolerance,
    `${actual} != ${expected}`,
  );
test("2026 KWSP examples match official age 22 and 25 examples", () => {
  assert.equal(eligible(22, 2000).amount, 0);
  assert.equal(eligible(22, 6000).raw, 600);
  assert.equal(eligible(22, 6000).amount, 0);
  assert.equal(eligible(25, 24000).amount, 3900);
});
test("KWSP boundaries: basic savings, minimum transfer, membership and age 55", () => {
  assert.equal(BASIC_2026.length, 37);
  assert.equal(eligible(35, 120000).amount, 21900);
  assert.equal(eligible(35, 47000).amount, 0);
  assert.equal(eligible(35, 50333).amount, 0);
  assert.equal(eligible(35, 50334).amount, 1000.2);
  assert.equal(eligible(54, 192000).basic, 192000);
  assert.equal(eligible(55, 500000).supported, false);
  assert.equal(eligible(17, 500000).supported, false);
  assert.equal(eligible(35.5, 100000).supported, false);
  assert.equal(eligible(35, 120000, false).amount, 0);
});
test("strict screen excludes exact 8%, missing history, and non-Shariah; caps at three", () => {
  assert.deepEqual(
    shortlist().map((f) => f.id),
    ["PIATAF", "PRS-ISEQF", "PAIF"],
  );
  assert.deepEqual(
    shortlist("epf").map((f) => f.id),
    ["PAIF"],
  );
  assert.equal(shortlist("prs").length, 1);
  assert.equal(shortlist("cash").length, 2);
  const fixture = [
    { id: "a", shariah: true, r5: 8, r10: 10 },
    { id: "b", shariah: true, r5: 10, r10: null },
    { id: "c", shariah: false, r5: 20, r10: 30 },
  ];
  assert.equal(shortlist("all", fixture).length, 0);
  assert.equal(
    shortlist(
      "all",
      [1, 2, 3, 4].map((i) => ({
        id: String(i),
        shariah: true,
        r5: 10,
        r10: 9 + i,
      })),
    ).length,
    3,
  );
});
test("zero-rate projection reconciles gross contributions and NAV-based charges", () => {
  const p = project({
    initial: 10000,
    monthly: 500,
    years: 5,
    rate: 0,
    fee: 5,
  });
  near(p.contributed, 40000);
  near(p.value, 40000 / 1.05);
  near(p.value + p.fees, p.contributed);
});
test("monthly compounding agrees with independent annuity formula", () => {
  const initial = 10000,
    monthly = 500,
    years = 10,
    rate = 8,
    fee = 3,
    m = (1 + rate / 100) ** (1 / 12) - 1,
    n = years * 12;
  const expected =
    (initial / 1.03) * (1 + m) ** n +
    ((monthly / 1.03) * ((1 + m) ** n - 1)) / m;
  const p = project({ initial, monthly, years, rate, fee });
  near(p.value, expected);
  assert.equal(p.points.length, 11);
  assert.equal(p.points[0].contributed, 10000);
});
test("negative-return and zero-capital scenarios remain finite", () => {
  const p = project({ initial: 10000, monthly: 0, years: 3, rate: -5, fee: 0 });
  near(p.value, 10000 * 0.95 ** 3);
  assert.ok(p.gain < 0);
  assert.equal(project({ initial: 0, monthly: 0 }).value, 0);
  assert.ok(Number.isFinite(project({ initial: Infinity, rate: NaN }).value));
});
test("PRS relief caps and annuity sharing; zero relief for non-residents", () => {
  const p = prsTax({ contribution: 5000, annuity: 500, income: 80000 });
  assert.equal(p.relief, 2500);
  near(p.saving, 475);
  assert.equal(p.remaining, 0);
  assert.equal(
    prsTax({ contribution: 3000, annuity: 3000, income: 80000 }).relief,
    0,
  );
  assert.equal(prsTax({ resident: false }).relief, 0);
  assert.equal(prsTax({ resident: false }).saving, 0);
});
test("progressive tax crossing a band does not multiply entire relief by top rate", () => {
  near(incomeTax(80000), 5600);
  near(prsTax({ contribution: 3000, income: 80000 }).saving, 570);
  near(prsTax({ contribution: 3000, income: 71000 }).saving, 410);
  near(prsTax({ contribution: 3000, income: 4000 }).saving, 0);
  near(incomeTax(2000000), 528400);
});
