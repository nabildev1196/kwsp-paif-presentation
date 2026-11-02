import {
  FUNDS,
  finite,
  eligible,
  shortlist,
  project,
  prsTax,
} from "./finance.mjs";
const $ = (id) => document.getElementById(id),
  $$ = (q) => [...document.querySelectorAll(q)];
const rm = (n) => "RM" + Math.round(n).toLocaleString("en-MY"),
  pct = (n) => (n == null ? "—" : n.toFixed(2) + "%");
const icons = {
  dashboard: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  chart: "M3 3v18h18 M6 16l5-6 4 3 6-8",
  wallet: "M20 7V4H4a2 2 0 0 0 0 4h17v12H4a2 2 0 0 1-2-2V6 M21 12h-6v4h6",
  receipt:
    "M5 3l2 2 2-2 3 2 3-2 2 2 2-2v18l-2-2-2 2-3-2-3 2-2-2-2 2z M8 9h8 M8 13h5",
  layers: "M12 3L2 8l10 5 10-5-10-5z M2 12l10 5 10-5 M2 16l10 5 10-5",
  donut: "M11 3a9 9 0 1 0 10 10h-9V3z M15 2v7h7a9 9 0 0 0-7-7z",
  shield: "M12 2L3 6v6c0 5 9 10 9 10s9-5 9-10V6z M8 12l3 3 5-6",
  search: "M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  terminal: "M3 4h18v16H3z M6 8l4 4-4 4 M12 16h6",
  download: "M12 3v12 M7 10l5 5 5-5 M3 16v5h18v-5",
};
$$("[data-icon]").forEach(
  (e) =>
    (e.innerHTML = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[e.dataset.icon] || icons.chart}"/></svg>`),
);
let route = "cash",
  currentProjection,
  stressProjection,
  epfResult,
  wizardStep = 0,
  goal = "retirement",
  risk = "growth",
  allocationSelected = null;
let cashMonthly = 500;
const allocations = { PIATAF: 10000, "PRS-ISEQF": 3000, PAIF: 7000 };
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
function toast(message) {
  $("toast").textContent = message;
  $("toast").hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => ($("toast").hidden = true), 4500);
}
function goTo(id) {
  document
    .querySelector(id)
    ?.scrollIntoView({ behavior: reduced.matches ? "instant" : "smooth" });
}
function number(id) {
  const e = $(id);
  return finite(
    e.value,
    e.min === "" ? 0 : Number(e.min),
    e.max === "" ? 1e9 : Number(e.max),
  );
}
function setNumber(id, value) {
  const e = $(id);
  e.value = finite(
    value,
    e.min === "" ? 0 : Number(e.min),
    e.max === "" ? 1e9 : Number(e.max),
  );
}
function inputState() {
  return {
    initial: number("initial"),
    monthly: route === "epf" ? 0 : number("monthly"),
    years: number("years"),
    rate: number("rate"),
    fee: number("fee"),
  };
}
function table(headers, rows) {
  return `<table><thead><tr>${headers.map((h) => `<th scope="col">${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}
function calculateEpf() {
  epfResult = eligible(
    $("age").value,
    number("epf-balance"),
    $("member").checked,
  );
  $("basic").textContent = epfResult.supported
    ? rm(epfResult.basic)
    : "Outside this calculator";
  $("excess").textContent = epfResult.supported
    ? `${rm(epfResult.excess)} × 30%`
    : "Refer to KWSP";
  $("epf-result").textContent = epfResult.supported
    ? rm(epfResult.amount)
    : "Refer to KWSP";
  $("summary-epf").textContent = epfResult.supported
    ? rm(epfResult.amount)
    : "Check eligibility";
  $("epf-note").textContent = !epfResult.supported
    ? "For ages 18–54 only. At 55+, different Akaun 55 / Emas withdrawal rules apply; the 30% formula does not apply."
    : !$("member").checked
      ? "Membership requirements must be met. Malaysian citizen, permanent resident, or non-Malaysian member registered before 1 August 1998."
      : epfResult.amount === 0
        ? "No eligible transfer in this estimate. Savings must exceed the age-based Basic Savings and the calculated transfer must reach RM1,000."
        : "Minimum transfer RM1,000. Final available amount depends on i-Akaun, existing transactions and current rules. Invested amounts do not earn KWSP dividends while outside KWSP.";
  $("use-epf").disabled = !epfResult.amount;
  if (route === "epf") {
    setNumber("initial", Math.min(number("initial"), epfResult.amount));
    updateProjection();
  }
}
function calculateTax() {
  const result = prsTax({
    contribution: number("prs-contribution"),
    annuity: number("annuity"),
    income: number("tax-income"),
    resident: $("resident").value === "yes",
  });
  $("prs-relief").textContent = rm(result.relief);
  $("prs-remaining").textContent = rm(result.remaining);
  $("tax-saving").textContent = rm(result.saving);
  $("summary-tax").innerHTML =
    `${rm(result.saving)}<span>/ year · estimate</span>`;
  return result;
}
function setRoute(next) {
  if (route !== "epf") cashMonthly = number("monthly");
  route = next;
  $$("[data-route]").forEach((b) => {
    const on = b.dataset.route === route;
    b.classList.toggle("selected", on);
    b.setAttribute("aria-pressed", String(on));
  });
  const isEpf = route === "epf";
  $("monthly").disabled = isEpf;
  $("monthly-range").disabled = isEpf;
  if (isEpf) {
    setNumber("monthly", 0);
    setNumber("initial", Math.min(number("initial"), epfResult.amount));
    setNumber("fee", 0.5);
  } else {
    setNumber("monthly", cashMonthly);
    setNumber("fee", route === "prs" ? 3 : 5);
  }
  updateProjection();
}
function updateProjection() {
  if (route === "epf")
    setNumber("initial", Math.min(number("initial"), epfResult.amount));
  const s = inputState();
  currentProjection = project(s);
  stressProjection = project({ ...s, rate: -5 });
  $("initial-range").value = Math.min(s.initial, 100000);
  $("monthly-range").value = Math.min(s.monthly, 5000);
  $("years-label").textContent = `${s.years} year${s.years === 1 ? "" : "s"}`;
  $("end-year").textContent = 2026 + s.years;
  $$("[data-years]").forEach((b) => {
    const on = Number(b.dataset.years) === s.years;
    b.classList.toggle("selected", on);
    b.setAttribute("aria-pressed", String(on));
  });
  $("projected-value").textContent = rm(currentProjection.value);
  $("projected-gain").textContent =
    `${currentProjection.gain >= 0 ? "+" : "−"}${rm(Math.abs(currentProjection.gain))} illustrative gain / loss · ${s.rate}% p.a. assumption`;
  $("projected-gain").classList.toggle("negative", currentProjection.gain < 0);
  $("total-contributed").textContent = rm(currentProjection.contributed);
  $("total-gain").textContent =
    (currentProjection.gain < 0 ? "−" : "") +
    rm(Math.abs(currentProjection.gain));
  $("total-gain").classList.toggle("negative", currentProjection.gain < 0);
  $("total-fees").textContent = rm(currentProjection.fees);
  $("route-note").textContent =
    route === "epf"
      ? `KWSP route · Maximum from your inputs: ${rm(epfResult.amount)}. No automatic monthly EPF transfers assumed. 0.5% is an editable i-Invest fee assumption, not a quote. Reconfirm in i-Akaun.`
      : route === "prs"
        ? "PRS route · 3% sales charge assumption. Monthly contributions at month-end. Account fees and tax savings are excluded; withdrawal restrictions apply."
        : "Cash route · 5% sales charge assumption, editable. Monthly contributions at month-end. This is a generic scenario, not a fund forecast.";
  $("inspect-year").max = s.years;
  if (Number($("inspect-year").value) > s.years)
    $("inspect-year").value = s.years;
  renderChart();
  inspectYear(Number($("inspect-year").value));
  $("scenario-table").innerHTML = table(
    ["Assumed annual return", "3 years", "5 years", "10 years"],
    [-5, 0, 5, 8, 12].map((rate) => [
      `${rate}% p.a.`,
      ...[3, 5, 10].map((years) => rm(project({ ...s, rate, years }).value)),
    ]),
  );
}
const NS = "http://www.w3.org/2000/svg";
function svgEl(tag, attrs = {}, text) {
  const e = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  if (text != null) e.textContent = text;
  return e;
}
function chartCoordinates() {
  const points = currentProjection.points,
    max =
      Math.max(
        1,
        ...points.map((p) => Math.max(p.value, p.contributed)),
        ...stressProjection.points.map((p) => p.value),
      ) * 1.12;
  return {
    x: (i) => 55 + (i / (points.length - 1)) * 665,
    y: (v) => 240 - (v / max) * 210,
    max,
  };
}
function renderChart() {
  const svg = $("growth-chart");
  svg.replaceChildren();
  const { x, y, max } = chartCoordinates(),
    points = currentProjection.points,
    years = points.length - 1;
  const defs = svgEl("defs"),
    gradient = svgEl("linearGradient", {
      id: "growth-fill",
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 1,
    });
  gradient.append(
    svgEl("stop", {
      offset: "0%",
      "stop-color": "#67e8bc",
      "stop-opacity": ".2",
    }),
    svgEl("stop", {
      offset: "100%",
      "stop-color": "#67e8bc",
      "stop-opacity": "0",
    }),
  );
  defs.append(gradient);
  svg.append(defs);
  for (let i = 0; i <= 4; i++) {
    const v = (max * i) / 4,
      py = y(v);
    svg.append(
      svgEl("line", {
        x1: 55,
        x2: 720,
        y1: py,
        y2: py,
        stroke: "#2a3e48",
        "stroke-width": ".7",
        "stroke-dasharray": "3 5",
      }),
      svgEl(
        "text",
        {
          x: 43,
          y: py + 3,
          "text-anchor": "end",
          fill: "#8ba4b0",
          "font-size": 10,
        },
        v >= 1000 ? `${Math.round(v / 1000)}k` : String(Math.round(v)),
      ),
    );
  }
  svg.append(
    svgEl("text", { x: 16, y: 15, fill: "#8ba4b0", "font-size": 9 }, "MYR"),
  );
  [
    ...new Set([
      0,
      Math.round(years * 0.25),
      Math.round(years * 0.5),
      Math.round(years * 0.75),
      years,
    ]),
  ].forEach((i) =>
    svg.append(
      svgEl(
        "text",
        {
          x: x(i),
          y: 265,
          "text-anchor": "middle",
          fill: "#8ba4b0",
          "font-size": 10,
        },
        String(2026 + i),
      ),
    ),
  );
  const path = (list, key) =>
    list
      .map(
        (p, i) => `${i ? "L" : "M"}${x(i).toFixed(2)} ${y(p[key]).toFixed(2)}`,
      )
      .join(" ");
  svg.append(
    svgEl("path", {
      d: path(points, "value") + ` L720 240 L55 240 Z`,
      fill: "url(#growth-fill)",
    }),
  );
  [
    [points, "contributed", "#8ca7b4", "5 5"],
    [stressProjection.points, "value", "#bba589", "3 5"],
    [points, "value", "#67e8bc", ""],
  ].forEach(([list, key, color, dash]) =>
    svg.append(
      svgEl("path", {
        d: path(list, key),
        fill: "none",
        stroke: color,
        "stroke-width": key === "value" && !dash ? 2.5 : 1.4,
        "stroke-dasharray": dash,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      }),
    ),
  );
  svg.append(
    svgEl("line", {
      id: "inspect-line",
      x1: x(years),
      x2: x(years),
      y1: 30,
      y2: 240,
      stroke: "#6daa8b",
      "stroke-width": 1,
      "stroke-dasharray": "3 4",
    }),
    svgEl("circle", {
      id: "inspect-dot",
      cx: x(years),
      cy: y(points[years].value),
      r: 4,
      fill: "#67e8bc",
      stroke: "#123528",
      "stroke-width": 3,
    }),
  );
  svg.setAttribute(
    "aria-label",
    `Illustration at ${number("rate")}% annual return: ${rm(points[0].value)} initially to ${rm(currentProjection.value)} after ${years} years. Contributed ${rm(currentProjection.contributed)}. Minus 5% stress value ${rm(stressProjection.value)}.`,
  );
}
function inspectYear(i) {
  const p = currentProjection.points[i];
  if (!p) return;
  const { x, y } = chartCoordinates();
  $("inspect-value").textContent =
    `${2026 + i} · Value ${rm(p.value)} · Paid ${rm(p.contributed)}`;
  $("inspect-line")?.setAttribute("x1", x(i));
  $("inspect-line")?.setAttribute("x2", x(i));
  $("inspect-dot")?.setAttribute("cx", x(i));
  $("inspect-dot")?.setAttribute("cy", y(p.value));
}
$("growth-chart").addEventListener("pointermove", (e) => {
  const svg = $("growth-chart"),
    rect = svg.getBoundingClientRect(),
    relative = ((e.clientX - rect.left) / rect.width) * 750,
    i = Math.round(
      finite((relative - 55) / 665, 0, 1) *
        (currentProjection.points.length - 1),
    );
  $("inspect-year").value = i;
  inspectYear(i);
  const p = currentProjection.points[i],
    tip = $("chart-tooltip");
  tip.hidden = false;
  tip.textContent = `${2026 + i} · ${rm(p.value)}`;
  tip.style.left = `${Math.min(Math.max(0, e.clientX - rect.left - 50), Math.max(0, rect.width - 150))}px`;
  tip.style.top = "15px";
});
$("growth-chart").addEventListener(
  "pointerleave",
  () => ($("chart-tooltip").hidden = true),
);
$("inspect-year").addEventListener("input", () =>
  inspectYear(Number($("inspect-year").value)),
);
function renderFunds(filter = "all") {
  const funds = shortlist(filter);
  $("fund-cards").innerHTML =
    funds
      .map(
        (f) =>
          `<article class="fund-card"><div class="fund-card-top"><span class="fund-code">${f.id}</span><span class="pill green">✓ Shariah</span></div><h3>${f.name}</h3><div class="fund-category"><span class="legend-dot" style="background:${f.color}"></span>${f.category} · ${f.type === "prs" ? "PRS" : "Unit trust"}</div><div class="fund-returns"><div><span>10Y ANNUALISED</span><strong>${f.r10.toFixed(2)}<small>%</small></strong></div><div><span>5Y ANNUALISED</span><strong>${f.r5.toFixed(2)}<small>%</small></strong></div></div><div class="fund-risk">◈ ${f.risk} risk · Capital at risk</div><div class="fund-actions"><button class="button secondary" data-sim-fund="${f.id}">Explore scenario ↗</button><button class="text-link" data-detail="${f.id}">Fund details →</button></div></article>`,
      )
      .join("") || "<p>No funds meet the strict rules in this category.</p>";
  if (filter === "epf")
    $("fund-cards").insertAdjacentHTML(
      "beforeend",
      '<div class="panel" style="padding:24px"><span class="eyebrow">KWSP ROUTE</span><h3>One eligible match.</h3><p>PAIF is marked EPF-qualified by Public Mutual as checked on 3 November 2026. Reconfirm fund approval and your available amount in i-Akaun before a transfer.</p></div>',
    );
}
function fundDetail(id) {
  const f = FUNDS.find((f) => f.id === id);
  if (!f?.code) return;
  $("fund-detail").innerHTML =
    `<span class="pill green">✓ Shariah · ${f.id}</span><h2>${f.name}</h2><p>${f.category} · Risk level 5 / very high · ${f.type === "prs" ? "PRS route" : f.epf ? "Cash or KWSP route" : "Cash route; not EPF-qualified"}</p><div class="fund-detail-metrics">${[
      ["3Y", f.r3],
      ["5Y", f.r5],
      ["10Y", f.r10],
    ]
      .map(
        ([label, value]) =>
          `<div><span>${label} annualised</span><strong>${pct(value)}</strong></div>`,
      )
      .join(
        "",
      )}</div><p>Performance is transcribed from the owner-supplied UTC Connect snapshot dated 30 October 2026. It does not show annual gains in every year, and is not a forecast.</p><p>${f.type === "prs" ? "PHS sales charge: up to 3% of NAV/unit. RM100 initial/additional minimum. PPA account fees and withdrawal restrictions apply. General early withdrawals are limited to sub-account B and normally incur 8% tax; exceptions apply." : "PHS sales charge: up to 5% of NAV/unit. RM1,000 initial and RM100 additional minimum. Transaction channels may have different charges. Compare mandates, currency exposure and drawdowns."}</p><p>Current holdings and sector weights have not been loaded. No AI, quantum or technology exposure is inferred from the fund name.</p><a class="button secondary" href="https://www.publicmutual.com.my/Product-Highlight?langcode=E&sc=${f.code}" target="_blank" rel="noopener">Read official product highlights ↗</a><button class="button primary" data-sim-fund="${f.id}">Explore an 8% scenario ↗</button>`;
  $("fund-dialog").showModal();
}
function simulateFund(id) {
  const f = FUNDS.find((f) => f.id === id);
  if (!f) return;
  if ($("fund-dialog").open) $("fund-dialog").close();
  setRoute(
    f.type === "prs" ? "prs" : route === "epf" && f.epf ? "epf" : "cash",
  );
  setNumber("rate", 8);
  updateProjection();
  goTo("#simulator");
  toast(
    `${f.id} route selected. The 8% scenario is an assumption, not its historical return.`,
  );
}
function renderAudit() {
  const passes = shortlist().map((f) => f.id);
  $("audit-table").innerHTML = table(
    ["Fund", "5Y annualised", "10Y annualised", "Screen result"],
    FUNDS.map((f) => [
      `${f.id} · ${f.name}`,
      pct(f.r5),
      pct(f.r10),
      passes.includes(f.id)
        ? '<span class="pass">Pass · Shariah & both >8%</span>'
        : `<span class="fail">${f.r5 == null || f.r10 == null ? "Missing long-term history" : f.r5 <= 8 || f.r10 <= 8 ? "5Y and/or 10Y does not exceed 8%" : "Shariah status not verified"}</span>`,
    ]),
  );
}
function renderAllocationControls() {
  $("allocation-controls").innerHTML = shortlist()
    .map(
      (f) =>
        `<div class="allocation-row" data-allocation-row="${f.id}"><button data-allocation-select="${f.id}" aria-label="Inspect ${f.id} allocation"><i class="legend-dot" style="background:${f.color}"></i>${f.id}<span id="weight-${f.id}"></span></button><input id="allocation-${f.id}" data-allocation-input="${f.id}" type="number" min="0" max="10000000" step="500" value="${allocations[f.id]}" aria-label="${f.id} allocation amount in MYR"></div>`,
    )
    .join("");
  renderAllocation();
}
function renderAllocation() {
  const funds = shortlist(),
    total = Object.values(allocations).reduce((a, b) => a + b, 0),
    svg = $("allocation-chart"),
    circ = 2 * Math.PI * 100;
  svg.replaceChildren(
    svgEl("circle", {
      cx: 130,
      cy: 130,
      r: 100,
      fill: "none",
      stroke: "#263b45",
      "stroke-width": 24,
    }),
  );
  let offset = 0;
  funds.forEach((f) => {
    const weight = total ? allocations[f.id] / total : 0;
    $("weight-" + f.id).textContent = (weight * 100).toFixed(1) + "%";
    document
      .querySelector(`[data-allocation-row="${f.id}"]`)
      .classList.toggle("selected", allocationSelected === f.id);
    if (weight > 0) {
      const segment = svgEl("circle", {
        cx: 130,
        cy: 130,
        r: 100,
        fill: "none",
        stroke: f.color,
        "stroke-width": allocationSelected === f.id ? 30 : 24,
        "stroke-dasharray": `${Math.max(0, circ * weight - 3)} ${circ - circ * weight + 3}`,
        "stroke-dashoffset": -offset,
        "data-allocation-select": f.id,
        tabindex: 0,
        role: "button",
        "aria-label": `${f.id}: ${rm(allocations[f.id])}, ${(weight * 100).toFixed(1)}%`,
      });
      segment.style.cursor = "pointer";
      svg.append(segment);
    }
    offset += circ * weight;
  });
  $("allocation-total").textContent = rm(
    allocationSelected ? allocations[allocationSelected] : total,
  );
  document.querySelector(".donut-center>span").textContent =
    allocationSelected || "YOUR ALLOCATION";
  document.querySelector(".donut-center>small").textContent = total
    ? allocationSelected
      ? "Selected fund"
      : "Illustrative amount"
    : "Add amounts to begin";
  svg.setAttribute(
    "aria-label",
    `Illustrative allocation total ${rm(total)}. ${funds.map((f) => `${f.id} ${rm(allocations[f.id])}`).join(", ")}`,
  );
}
function selectAllocation(id) {
  allocationSelected = allocationSelected === id ? null : id;
  renderAllocation();
}
function download(name, text, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function planText() {
  const s = inputState(),
    t = calculateTax();
  return `N WEALTH STUDIO — DISCUSSION PLAN\nCreated ${new Date().toLocaleDateString("en-MY", { timeZone: "Asia/Kuala_Lumpur" })}\nPolicy basis: 2026. Performance snapshot: 30 October 2026.\n\nGoal: ${goal}\nRisk preference: ${risk} (self-selected, not assessed)\nRoute: ${route}\nStarting amount: ${rm(s.initial)}\nMonthly contribution: ${rm(s.monthly)}\nHorizon: ${s.years} years\nAssumed annual return: ${s.rate}%\nSales charge on NAV: ${s.fee}%\nIllustrative ending value: ${rm(currentProjection.value)}\nTotal contributed: ${rm(currentProjection.contributed)}\nStress illustration at -5%: ${rm(stressProjection.value)}\nKWSP estimated eligibility: ${epfResult.supported ? rm(epfResult.amount) : "Outside calculator scope"}\nPRS claimable relief: ${rm(t.relief)}\nPRS estimated tax saving before rebates: ${rm(t.saving)}\n\nThe selected route does not imply suitability. Returns are hypothetical, after recurring fund expenses; account fees, inflation, taxes and withdrawals excluded. Contributions at month-end. Sales charges applied to every contribution. Tax savings are separate from investment returns. No investment is executed.\n\nDiscuss loss tolerance, emergency reserves, fees, liquidity and overlapping holdings with your adviser.\nSources:\nhttps://www.kwsp.gov.my/en/member/savings/i-invest\nhttps://www.ppa.my/joining-prs/prs-tax-relief/\nhttps://www.hasil.gov.my/en/individu/kadar-cukai/\n`;
}
function renderWizard() {
  $$(".wizard-progress i").forEach((e, i) =>
    e.classList.toggle("complete", i <= wizardStep),
  );
  $("wizard-back").hidden = wizardStep === 0;
  $("wizard-next").textContent = wizardStep === 2 ? "Done ✓" : "Continue →";
  if (wizardStep === 0)
    $("wizard-content").innerHTML =
      `<div class="eyebrow">STEP 01 / YOUR PURPOSE</div><h2>What are you building towards?</h2><p>A clear goal makes the next step easier.</p><div class="wizard-options">${[
        [
          "retirement",
          "A more comfortable retirement",
          "Plan for the life you want later.",
        ],
        ["flexibility", "Future flexibility", "Explore investing with cash."],
        ["tax", "Retirement + tax relief", "Understand the PRS route."],
      ]
        .map(
          ([v, t, d]) =>
            `<button data-goal="${v}" class="${goal === v ? "selected" : ""}" aria-pressed="${goal === v}"><span>${goal === v ? "◉" : "○"}</span><div><strong>${t}</strong><small>${d}</small></div></button>`,
        )
        .join("")}</div>`;
  if (wizardStep === 1)
    $("wizard-content").innerHTML =
      `<div class="eyebrow">STEP 02 / YOUR COMFORT ZONE</div><h2>How do you feel about losses?</h2><p>The shortlisted funds carry very high risk. A positive long-term return can still include large falls.</p><div class="wizard-options">${[
        [
          "cautious",
          "I need to protect my capital",
          "Large losses would affect my plans.",
        ],
        [
          "balanced",
          "I can accept some fluctuations",
          "I need help understanding my capacity for loss.",
        ],
        [
          "growth",
          "I can tolerate significant falls",
          "I understand capital is not guaranteed.",
        ],
      ]
        .map(
          ([v, t, d]) =>
            `<button data-risk="${v}" class="${risk === v ? "selected" : ""}" aria-pressed="${risk === v}"><span>${risk === v ? "◉" : "○"}</span><div><strong>${t}</strong><small>${d}</small></div></button>`,
        )
        .join("")}</div>`;
  if (wizardStep === 2) {
    const s = inputState();
    $("wizard-content").innerHTML =
      `<div class="eyebrow">STEP 03 / YOUR DISCUSSION GUIDE</div><h2>A starting point. Yours to shape.</h2><p>Your current calculator settings, brought together.</p>${risk !== "growth" ? '<p class="risk-note">Your preference may not fit these very high risk funds. Review lower-risk choices and your capacity for loss with an adviser before selecting a fund.</p>' : '<p class="risk-note">Accepting volatility does not establish suitability. Consider your financial position, experience and liquidity needs.</p>'}<div class="plan-facts"><div><span>Purpose</span><strong>${{ retirement: "Retirement", flexibility: "Future flexibility", tax: "Retirement + tax" }[goal]}</strong></div><div><span>Illustrated route / horizon</span><strong>${route.toUpperCase()} / ${s.years} years</strong></div><div><span>Starting / monthly</span><strong>${rm(s.initial)} / ${rm(s.monthly)}</strong></div><div><span>Annual return / sales charge</span><strong>${s.rate}% / ${s.fee}%</strong></div><div><span>Illustrative ending value</span><strong>${rm(currentProjection.value)}</strong></div><div><span>−5% stress illustration</span><strong>${rm(stressProjection.value)}</strong></div></div><div class="plan-export-actions"><button class="button secondary" id="save-plan">Save in this browser</button><button class="button secondary" id="export-plan">Download plan</button><button class="text-link" id="print-plan">Print / PDF ↗</button></div>`;
  }
}
function openPlan() {
  wizardStep = 0;
  renderWizard();
  $("plan-dialog").showModal();
}
const savedIds = [
  "initial",
  "monthly",
  "years",
  "rate",
  "fee",
  "age",
  "epf-balance",
  "prs-contribution",
  "tax-income",
  "annuity",
];
function savePlan() {
  try {
    localStorage.setItem(
      "nwealth-plan-v1",
      JSON.stringify({
        version: 1,
        goal,
        risk,
        route,
        member: $("member").checked,
        resident: $("resident").value,
        inputs: Object.fromEntries(savedIds.map((id) => [id, number(id)])),
        allocations,
      }),
    );
    toast("Plan saved in this browser. Use “Clear saved plan” to remove it.");
  } catch {
    toast("Browser storage is unavailable. Download your plan instead.");
  }
}
function restorePlan() {
  try {
    const p = JSON.parse(localStorage.getItem("nwealth-plan-v1"));
    if (p?.version !== 1) return;
    for (const id of savedIds)
      if (Number.isFinite(p.inputs?.[id])) setNumber(id, p.inputs[id]);
    goal = ["retirement", "flexibility", "tax"].includes(p.goal)
      ? p.goal
      : "retirement";
    risk = ["cautious", "balanced", "growth"].includes(p.risk)
      ? p.risk
      : "growth";
    $("member").checked = p.member === true;
    $("resident").value = p.resident === "no" ? "no" : "yes";
    for (const id of Object.keys(allocations))
      if (Number.isFinite(p.allocations?.[id]))
        allocations[id] = finite(p.allocations[id], 0, 10000000);
    calculateEpf();
    const fee = number("fee"),
      monthly = number("monthly");
    setRoute(["cash", "epf", "prs"].includes(p.route) ? p.route : "cash");
    setNumber("fee", fee);
    setNumber("monthly", route === "epf" ? 0 : monthly);
    toast("Your saved plan has been restored on this device.");
  } catch {
    /* Invalid or unavailable local storage leaves safe defaults. */
  }
}
const searchItems = [
  ["Wealth overview", "Your dashboard", "#overview"],
  ["Growth simulator", "Cash, KWSP and PRS projections", "#simulator"],
  ["KWSP eligibility", "Account 1 · Akaun Persaraan", "#calculators"],
  ["PRS tax relief", "Tax saving and contribution calculator", "#prs"],
  ["Fund explorer", "Shariah shortlist and performance", "#funds"],
  ["My allocation", "Portfolio weights and amounts", "#allocation"],
  ["Sources & methodology", "Evidence, fees and limitations", "#sources"],
];
function renderSearch() {
  const q = $("tool-search").value.toLowerCase().trim(),
    matches = searchItems.filter((r) => r.join(" ").toLowerCase().includes(q));
  $("search-results").innerHTML =
    matches
      .map(
        ([name, desc, link]) =>
          `<a href="${link}"><span>${name}<small style="display:block;color:#91a8b3;font-size:10px">${desc}</small></span><span>↗</span></a>`,
      )
      .join("") || "<p>No matching tools. Try “tax”, “funds” or “KWSP”.</p>";
}
function openSearch() {
  renderSearch();
  $("search-dialog").showModal();
  $("tool-search").focus();
}
$("search-open").addEventListener("click", openSearch);
$("tool-search").addEventListener("input", renderSearch);
$("search-results").addEventListener("click", (e) => {
  if (e.target.closest("a")) $("search-dialog").close();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const openDialog = document.querySelector("dialog[open]");
    if (openDialog) {
      e.preventDefault();
      openDialog.close();
      return;
    }
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    if (!$("search-dialog").open) openSearch();
  }
  const target = e.target.closest("[data-allocation-select]");
  if (
    target &&
    target.tagName.toLowerCase() === "circle" &&
    ["Enter", " "].includes(e.key)
  ) {
    e.preventDefault();
    selectAllocation(target.dataset.allocationSelect);
  }
});
document.addEventListener("click", (e) => {
  const b = e.target.closest("button,[data-allocation-select]");
  if (!b) return;
  if (b.hasAttribute("data-start")) openPlan();
  if (b.hasAttribute("data-close")) b.closest("dialog").close();
  if (b.dataset.route) setRoute(b.dataset.route);
  if (b.dataset.years) {
    setNumber("years", Number(b.dataset.years));
    $("inspect-year").value = number("years");
    updateProjection();
  }
  if (b.dataset.filter) {
    $$("[data-filter]").forEach((x) => {
      x.classList.toggle("selected", x === b);
      x.setAttribute("aria-pressed", String(x === b));
    });
    renderFunds(b.dataset.filter);
  }
  if (b.dataset.detail) fundDetail(b.dataset.detail);
  if (b.dataset.simFund) simulateFund(b.dataset.simFund);
  if (b.dataset.allocationSelect) selectAllocation(b.dataset.allocationSelect);
  if (b.dataset.goal) {
    goal = b.dataset.goal;
    renderWizard();
  }
  if (b.dataset.risk) {
    risk = b.dataset.risk;
    renderWizard();
  }
  if (b.id === "save-plan") savePlan();
  if (b.id === "export-plan")
    download("my-wealth-discussion-plan.txt", planText());
  if (b.id === "print-plan") window.print();
});
$("wizard-next").addEventListener("click", () => {
  if (wizardStep === 2) {
    $("plan-dialog").close();
    return;
  }
  wizardStep++;
  renderWizard();
});
$("wizard-back").addEventListener("click", () => {
  wizardStep = Math.max(0, wizardStep - 1);
  renderWizard();
});
$("mode-toggle").addEventListener("click", () => {
  const on = document.body.classList.toggle("exchange");
  $("mode-toggle").setAttribute("aria-checked", String(on));
  toast(
    on
      ? "Exchange mode: denser scenarios and analytics. Data remains a dated snapshot."
      : "Overview mode restored.",
  );
});
for (const id of ["initial", "monthly", "years", "rate", "fee"])
  $(id).addEventListener("input", updateProjection);
for (const id of ["initial", "monthly"])
  $(id + "-range").addEventListener("input", () => {
    setNumber(id, $(id + "-range").value);
    updateProjection();
  });
for (const id of ["age", "epf-balance", "member"])
  $(id).addEventListener("input", calculateEpf);
for (const id of ["prs-contribution", "tax-income", "annuity", "resident"])
  $(id).addEventListener("input", calculateTax);
document.addEventListener("change", (e) => {
  if (e.target.matches("input[type=number]")) {
    const el = e.target;
    if (el.id === "age") return;
    el.value = finite(el.value, Number(el.min) || 0, Number(el.max) || 1e9);
  }
});
$("use-epf").addEventListener("click", () => {
  setRoute("epf");
  setNumber("initial", epfResult.amount);
  updateProjection();
  goTo("#simulator");
  toast("Your eligible KWSP amount is ready to explore.");
});
$("use-prs").addEventListener("click", () => {
  setRoute("prs");
  setNumber("initial", 0);
  setNumber("monthly", number("prs-contribution") / 12);
  updateProjection();
  goTo("#simulator");
  toast("Annual PRS contribution spread over 12 monthly contributions.");
});
$("allocation-controls").addEventListener("input", (e) => {
  if (e.target.dataset.allocationInput) {
    allocations[e.target.dataset.allocationInput] = finite(
      e.target.value,
      0,
      10000000,
    );
    renderAllocation();
  }
});
$("reset-allocation").addEventListener("click", () => {
  Object.assign(allocations, { PIATAF: 10000, "PRS-ISEQF": 3000, PAIF: 7000 });
  allocationSelected = null;
  renderAllocationControls();
});
$("clear-saved").addEventListener("click", () => {
  try {
    localStorage.removeItem("nwealth-plan-v1");
    toast(
      "Saved plan removed. Current on-screen inputs remain until refreshed.",
    );
  } catch {
    toast("Browser storage is unavailable.");
  }
});
$("download-projection").addEventListener("click", () => {
  const s = inputState();
  download(
    "wealth-projection.csv",
    `Hypothetical projection - not a forecast\nPolicy basis,2026\nRoute,${route}\nAnnual return percent,${s.rate}\nSales charge percent on NAV,${s.fee}\nStarting gross MYR,${s.initial}\nMonthly gross MYR,${s.monthly}\nContributions,Month end\nExcluded,PRS account fees / taxes / inflation / withdrawals\nYear,Contributed MYR,Scenario value MYR,Stress minus 5 percent MYR,Sales charges MYR\n` +
      currentProjection.points
        .map(
          (p, i) =>
            `${2026 + i},${p.contributed.toFixed(2)},${p.value.toFixed(2)},${stressProjection.points[i].value.toFixed(2)},${p.fees.toFixed(2)}`,
        )
        .join("\n"),
    "text/csv",
  );
  toast("Projection CSV downloaded with assumptions.");
});
$$("dialog").forEach((d) =>
  d.addEventListener("click", (e) => {
    if (e.target === d) {
      const r = d.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        d.close();
    }
  }),
);
document.querySelector(".hero-art").addEventListener("pointermove", (e) => {
  if (reduced.matches) return;
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty(
    "--ry",
    `${((e.clientX - r.left) / r.width) * 35 - 17}deg`,
  );
  e.currentTarget.style.setProperty(
    "--rx",
    `${12 - ((e.clientY - r.top) / r.height) * 24}deg`,
  );
});
document.querySelector(".hero-art").addEventListener("pointerleave", (e) => {
  e.currentTarget.style.removeProperty("--rx");
  e.currentTarget.style.removeProperty("--ry");
});
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          $$(".nav-link").forEach((a) =>
            a.classList.toggle("active", a.getAttribute("href") === "#" + id),
          );
          entry.target.classList.add("reveal");
        }
      });
    },
    { rootMargin: "-15% 0px -65% 0px", threshold: 0 },
  );
  $$("main section,#prs").forEach((s) => observer.observe(s));
}
calculateEpf();
calculateTax();
restorePlan();
updateProjection();
renderFunds();
renderAudit();
renderAllocationControls();
