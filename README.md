# N Wealth Studio

A responsive, dependency-free retirement planning dashboard for Malaysian prospects. Premium dark interface, animated CSS glass orbit, keyboard-accessible charts and a compact Exchange Mode.

## Run locally

Requires Node.js 20+. No package installation or build step.

```sh
npm run dev
```

Open the printed local URL. ES modules require HTTP serving; do not double-click `index.html`.

```sh
npm test
npm run check
```

## Included

- 2026 KWSP Akaun Persaraan eligibility (ages 18–54), membership check and RM1,000 minimum.
- PRS relief with shared deferred-annuity cap and progressive resident tax savings.
- Cash / KWSP / PRS scenarios with lump sum, monthly contributions, editable return/charges, 3/5/10-year shortcuts, stress comparison, year inspection and CSV export.
- Strict Shariah screen: both 5Y and 10Y annualised returns above 8%, maximum three; transparent exclusions and route filters.
- User-defined allocation donut, source details, global Ctrl/Cmd+K tool search, planning wizard, local save/restore, text download and print/PDF.
- Mobile layout, native dialog focus management and reduced-motion support.

## Hosting

Serve the repository root as a static site (including GitHub Pages). `index.html`, `styles.css`, `app.mjs`, `finance.mjs` and `SOURCES.md` are sufficient. All paths are relative and support a repository subpath. No secret, API key or server is required. The optional `server.mjs` is for localhost development only. The previous presentation remains available as `presentation-archive.html`.

## Evidence and boundaries

Read [SOURCES.md](SOURCES.md) before changing financial content. Returns are the owner's **30 October 2026 screenshot snapshot**, covering **18 complete rows**, not a market-wide live ranking. Provider Shariah/EPF classifications were checked 3 November 2026. The qualifying shortlist is PIATAF, PRS-ISEQF and PAIF; only PAIF is EPF-qualified among these.

No fabricated tickers, holdings or sector exposures are shown. Exchange Mode is a denser scenario view. Onboarding creates a discussion guide, not a regulated account or a suitability assessment. Investment execution, account integration, identity collection and real-time NAV feeds are outside this static app.

Future releases must review the dated policy table, tax rules and fund evidence together. Projections are illustrations and capital can be lost.
