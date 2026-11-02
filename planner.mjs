import {
  FUNDS,
  finite,
  eligible,
  project,
  prsTax,
  prsDefault,
  routeFunds,
} from "./finance.mjs";
import { page } from "./page.mjs";
const $ = (id) => document.getElementById(id),
  $$ = (q) => [...document.querySelectorAll(q)];
const storageKey = "nwealth-bilingual-plan-v2";
const initialState = () => ({
  lang: "ms",
  route: "epf",
  age: 35,
  balance: 120000,
  member: true,
  prsContribution: 3000,
  taxIncome: 80000,
  annuity: 0,
  resident: "yes",
  nearBirthday: false,
  years: 10,
  risk: "unsure",
  plans: {
    epf: { fund: "PAIF", initial: 10000, monthly: 0, rate: 8, fee: 0.5 },
    cash: { fund: "PIATAF", initial: 10000, monthly: 500, rate: 8, fee: 5 },
    prs: { fund: "PRS-IGRF", initial: 0, monthly: 250, rate: 6, fee: 3 },
  },
});
let s = initialState(),
  projection,
  stress,
  step = 0,
  observedSections;
const t = (en, ms) => (s.lang === "ms" ? ms : en);
const money = (n) =>
  "RM" + Math.round(n).toLocaleString(s.lang === "ms" ? "ms-MY" : "en-MY");
const percent = (n) => (n == null ? "—" : n.toFixed(2) + "%");
const current = () => s.plans[s.route];
const findFund = (id) => FUNDS.find((f) => f.id === id);
const rates = { "PRS-IGRF": 6, "PRS-IMDF": 4, "PRS-ICVF": 3 };
const epf = () => eligible(s.age, s.balance, s.member);
const tax = () =>
  prsTax({
    contribution: s.prsContribution,
    annuity: s.annuity,
    income: s.taxIncome,
    resident: s.resident === "yes",
  });
const icons = {
  dashboard: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  chart: "M3 3v18h18 M6 16l5-6 4 3 6-8",
  wallet: "M20 7V4H4a2 2 0 0 0 0 4h17v12H4a2 2 0 0 1-2-2V6 M21 12h-6v4h6",
  receipt:
    "M5 3l2 2 2-2 3 2 3-2 2 2 2-2v18l-2-2-2 2-3-2-3 2-2-2-2 2z M8 9h8 M8 13h5",
  layers: "M12 3L2 8l10 5 10-5-10-5z M2 12l10 5 10-5 M2 16l10 5 10-5",
  shield: "M12 2L3 6v6c0 5 9 10 9 10s9-5 9-10V6z M8 12l3 3 5-6",
  search: "M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  download: "M12 3v12 M7 10l5 5 5-5 M3 16v5h18v-5",
};
function text(id, value) {
  if ($(id)) $(id).textContent = value;
}
function toast(message) {
  text("toast", message);
  $("toast").hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    if ($("toast")) $("toast").hidden = true;
  }, 4200);
}
function go(id) {
  $(id)?.scrollIntoView({
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
  });
}
function table(headers, rows) {
  return `<table><thead><tr>${headers.map((h) => `<th scope="col">${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}
function syncPrs() {
  const id = prsDefault(s.age, s.nearBirthday);
  if (id && s.plans.prs.fund !== id) {
    s.plans.prs.fund = id;
    s.plans.prs.rate = rates[id];
    if (s.route === "prs" && $("rate")) $("rate").value = s.plans.prs.rate;
  }
}
function render() {
  syncPrs();
  document.documentElement.lang = s.lang;
  document.title = t(
    "N Wealth Studio — Your future, made clearer",
    "N Wealth Studio — Masa depan lebih jelas",
  );
  $("app").innerHTML = page({ s, t, money, epf: epf(), prs: tax() });
  $$("[data-icon]").forEach(
    (e) =>
      (e.innerHTML = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[e.dataset.icon] || icons.chart}"/></svg>`),
  );
  renderFunds();
  updateAll();
  setupChartEvents();
  setupMotion();
}
function updateAll() {
  const e = epf();
  text(
    "basic",
    e.supported
      ? money(e.basic)
      : t("Different rules apply", "Peraturan berbeza digunakan"),
  );
  text("excess", e.supported ? money(e.raw) : "—");
  text(
    "epf-result",
    e.supported ? money(e.amount) : t("Check KWSP", "Semak KWSP"),
  );
  text(
    "epf-note",
    !e.supported
      ? t(
          "This calculation is for ages 18–54 only. Age 55+ uses different withdrawal rules.",
          "Pengiraan ini untuk umur 18–54 sahaja. Peraturan pengeluaran berbeza bagi umur 55 ke atas.",
        )
      : !s.member
        ? t(
            "The membership requirements must be met before an investment is eligible.",
            "Syarat keahlian mesti dipenuhi sebelum pelaburan layak dibuat.",
          )
        : e.amount === 0
          ? t(
              "The eligible amount must reach RM1,000. Your current inputs do not meet this minimum.",
              "Jumlah yang layak mesti sekurang-kurangnya RM1,000. Maklumat semasa belum memenuhi minimum ini.",
            )
          : t(
              "Minimum RM1,000. Confirm the final available amount in i-Akaun before investing.",
              "Minimum RM1,000. Sahkan jumlah akhir yang tersedia dalam i-Akaun sebelum melabur.",
            ),
  );
  if ($("use-epf")) $("use-epf").disabled = !e.amount;
  const p = tax();
  text("prs-relief", money(p.relief));
  text("prs-remaining", money(s.resident === "yes" ? p.remaining : 0));
  text("tax-saving", money(p.saving));
  if ($("use-prs")) $("use-prs").disabled = !prsDefault(s.age, s.nearBirthday);
  if ($("birthday-row"))
    $("birthday-row").hidden = ![44, 54].includes(Number(s.age));
  if ($("prs-choice")) {
    const f = findFund(prsDefault(s.age, s.nearBirthday));
    $("prs-choice").innerHTML = f
      ? `<div class="default-choice"><span class="eyebrow">${t("DEFAULT CHOICE FOR THIS AGE", "PILIHAN ASAL BAGI UMUR INI")}</span><strong>${f.id}</strong><span>${f.name}</span><small>${t("Applies when you select the Shariah default option.", "Terpakai apabila anda memilih pilihan asal patuh Syariah.")}</small></div>`
      : `<p class="risk-note">${t("Enter a whole-number age from 18 to 100.", "Masukkan umur penuh antara 18 hingga 100.")}</p>`;
  }
  if (s.route === "epf" && current().initial > e.amount) {
    current().initial = e.amount;
    if ($("initial")) $("initial").value = e.amount;
  }
  updateProjection();
}
function chooseRoute(route) {
  if (!["epf", "cash", "prs"].includes(route)) return;
  s.route = route;
  render();
  go("path-content");
}
function fundPurpose(f) {
  return f.id === "PAIF"
    ? t(
        "Shares across Asia · for long-term growth",
        "Saham merentas Asia · pertumbuhan jangka panjang",
      )
    : f.id === "PIATAF"
      ? t(
          "A flexible mix of investments across Asia",
          "Campuran pelaburan fleksibel merentas Asia",
        )
      : f.id === "PCIF"
        ? t(
            "China-focused shares · concentrated exposure",
            "Saham tertumpu di China · pendedahan tertumpu",
          )
        : f.id === "PESMACF"
          ? t(
              "A more defensive mix · still exposed to losses",
              "Campuran lebih defensif · masih boleh rugi",
            )
          : f.id === "PRS-IGRF"
            ? t(
                "Default option below age 45",
                "Pilihan asal bagi umur bawah 45",
              )
            : f.id === "PRS-IMDF"
              ? t(
                  "Default option for ages 45–54",
                  "Pilihan asal bagi umur 45–54",
                )
              : f.id === "PRS-ICVF"
                ? t("Default option from age 55", "Pilihan asal mulai umur 55")
                : t(
                    "An optional high-risk PRS choice",
                    "Pilihan PRS berisiko tinggi",
                  );
}
function riskLabel(f) {
  const level = f.riskLevel || 5;
  return t(
    ["", "Low", "Lower", "Moderate", "High", "Very high"][level],
    ["", "Rendah", "Lebih rendah", "Sederhana", "Tinggi", "Sangat tinggi"][
      level
    ],
  );
}
function renderFunds() {
  const funds = routeFunds(s.route, s.age, s.nearBirthday);
  $("fund-cards").dataset.count = funds.length;
  $("fund-cards").innerHTML = funds.length
    ? funds
        .map(
          (f) =>
            `<article class="fund-card ${current().fund === f.id ? "chosen-fund" : ""}"><div class="fund-card-top"><span class="fund-code">${f.id}</span><span class="pill green">✓ ${t("Shariah", "Patuh Syariah")}</span></div><h3>${f.name}</h3><p class="fund-purpose">${fundPurpose(f)}</p><div class="fund-returns"><div><span>${t("10-YEAR · PER YEAR", "10 TAHUN · SETAHUN")}</span><strong>${f.r10.toFixed(2)}<small>%</small></strong></div><div><span>${t("5-YEAR · PER YEAR", "5 TAHUN · SETAHUN")}</span><strong>${f.r5.toFixed(2)}<small>%</small></strong></div></div><div class="fund-risk">◈ ${t("Risk", "Risiko")}: ${riskLabel(f)} · ${t("Value can fall", "Nilai boleh turun")}</div><div class="fund-actions"><button class="button secondary" data-sim-fund="${f.id}">${t("Try an example", "Lihat contoh")} ↗</button><button class="text-link" data-detail="${f.id}">${t("Details", "Maklumat")} →</button></div>${s.route === "epf" ? `<p class="micro-note">${f.id === "PAIF" ? t("Main growth choice for the KWSP route.", "Pilihan pertumbuhan utama untuk KWSP.") : t("Defensive option, not a cash guarantee or short-term deposit.", "Pilihan defensif, bukan jaminan tunai atau deposit jangka pendek.")}</p>` : ""}</article>`,
        )
        .join("")
    : `<p>${t("Enter a valid age to see the default PRS fund.", "Masukkan umur yang sah untuk melihat dana PRS pilihan asal.")}</p>`;
}
function fundDetail(id) {
  const f = findFund(id);
  if (!f) return;
  const isPrs = f.type === "prs";
  $("fund-detail").innerHTML =
    `<span class="pill green">✓ ${t("Shariah", "Patuh Syariah")} · ${f.id}</span><h2>${f.name}</h2><p>${fundPurpose(f)}</p><div class="fund-detail-metrics">${[
      [3, f.r3],
      [5, f.r5],
      [10, f.r10],
    ]
      .map(
        ([years, val]) =>
          `<div><span>${years} ${t("years · per year", "tahun · setahun")}</span><strong>${percent(val)}</strong></div>`,
      )
      .join(
        "",
      )}</div><p>${t("Past returns from the owner’s 30 October 2026 snapshot. These are equivalent yearly rates over the whole period, not a promise for every year.", "Prestasi lalu daripada rekod pemilik bertarikh 30 Oktober 2026. Ini kadar tahunan setara bagi keseluruhan tempoh, bukan janji pulangan setiap tahun.")}</p><p>${f.id === "PESMACF" ? t("PESMACF holds mainly sukuk (60–75%) and may invest up to 35% in Shariah shares. It aims for at least a three-year horizon. It is not a money-market fund, bank deposit or capital-guaranteed product.", "PESMACF memegang terutamanya sukuk (60–75%) dan boleh melabur sehingga 35% dalam saham patuh Syariah. Ia menyasarkan tempoh sekurang-kurangnya tiga tahun. Ia bukan dana pasaran wang, deposit bank atau produk jaminan modal.") : f.id === "PCIF" ? t("PCIF focuses on China. Its 5-year rate of 5.95% is below the earlier 8% screen; it is included as an owner-selected cash choice.", "PCIF tertumpu kepada China. Kadar 5 tahunnya 5.95% berada di bawah saringan 8% terdahulu; ia disertakan sebagai pilihan dana tunai pemilik.") : isPrs ? t("PRS is designed for retirement. General early withdrawals are limited to sub-account B and normally incur 8% tax, with exceptions. Full retirement withdrawal is available from age 55.", "PRS direka untuk persaraan. Pengeluaran awal umum terhad kepada subakaun B dan lazimnya dikenakan cukai 8%, dengan pengecualian tertentu. Pengeluaran persaraan penuh tersedia mulai umur 55.") : t("This fund invests in shares and can fall sharply. Consider its markets, fees and overlap with your other investments.", "Dana ini melabur dalam saham dan boleh jatuh dengan ketara. Pertimbangkan pasaran, caj dan pertindihan dengan pelaburan anda yang lain.")}</p><p>${isPrs ? t("The product sheet allows up to 3% sales charge. Separate fund and PRS account fees apply. The age-based choice only applies to the default option; PRS-ISEQF is a non-default choice.", "Dokumen produk membenarkan caj jualan sehingga 3%. Fi dana dan akaun PRS turut berkenaan. Pilihan mengikut umur hanya terpakai kepada pilihan asal; PRS-ISEQF ialah pilihan bukan asal.") : t("The product sheet allows up to 5% sales charge on the value of units. Actual channel charges can differ. EPF switching is fee-free under the published policy; cash switching is not always free.", "Dokumen produk membenarkan caj jualan sehingga 5% atas nilai unit. Caj sebenar boleh berbeza mengikut saluran. Pertukaran KWSP dikecualikan caj mengikut dasar diterbitkan; pertukaran tunai tidak semestinya percuma.")}</p><p>${t("Risk", "Risiko")}: ${riskLabel(f)} (${f.riskLevel || 5}/5). ${t("Capital is not guaranteed.", "Modal tidak dijamin.")}</p><a class="button secondary" href="https://www.publicmutual.com.my/Product-Highlight?langcode=E&sc=${f.code}" target="_blank" rel="noopener">${t("Read official product sheet (EN)", "Baca dokumen produk rasmi (EN)")} ↗</a>`;
  $("fund-dialog").showModal();
}
function simulateFund(id) {
  const allowed = routeFunds(s.route, s.age, s.nearBirthday).some(
    (f) => f.id === id,
  );
  if (!allowed) return;
  current().fund = id;
  current().rate = id === "PESMACF" ? 3 : rates[id] || 8;
  if ($("rate")) $("rate").value = current().rate;
  renderFunds();
  updateProjection();
  go("simulator");
  toast(
    t(
      "This uses an assumed return, not the fund’s past return.",
      "Contoh ini menggunakan andaian pulangan, bukan prestasi lalu dana.",
    ),
  );
}
function updateProjection() {
  const p = current(),
    input = {
      ...p,
      years: s.years,
      monthly: s.route === "epf" ? 0 : p.monthly,
    };
  projection = project(input);
  stress = project({ ...input, rate: -5 });
  text(
    "scenario-fund",
    s.route === "prs" && !prsDefault(s.age, s.nearBirthday)
      ? t("Enter your age", "Masukkan umur anda")
      : p.fund,
  );
  text("years-label", `${s.years} ${t("years", "tahun")}`);
  text("projection-years", `${s.years} ${t("YEARS", "TAHUN")}`);
  text("projected-value", money(projection.value));
  text(
    "projected-gain",
    `${t("Assumed return", "Andaian pulangan")}: ${p.rate}% ${t("per year", "setahun")} · ${t("Not guaranteed", "Tidak dijamin")}`,
  );
  text("total-contributed", money(projection.contributed));
  text(
    "total-gain",
    (projection.gain < 0 ? "−" : "+") + money(Math.abs(projection.gain)),
  );
  $("total-gain").classList.toggle("negative", projection.gain < 0);
  text("total-fees", money(projection.fees));
  $("initial-range").value = Math.min(p.initial, 100000);
  $("monthly-range").value = Math.min(p.monthly, 5000);
  $$("[data-years]").forEach((b) => {
    const yes = Number(b.dataset.years) === s.years;
    b.classList.toggle("selected", yes);
    b.setAttribute("aria-pressed", String(yes));
  });
  text(
    "route-note",
    s.route === "epf"
      ? `${t("Your estimated limit", "Anggaran had anda")}: ${money(epf().amount)}. ${t("No automatic monthly KWSP transfer is assumed. The fee shown is an illustration; confirm your channel’s actual charges.", "Tiada pindahan KWSP bulanan automatik diandaikan. Caj yang ditunjukkan ialah contoh; sahkan caj sebenar saluran anda.")}`
      : s.route === "prs"
        ? t(
            "Monthly payments are added at month-end. Tax savings and future age-based fund changes are not added to this chart.",
            "Bayaran bulanan ditambah pada akhir bulan. Penjimatan cukai dan perubahan dana mengikut umur tidak dimasukkan dalam carta ini.",
          )
        : t(
            "Monthly payments are added at month-end. These are example numbers, not a prediction of this fund.",
            "Bayaran bulanan ditambah pada akhir bulan. Angka ini ialah contoh, bukan ramalan dana ini.",
          ),
  );
  $("inspect-year").max = s.years;
  if (Number($("inspect-year").value) > s.years)
    $("inspect-year").value = s.years;
  renderChart();
  inspectYear(Number($("inspect-year").value));
  $("scenario-table").innerHTML = table(
    [
      t("Assumed yearly return", "Andaian pulangan setahun"),
      ...["3", "5", "10"].map((n) => n + " " + t("years", "tahun")),
    ],
    [-5, 0, 3, 5, 8, 12].map((rate) => [
      rate + "%",
      ...[3, 5, 10].map((years) =>
        money(project({ ...input, years, rate }).value),
      ),
    ]),
  );
}
const NS = "http://www.w3.org/2000/svg";
function svgEl(tag, attrs = {}, txt) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (txt != null) e.textContent = txt;
  return e;
}
function coords() {
  const max =
    Math.max(
      1,
      ...projection.points.map((p) => Math.max(p.value, p.contributed)),
      ...stress.points.map((p) => p.value),
    ) * 1.12;
  return {
    x: (i) => 55 + (i / (projection.points.length - 1)) * 665,
    y: (v) => 240 - (v / max) * 210,
    max,
  };
}
function renderChart() {
  const svg = $("growth-chart");
  svg.replaceChildren();
  const { x, y, max } = coords(),
    points = projection.points,
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
    const v = (max * i) / 4;
    svg.append(
      svgEl("line", {
        x1: 55,
        x2: 720,
        y1: y(v),
        y2: y(v),
        stroke: "#2a3e48",
        "stroke-width": ".7",
        "stroke-dasharray": "3 5",
      }),
      svgEl(
        "text",
        { x: 43, y: y(v) + 3, "text-anchor": "end", fill: "#8ba4b0" },
        v >= 1000 ? `${Math.round(v / 1000)}k` : String(Math.round(v)),
      ),
    );
  }
  svg.append(svgEl("text", { x: 16, y: 15, fill: "#8ba4b0" }, "RM"));
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
        { x: x(i), y: 265, "text-anchor": "middle", fill: "#8ba4b0" },
        t("Yr ", "Thn ") + i,
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
      d: path(points, "value") + " L720 240 L55 240 Z",
      fill: "url(#growth-fill)",
    }),
  );
  [
    [points, "contributed", "#8ca7b4", "5 5"],
    [stress.points, "value", "#bba589", "3 5"],
    [points, "value", "#67e8bc", ""],
  ].forEach(([list, key, color, dash]) =>
    svg.append(
      svgEl("path", {
        d: path(list, key),
        fill: "none",
        stroke: color,
        "stroke-width": dash ? 1.4 : 2.5,
        "stroke-dasharray": dash,
        "stroke-linecap": "round",
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
    `${t("Example after", "Contoh selepas")} ${years} ${t("years", "tahun")}: ${money(projection.value)}. ${t("Total put in", "Jumlah dimasukkan")}: ${money(projection.contributed)}. ${t("At minus 5 percent", "Pada negatif 5 peratus")}: ${money(stress.value)}.`,
  );
}
function inspectYear(year) {
  const p = projection.points[year];
  if (!p) return;
  const { x, y } = coords();
  text("inspect-value", `${t("Year", "Tahun")} ${year} · ${money(p.value)}`);
  $("inspect-line").setAttribute("x1", x(year));
  $("inspect-line").setAttribute("x2", x(year));
  $("inspect-dot").setAttribute("cx", x(year));
  $("inspect-dot").setAttribute("cy", y(p.value));
}
function setupChartEvents() {
  const svg = $("growth-chart");
  svg.addEventListener("pointermove", (e) => {
    const r = svg.getBoundingClientRect(),
      i = Math.round(
        finite((((e.clientX - r.left) / r.width) * 750 - 55) / 665, 0, 1) *
          s.years,
      );
    $("inspect-year").value = i;
    inspectYear(i);
    const tip = $("chart-tooltip");
    tip.hidden = false;
    tip.textContent = `${t("Year", "Tahun")} ${i} · ${money(projection.points[i].value)}`;
    tip.style.left = `${Math.min(Math.max(0, e.clientX - r.left - 40), Math.max(0, r.width - 145))}px`;
    tip.style.top = "10px";
  });
  svg.addEventListener(
    "pointerleave",
    () => ($("chart-tooltip").hidden = true),
  );
}
function setupMotion() {
  const art = document.querySelector(".hero-art");
  art.addEventListener("pointermove", (e) => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = art.getBoundingClientRect();
    art.style.setProperty(
      "--ry",
      `${((e.clientX - r.left) / r.width) * 35 - 17}deg`,
    );
    art.style.setProperty(
      "--rx",
      `${12 - ((e.clientY - r.top) / r.height) * 24}deg`,
    );
  });
  art.addEventListener("pointerleave", () => {
    art.style.removeProperty("--ry");
    art.style.removeProperty("--rx");
  });
  if ("IntersectionObserver" in window) {
    observedSections?.disconnect();
    observedSections = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting)
            $$(".nav-link").forEach((a) =>
              a.classList.toggle("active", a.hash === "#" + e.target.id),
            );
        }),
      { rootMargin: "-15% 0px -65% 0px" },
    );
    $$("main>section").forEach((e) => observedSections.observe(e));
  }
}
function download(name, content, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([content], { type })),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function planLines() {
  const p = current(),
    tr = tax();
  return [
    t("MY SIMPLE WEALTH PLAN", "PELAN KEWANGAN RINGKAS SAYA"),
    `${t("Choice", "Pilihan")}: ${s.route === "cash" ? t("Cash", "Tunai") : s.route.toUpperCase()} · ${p.fund}`,
    `${t("Age", "Umur")}: ${s.age}`,
    `${t("Starting amount", "Jumlah permulaan")}: ${money(p.initial)}`,
    `${t("Monthly addition", "Tambahan bulanan")}: ${money(s.route === "epf" ? 0 : p.monthly)}`,
    `${t("Time", "Tempoh")}: ${s.years} ${t("years", "tahun")}`,
    `${t("Assumed yearly return", "Andaian pulangan setahun")}: ${p.rate}%`,
    `${t("Sales charge on unit value", "Caj jualan atas nilai unit")}: ${p.fee}%`,
    `${t("Example ending value", "Contoh nilai akhir")}: ${money(projection.value)}`,
    `${t("Total money put in", "Jumlah wang dimasukkan")}: ${money(projection.contributed)}`,
    `${t("Loss example at minus 5% yearly", "Contoh kerugian pada negatif 5% setahun")}: ${money(stress.value)}`,
    ...(s.route === "epf"
      ? [
          `${t("Estimated KWSP limit", "Anggaran had KWSP")}: ${epf().supported ? money(epf().amount) : t("Check KWSP", "Semak KWSP")}`,
        ]
      : []),
    ...(s.route === "prs"
      ? [
          `${t("PRS default choice", "Pilihan asal PRS")}: ${prsDefault(s.age, s.nearBirthday) || "—"}`,
          `${t("PRS relief", "Pelepasan PRS")}: ${money(tr.relief)}`,
          `${t("Tax saving before rebates", "Penjimatan cukai sebelum rebat")}: ${money(tr.saving)}`,
        ]
      : []),
    t("Risk preference: ", "Pilihan risiko: ") +
      t(
        {
          unsure: "Not sure yet",
          low: "I need to protect my savings",
          high: "I understand and can accept large losses",
        }[s.risk],
        {
          unsure: "Belum pasti",
          low: "Saya perlu melindungi simpanan",
          high: "Saya faham dan boleh menerima kerugian besar",
        }[s.risk],
      ),
    "",
    t(
      "Example only, not a forecast or a suitability assessment. Value can fall. Inflation, tax, PRS account fees, withdrawals and future age-based changes are excluded. Tax savings are separate. Confirm fees, liquidity and eligibility before investing.",
      "Contoh sahaja, bukan ramalan atau penilaian kesesuaian. Nilai boleh turun. Inflasi, cukai, fi akaun PRS, pengeluaran dan perubahan dana mengikut umur tidak dikira. Penjimatan cukai adalah berasingan. Sahkan caj, akses wang dan kelayakan sebelum melabur.",
    ),
    t(
      "Policy basis: 2026. Past returns: 30 October 2026.",
      "Asas dasar: 2026. Prestasi lalu: 30 Oktober 2026.",
    ),
    "https://www.kwsp.gov.my/en/member/savings/i-invest",
    "https://www.publicmutual.com.my/pmb/investor-guide-switching",
    "https://www.publicmutual.com.my/pmb/private-retirement-scheme-prs",
    "https://www.ppa.my/joining-prs/prs-tax-relief/",
  ];
}
function renderWizard() {
  $$(".wizard-progress i").forEach((e, i) =>
    e.classList.toggle("complete", i <= step),
  );
  $("wizard-back").hidden = step === 0;
  text(
    "wizard-next",
    step === 2 ? t("Done ✓", "Selesai ✓") : t("Next →", "Seterusnya →"),
  );
  if (step === 0)
    $("wizard-content").innerHTML =
      `<span class="eyebrow">01 / ${t("YOUR CHOICE", "PILIHAN ANDA")}</span><h2>${t("Start with what you know.", "Mulakan dengan apa yang anda tahu.")}</h2><p>${t("Your current choice and numbers are ready. You can change them in the calculator before saving.", "Pilihan dan angka semasa anda sudah tersedia. Anda boleh mengubahnya dalam kalkulator sebelum menyimpan.")}</p><div class="plan-facts"><div><span>${t("Investment route", "Cara melabur")}</span><strong>${s.route === "cash" ? t("Cash", "Tunai") : s.route.toUpperCase()}</strong></div><div><span>${t("Example fund", "Dana contoh")}</span><strong>${current().fund}</strong></div><div><span>${t("Starting amount", "Jumlah permulaan")}</span><strong>${money(current().initial)}</strong></div><div><span>${t("Time horizon", "Tempoh")}</span><strong>${s.years} ${t("years", "tahun")}</strong></div></div>`;
  if (step === 1)
    $("wizard-content").innerHTML =
      `<span class="eyebrow">02 / ${t("YOUR COMFORT", "KESELESAAN ANDA")}</span><h2>${t("How would a loss affect you?", "Bagaimana kerugian menjejaskan anda?")}</h2><p>${t("There is no right answer. This helps guide a conversation with your adviser.", "Tiada jawapan yang betul atau salah. Ini membantu perbincangan bersama perunding.")}</p><div class="wizard-options">${[
        [
          "low",
          "I need to protect my savings",
          "Saya perlu melindungi simpanan",
        ],
        ["unsure", "I am not sure yet", "Saya belum pasti"],
        [
          "high",
          "I understand and can accept large losses",
          "Saya faham dan boleh menerima kerugian besar",
        ],
      ]
        .map(
          ([id, en, ms]) =>
            `<button data-risk="${id}" class="${s.risk === id ? "selected" : ""}" aria-pressed="${s.risk === id}">${s.risk === id ? "◉" : "○"} ${t(en, ms)}</button>`,
        )
        .join("")}</div>`;
  if (step === 2)
    $("wizard-content").innerHTML =
      `<span class="eyebrow">03 / ${t("TAKE YOUR NEXT STEP", "LANGKAH ANDA SETERUSNYA")}</span><h2>${t("Your discussion starts here.", "Perbincangan anda bermula di sini.")}</h2><p class="risk-note">${s.risk === "low" ? t("No fund shown guarantees your capital. These choices may not fit your need to protect savings; discuss alternatives before investing.", "Tiada dana yang dipaparkan menjamin modal. Pilihan ini mungkin tidak sesuai dengan keperluan melindungi simpanan; bincangkan pilihan lain sebelum melabur.") : t("Your preference alone does not establish suitability. Discuss emergency savings, possible losses, fees and when you need the money.", "Pilihan anda sahaja tidak menentukan kesesuaian. Bincangkan simpanan kecemasan, kemungkinan rugi, caj dan bila wang diperlukan.")}</p><div class="plan-facts"><div><span>${t("Example ending value", "Contoh nilai akhir")}</span><strong>${money(projection.value)}</strong></div><div><span>${t("Money put in", "Wang dimasukkan")}</span><strong>${money(projection.contributed)}</strong></div><div><span>${t("Assumed yearly return", "Andaian pulangan setahun")}</span><strong>${current().rate}%</strong></div><div><span>${t("At minus 5% per year", "Pada negatif 5% setahun")}</span><strong>${money(stress.value)}</strong></div></div><div class="plan-export-actions"><button id="save-plan" class="button secondary">${t("Save on this device", "Simpan di peranti ini")}</button><button id="export-plan" class="button secondary">${t("Download plan", "Muat turun pelan")}</button><button id="print-plan" class="text-link">${t("Print / PDF", "Cetak / PDF")} ↗</button></div>`;
}
function openPlan() {
  if (s.route === "prs" && !prsDefault(s.age, s.nearBirthday)) {
    toast(
      t(
        "Enter a whole-number age from 18 to 100 first.",
        "Masukkan umur penuh antara 18 hingga 100 dahulu.",
      ),
    );
    return;
  }
  step = 0;
  renderWizard();
  $("plan-dialog").showModal();
}
function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ ...s, version: 2 }));
    toast(t("Plan saved on this device.", "Pelan disimpan di peranti ini."));
  } catch {
    toast(
      t(
        "Saving is unavailable. Download the plan instead.",
        "Simpanan tidak tersedia. Sila muat turun pelan.",
      ),
    );
  }
}
function restore() {
  try {
    const v = JSON.parse(localStorage.getItem(storageKey));
    if (v?.version === 2) {
      if (["ms", "en"].includes(v.lang)) s.lang = v.lang;
      if (["epf", "cash", "prs"].includes(v.route)) s.route = v.route;
      for (const [k, min, max] of [
        ["age", 18, 100],
        ["balance", 0, 10000000],
        ["prsContribution", 0, 1000000],
        ["taxIncome", 0, 100000000],
        ["annuity", 0, 3000],
        ["years", 1, 30],
      ])
        if (Number.isFinite(v[k])) s[k] = finite(v[k], min, max);
      s.years = Math.round(s.years);
      s.member = v.member === true;
      s.nearBirthday = v.nearBirthday === true;
      s.resident = v.resident === "no" ? "no" : "yes";
      s.risk = ["unsure", "low", "high"].includes(v.risk) ? v.risk : "unsure";
      for (const r of ["epf", "cash", "prs"]) {
        const saved = v.plans?.[r];
        if (!saved) continue;
        for (const [k, min, max] of [
          ["initial", 0, 10000000],
          ["monthly", 0, 100000],
          ["rate", -50, 30],
          ["fee", 0, 10],
        ])
          if (Number.isFinite(saved[k]))
            s.plans[r][k] = finite(saved[k], min, max);
        if (
          routeFunds(r, s.age, s.nearBirthday).some((f) => f.id === saved.fund)
        )
          s.plans[r].fund = saved.fund;
      }
      s.plans.epf.monthly = 0;
    }
    const lang = localStorage.getItem("nwealth-language");
    if (["ms", "en"].includes(lang)) s.lang = lang;
  } catch {
    /* Safe defaults when storage is unavailable or malformed. */
  }
}
function renderSearch() {
  const q = $("tool-search").value.toLowerCase().trim(),
    items = [
      ["overview", "Start here", "Mula di sini", "home mula"],
      [
        "path-content",
        "My KWSP, cash or PRS choice",
        "Pilihan KWSP, tunai atau PRS",
        "tax cukai age umur",
      ],
      ["funds", "Fund choices", "Pilihan dana", "PAIF PESMACF PIATAF PCIF PRS"],
      [
        "simulator",
        "See possible growth",
        "Lihat potensi pertumbuhan",
        "return pulangan chart carta",
      ],
      ["next-step", "My simple plan", "Pelan ringkas saya", "save simpan"],
      [
        "sources",
        "Sources & important notes",
        "Sumber & nota penting",
        "rules peraturan",
      ],
    ].filter((r) => r.join(" ").toLowerCase().includes(q));
  $("search-results").innerHTML =
    items
      .map(([id, en, ms]) => `<a href="#${id}">${t(en, ms)}<span>↗</span></a>`)
      .join("") ||
    `<p>${t("No matching tool. Try “fund” or “tax”.", "Tiada padanan. Cuba “dana” atau “cukai”.")}</p>`;
}
function openSearch() {
  renderSearch();
  $("search-dialog").showModal();
  $("tool-search").focus();
}
document.addEventListener("input", (e) => {
  const el = e.target;
  if (el.id === "tool-search") {
    renderSearch();
    return;
  }
  if (el.id === "inspect-year") {
    inspectYear(Number(el.value));
    return;
  }
  if (el.dataset.input) {
    s[el.dataset.input] = finite(
      el.value,
      Number(el.min) || 0,
      Number(el.max) || 1e9,
    );
    if (el.dataset.input === "age") {
      s.age = Number(el.value);
      if (![44, 54].includes(s.age)) s.nearBirthday = false;
      syncPrs();
      if (s.route === "prs") renderFunds();
    }
    updateAll();
  } else if (el.dataset.sim) {
    current()[el.dataset.sim] = finite(
      el.value,
      Number(el.min) || 0,
      Number(el.max) || 1e9,
    );
    if (s.route === "epf" && el.dataset.sim === "initial") {
      current().initial = Math.min(current().initial, epf().amount);
      el.value = current().initial;
    }
    updateProjection();
  } else if (el.dataset.range) {
    current()[el.dataset.range] = Number(el.value);
    if (s.route === "epf")
      current().initial = Math.min(current().initial, epf().amount);
    $(el.dataset.range).value = current()[el.dataset.range];
    updateProjection();
  }
});
document.addEventListener("change", (e) => {
  const el = e.target;
  if (el.dataset.check) {
    s[el.dataset.check] = el.checked;
    syncPrs();
    if (s.route === "prs") renderFunds();
    updateAll();
  }
  if (el.dataset.select) {
    s[el.dataset.select] = el.value;
    updateAll();
  }
  if (el.type === "number" && el.id !== "age") {
    el.value = finite(el.value, Number(el.min) || 0, Number(el.max) || 1e9);
  }
});
document.addEventListener("click", (e) => {
  const b = e.target.closest("button,a");
  if (!b) return;
  if (b.dataset.lang) {
    const scroll = window.scrollY;
    s.lang = b.dataset.lang;
    try {
      localStorage.setItem("nwealth-language", s.lang);
    } catch {}
    render();
    window.scrollTo(0, scroll);
  }
  if (b.dataset.route) chooseRoute(b.dataset.route);
  if (b.hasAttribute("data-close")) b.closest("dialog").close();
  if (b.hasAttribute("data-plan")) openPlan();
  if (b.dataset.detail) fundDetail(b.dataset.detail);
  if (b.dataset.simFund) simulateFund(b.dataset.simFund);
  if (b.dataset.years) {
    s.years = Number(b.dataset.years);
    $("years").value = s.years;
    $("inspect-year").value = s.years;
    updateProjection();
  }
  if (b.dataset.risk) {
    s.risk = b.dataset.risk;
    renderWizard();
  }
  if (b.id === "use-epf") {
    current().initial = epf().amount;
    $("initial").value = current().initial;
    updateProjection();
    go("simulator");
  }
  if (b.id === "use-prs") {
    current().initial = 0;
    current().monthly = s.prsContribution / 12;
    $("initial").value = 0;
    $("monthly").value = current().monthly;
    updateProjection();
    go("simulator");
  }
  if (b.id === "wizard-next") {
    if (step === 2) $("plan-dialog").close();
    else {
      step++;
      renderWizard();
    }
  }
  if (b.id === "wizard-back") {
    step = Math.max(0, step - 1);
    renderWizard();
  }
  if (b.id === "search-open") openSearch();
  if (b.closest("#search-results")) $("search-dialog").close();
  if (b.id === "save-plan") save();
  if (b.id === "export-plan")
    download(
      s.lang === "ms" ? "pelan-ringkas-saya.txt" : "my-simple-plan.txt",
      planLines().join("\n"),
    );
  if (b.id === "print-plan") window.print();
  if (b.id === "clear-saved") {
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem("nwealth-plan-v1");
      toast(
        t(
          "Saved plan removed. Current inputs stay until you refresh.",
          "Pelan tersimpan dipadam. Maklumat semasa kekal sehingga halaman dimuat semula.",
        ),
      );
    } catch {
      toast(
        t("Device storage is unavailable.", "Simpanan peranti tidak tersedia."),
      );
    }
  }
  if (b.id === "download-projection") {
    const p = current();
    download(
      s.lang === "ms" ? "anggaran-pelaburan.csv" : "investment-example.csv",
      [
        t("Example only - not a forecast", "Contoh sahaja - bukan ramalan"),
        `${t("Fund", "Dana")},${p.fund}`,
        `${t("Yearly return assumption", "Andaian pulangan setahun")},${p.rate}%`,
        `${t("Sales charge", "Caj jualan")},${p.fee}%`,
        `${t("Contributions", "Caruman")},${t("Month-end", "Akhir bulan")}`,
        `${t("Excluded", "Tidak dikira")},${t("Inflation / tax / account fees / age-based changes", "Inflasi / cukai / fi akaun / perubahan mengikut umur")}`,
        t(
          "Year,Money put in MYR,Example value MYR,Minus 5 percent MYR,Sales charges MYR",
          "Tahun,Wang dimasukkan MYR,Nilai contoh MYR,Negatif 5 peratus MYR,Caj jualan MYR",
        ),
        ...projection.points.map(
          (p, i) =>
            `${i},${p.contributed.toFixed(2)},${p.value.toFixed(2)},${stress.points[i].value.toFixed(2)},${p.fees.toFixed(2)}`,
        ),
      ].join("\n"),
      "text/csv",
    );
    toast(
      t(
        "Your example table has been downloaded.",
        "Jadual contoh anda telah dimuat turun.",
      ),
    );
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const d = document.querySelector("dialog[open]");
    if (d) {
      e.preventDefault();
      d.close();
    }
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    if (!$("search-dialog").open) openSearch();
  }
});
restore();
render();
