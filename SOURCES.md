# Sources, evidence and calculation notes

Policy review: **3 November 2026**, Malaysia. Fund returns: **30 October 2026**.

This is an independent educational tool. No trades or applications are submitted. Fund values are a static snapshot, not a live data subscription. Source classifications and performance figures must be refreshed deliberately before a future publication; do not relabel old data with a new date.

## KWSP calculator

[KWSP i-Invest official scheme page](https://www.kwsp.gov.my/en/member/savings/i-invest) provides the 2026 age-specific Basic Savings table used in `finance.mjs` and the examples used by the tests.

For qualifying members aged 18–54: `maximum = 30% × max(0, Akaun Persaraan balance − age-specific Basic Savings)`. If the result is below RM1,000, the displayed eligible amount is zero. Rounded down to cents for the estimate. The table is for **2026 only**, not the final 2030 RIA target. Existing transactions and available balances must be checked in i-Akaun.

Membership: Malaysian citizens, permanent residents, or non-Malaysians who joined EPF before 1 August 1998. This app asks the user to confirm membership criteria and does not verify identity. Age 55+ has different Akaun 55 / Akaun Emas investment withdrawal rules and is deliberately referred to KWSP rather than applying the under-55 formula. No automated recurring EPF transfers are simulated. Amounts invested outside KWSP cease earning KWSP dividends while invested outside.

## PRS tax relief

- [PPA: PRS tax relief](https://www.ppa.my/joining-prs/prs-tax-relief/) confirms gross PRS contributions qualify, with relief up to RM3,000 annually through YA2030.
- [Ministry of Finance: Budget 2025 tax measures, Appendix 4](https://belanjawan.mof.gov.my/pdf/belanjawan2025/ucapan/tax-measure.pdf) documents the shared PRS/deferred-annuity limit and extension to YA2026–2030.
- [Public Mutual 2026 PRS guide](https://www.publicmutual.com.my/PM.Web.Portal.Admin/media/Downloads/2026/PRS/PRS%20Guide/PRS%20Guide%20%28E%29.pdf) explicitly labels the displayed resident rates YA2026. It confirms the deferred-annuity shared limit.
- [HASiL rate bands](https://www.hasil.gov.my/en/individu/kadar-cukai/) lists the progressive bands used, currently under the YA2023–2025 heading. The Public Mutual 2026 guide corroborates those bands for YA2026; this app does not apply them to 2027 or later tax calculations.
- [HASiL individual income tax introduction](https://www.hasil.gov.my/en/individu/pengenalan-cukai-pendapatan-individu/) describes resident relief eligibility and non-resident treatment.

Claimable PRS relief = min(gross annual PRS contribution, max(0, RM3,000 − deferred annuity relief used)). Non-residents receive zero relief in this tool. Enter chargeable income **after other reliefs, including annuity relief, but before PRS relief**. Tax saving = progressive tax before PRS relief minus progressive tax after PRS relief. This handles crossing rate bands. It excludes rebates, zakat, special regimes, joint assessment effects and other personal adjustments; it is not a tax return or guaranteed refund. Savings are not added to investment returns. Future tax-rate changes are not projected.

## Fund screen and provenance

Returns were manually transcribed from the two UTC Connect performance screenshots supplied by the repository owner. Both screenshots state **30/10/2026**. They show 5-year and 10-year **annualised** returns. The unit trust screenshot is cropped: only nine complete unit trust rows are used; the partially visible e-Islamic Sustainable Millennial row is excluded. Nine PRS rows are complete. This dataset is **18 observed rows, not the complete Public Mutual fund universe**. The app does not claim a market-wide top three.

Qualify only where verified Shariah status is true, both 5Y and 10Y figures exist, and **each is strictly greater than 8%**. Rank by 10Y return, then 5Y, then identifier; show at most three. Apply route filters without weakening eligibility. An annualised result above 8% does not mean every year returned above 8%.

| Fund      | 3Y annualised | 5Y annualised | 10Y annualised | Route           |
| --------- | ------------: | ------------: | -------------: | --------------- |
| PIATAF    |        34.09% |        14.91% |         13.19% | Cash unit trust |
| PRS-ISEQF |        25.40% |        10.51% |         10.27% | PRS             |
| PAIF      |        24.67% |         8.09% |          8.98% | Cash / EPF      |

PCIF fails at 5Y 5.95%, even though 10Y is 8.15%. PRS-IGRF fails at 5Y 7.94%, even though 10Y is 9.25%. All excluded values and reasons are inspectable in the app. Excluded non-Islamic rows are not relied on for selection; absence of verified Shariah status fails the rule.

Shariah classification and EPF qualification were checked against the provider's [official Fund Explorer endpoint](https://www.publicmutual.com.my/FundExplorerList/GetFundExplorerData?date=undefined), retrieved 3 November 2026. Codes: PAIF 27, PIATAF 39, PCIF 43, PRS-ISEQF 130. All four are Islamic; among these only PAIF is EPF-qualified. Reconfirm current approval in i-Akaun. The [provider's older EPF list](https://www.publicmutual.com.my/pmb/EPF-Investment-Scheme-List) is explicitly dated April 2024 and is not used as the sole evidence for 2026 eligibility.

Official Product Highlights Sheets independently establish the shortlisted Shariah mandates, fees and risks:

- [PIATAF PHS, 30 January 2026](https://www.publicmutual.com.my/Product-Highlight?langcode=E&sc=39): mixed asset, Shariah; sales charge up to 5% of NAV/unit; management 1.65% p.a.; trustee 0.06% p.a. with limits. RM1,000 initial / RM100 additional minimum.
- [PAIF PHS, 30 January 2026](https://www.publicmutual.com.my/Product-Highlight?langcode=E&sc=27): Shariah equity; same cited sales charge, management and trustee rates and minimum investments.
- [PRS-ISEQF PHS, 30 June 2026](https://www.publicmutual.com.my/Product-Highlight?langcode=E&sc=130): Shariah equity; sales charge up to **3%**, not the screenshot simulator's entered 5%; management 1.60%, trustee 0.04%, PPA administration 0.04% p.a. RM100 initial/additional. PPA opening RM10 and annual RM8 (exceptions apply). General early withdrawals from sub-account B normally incur 8% tax; exceptions apply. Retirement withdrawal from age 55.
- [PCIF PHS, 27 February 2026](https://www.publicmutual.com.my/Product-Highlight?langcode=E&sc=43): certified Shariah but fails the screenshot performance rule.

PHS performance tables use different reporting periods and may label average annual returns differently; their return figures are not mixed into the supplied 30 October screen. A mixed PRS/unit-trust ranking is a numeric historical filter, not a suitability recommendation. The app does not invent sector tags, holdings, real-time prices or NAV history. Allocation charts show user-entered hypothetical fund amounts, not current asset weights inside the funds.

## Growth simulator

For gross initial sum L, gross end-of-month addition C, years Y, annual effective assumed return r and NAV-based sales charge s:

`monthlyRate = (1 + r)^(1/12) − 1`

`value(0) = L / (1 + s)`

`value(m) = value(m−1) × (1 + monthlyRate) + C / (1 + s)`

The zero-rate path is handled without division by zero. Contributions occur at month-end. The displayed gain/loss is ending value minus **gross** contributions, so it includes the impact of sales charges. A 5% charge on NAV means RM10,000 gross purchases RM10,000/1.05, not RM9,500, of units.

Cash defaults to 5%, PRS to 3%, and the KWSP route to an editable 0.5% online i-Invest illustration. These are assumptions, not transaction quotes; channel fees may differ. The chosen annual return is assumed after recurring fund-level expenses. Historical NAV returns already reflect fund-level expenses, so those charges must not be deducted twice. PRS account fees, personal taxes, tax savings, inflation and withdrawals are excluded. Distributions are assumed reinvested. Stress at −5% p.a. is one scenario, not a worst case or probabilistic confidence interval.

The app shows 3-, 5- and 10-year shortcuts and a 1–30-year horizon. Fixed calendar labels start in 2026, the policy snapshot year; this version requires a policy/data review for a later-year release. No projection is a historical backtest.

## Privacy and maintenance

Inputs are kept in memory until the visitor explicitly saves the plan in browser local storage. No server submission, account creation or analytics tracking is implemented. Google Fonts serves typography; it receives ordinary font requests, not calculator inputs. External source links leave the app. Saved plans can be cleared; downloads are generated locally. No identifying information is requested.

Before changing snapshot dates: update the full relevant Basic Savings table, tax-year evidence, fund returns/classifications and source labels together. Run the financial tests and inspect browser behaviour. Never fill a shortlist with ineligible funds to reach three.
