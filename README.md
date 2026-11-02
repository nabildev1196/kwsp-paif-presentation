# N Wealth Studio / Masa depan lebih jelas

A simple bilingual investment planning website for Malaysian prospects. Bahasa Melayu is the starting language; the BM / EN toggle translates the navigation, calculators, charts, fund explanations, dialogs and downloads without resetting inputs. Official fund names stay unchanged.

## The three routes

- **KWSP:** calculate 2026 Akaun Persaraan eligibility; PAIF is the growth focus, with PESMACF as a separate defensive investment option. Explain the EPF switching-fee exemption without presenting PESMACF as guaranteed cash.
- **Cash / Tunai:** PIATAF, PAIF and PCIF, selected by the owner. PCIF's 5Y return of 5.95% is disclosed; the earlier strict 8% screening rule is superseded.
- **PRS:** the Shariah default option chooses Growth below 45, Moderate at 45–54 and Conservative from 55. The first-contribution birthday exception is supported. PRS-ISEQF is an optional non-default choice.

Each route includes a plain-language explanation, fund details and an interactive 3/5/10-year growth example. The PRS route includes progressive tax savings and the shared annuity limit. Detailed assumptions and scenario comparisons are expandable. A three-step discussion guide can be saved locally, downloaded or printed. No investment or account application is executed.

## Local development

Node.js 20+; no package installation or build step required.

```sh
npm run dev
npm test
npm run check
```

Open the printed local URL. Serve over HTTP rather than opening the HTML file directly.

## Static hosting

Serve the repository root. The app uses index.html, styles.css, planner.mjs, page.mjs, finance.mjs and SOURCES.md. Relative paths and .nojekyll support GitHub Pages. No API key or backend is needed. server.mjs is only a localhost preview server. The original presentation is retained at presentation-archive.html.

## Evidence

Read [SOURCES.md](SOURCES.md) for the dated source records and calculation assumptions. Returns are from owner-supplied UTC Connect screenshots dated 30 October 2026, not live or market-wide rankings. Official classifications and rules were checked 3 November 2026. [VALIDATION.md](VALIDATION.md) records the checks performed.

The app does not invent live prices, holdings or sector exposures. The fixed-rate projection does not simulate automatic future PRS allocation changes. Review policy and fund evidence before a later-year release.
