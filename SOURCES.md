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

## Fund choices and provenance

The current app follows the owner's revised route choices, replacing the earlier strict greater-than-8% screen. It does not claim the chosen funds are the top performers across the whole fund universe. Official fund names are preserved in both interface languages.

- **KWSP:** PAIF is the main growth choice; PESMACF is a separate, more defensive allocation to discuss. Both are EPF-qualified and Shariah-compliant in the provider dataset checked 3 November 2026.
- **Cash:** PIATAF, PAIF, PCIF, in the owner's chosen order. PCIF has 5Y 5.95% and 10Y 8.15%, so it would fail the old requirement that both exceed 8%. That old rule is no longer used.
- **PRS:** the Shariah default option maps age to Islamic Growth, Islamic Moderate or Islamic Conservative. PRS-ISEQF is explained separately as a non-default option, not automatically selected by age.

Returns were transcribed from the owner's UTC Connect screenshots dated **30 October 2026**. The newer EPF screenshot adds PESMACF. These are annualised period returns, not returns achieved in every individual year. No full-universe or live-return claim is made.

| Fund      | 3Y annualised | 5Y annualised | 10Y annualised |
| --------- | ------------: | ------------: | -------------: |
| PIATAF    |        34.09% |        14.91% |         13.19% |
| PAIF      |        24.67% |         8.09% |          8.98% |
| PCIF      |        21.37% |         5.95% |          8.15% |
| PESMACF   |         5.65% |         2.23% |          5.26% |
| PRS-IGRF  |        19.80% |         7.94% |          9.25% |
| PRS-IMDF  |         9.95% |         2.41% |          4.68% |
| PRS-ICVF  |         5.01% |         2.88% |          3.68% |
| PRS-ISEQF |        25.40% |        10.51% |         10.27% |

[Official Fund Explorer dataset](https://www.publicmutual.com.my/FundExplorerList/GetFundExplorerData?date=undefined) supplies classification, product codes, EPF eligibility and provider risk levels. The retained evidence JSON records the checked fields. Provider risk levels are not the same as the screenshot's three-year volatility class: PESMACF has provider risk level 3 even though that screenshot labels recent volatility very low.

Official product sheets: [PAIF code 27](https://www.publicmutual.com.my/Product-Highlight?langcode=E&sc=27), [PIATAF code 39](https://www.publicmutual.com.my/Product-Highlight?langcode=E&sc=39), [PCIF code 43](https://www.publicmutual.com.my/Product-Highlight?langcode=E&sc=43), [PESMACF code 119](https://www.publicmutual.com.my/Product-Highlight?langcode=E&sc=119), [PRS core funds codes 105/106/107](https://www.publicmutual.com.my/Product-Highlight?langcode=E&sc=105), [PRS-ISEQF code 130](https://www.publicmutual.com.my/Product-Highlight?langcode=E&sc=130).

PESMACF's 31 July 2026 PHS describes a conservative mixed-asset fund: 60–75% sukuk, up to 35% Shariah equities, and a medium-to-long horizon of at least three years. It is not a money-market fund, guaranteed deposit or short-term cash substitute. All funds can lose value.

## Switching charges

[Public Mutual's official switching guide](https://www.publicmutual.com.my/pmb/investor-guide-switching) expressly exempts **units under the EPF scheme** from switching charges, both within and after 90 days. PAIF/PESMACF eligibility, minimum amounts, account restrictions and prevailing terms must still be checked. Initial investment sales charges and ongoing expenses are separate from a switching fee.

Cash switches are not universally free merely because both funds belong to Public Mutual. Charges depend on sales-charge history, holding period, channel and membership. The app avoids promising free cash switching. The current prospectus takes precedence where terms conflict. No tactical switching schedule or trade is executed by the app.

## PRS age-based default option

[Public Mutual PRS](https://www.publicmutual.com.my/pmb/private-retirement-scheme-prs) and [official PRS fund-selection rules](https://www.publicmutualonline.com.my/General/PRSFundSelection.html) establish these default groups:

| Age      | Shariah core fund                             | Provider risk level |
| -------- | --------------------------------------------- | ------------------: |
| Below 45 | PRS Islamic Growth (PRS-IGRF, code 105)       |                   4 |
| 45–54    | PRS Islamic Moderate (PRS-IMDF, code 106)     |                   3 |
| 55+      | PRS Islamic Conservative (PRS-ICVF, code 107) |                   2 |

This mapping applies **when the member selects the default option**, not to every PRS investor automatically. A first contribution within one month before turning 45 or 55 is allocated to the next age group; the app exposes a checkbox at age 44/54 for this exception. An invalid or under-18 age produces no default selection.

Unless instructed otherwise, existing units move gradually to the next core fund over five annual tranches, beginning by the end of the next calendar month after reaching the threshold age. The default transition has no switching charge. It is not an instant transfer of all accumulated savings. Non-default investors may select funds regardless of age. PRS-ISEQF is a non-core equity fund and is not the age-based default.

The 30 June 2026 core PHS permits up to **3% sales charge for all three core funds**, including Conservative. Separate fund expenses, PPA administration and account fees apply. General early withdrawals are restricted to sub-account B and normally attract 8% tax, with specified exceptions; full retirement withdrawal is available from 55.

## Growth simulator

For gross initial sum L, gross end-of-month addition C, years Y, annual effective assumed return r and NAV-based sales charge s:

`monthlyRate = (1 + r)^(1/12) − 1`

`value(0) = L / (1 + s)`

`value(m) = value(m−1) × (1 + monthlyRate) + C / (1 + s)`

The zero-rate path is handled without division by zero. Contributions occur at month-end. The displayed gain/loss is ending value minus **gross** contributions, so it includes the impact of sales charges. A 5% charge on NAV means RM10,000 gross purchases RM10,000/1.05, not RM9,500, of units.

Cash defaults to a 5% sales charge, PRS to 3%, and the KWSP route to an editable 0.5% online i-Invest illustration. Annual return assumptions are 8% for the equity examples, 3% for PESMACF, and 6%/4%/3% for Growth/Moderate/Conservative PRS examples. These chosen assumptions are not expected returns or copied historical rates. These are assumptions, not transaction quotes; channel fees may differ. The chosen annual return is assumed after recurring fund-level expenses. Historical NAV returns already reflect fund-level expenses, so those charges must not be deducted twice. PRS account fees, personal taxes, tax savings, inflation and withdrawals are excluded. Distributions are assumed reinvested. Stress at −5% p.a. is one scenario, not a worst case or probabilistic confidence interval.

The app shows 3-, 5- and 10-year shortcuts and a 1–30-year horizon. Chart labels use elapsed years, not future policy dates. This version uses 2026 policy evidence and needs a review for a later-year release. No projection is a historical backtest. The illustration does not model future automatic PRS age transitions.

## Privacy and maintenance

Inputs are kept in memory until the visitor explicitly saves the plan in browser local storage. The selected interface language is remembered separately. No server submission, account creation or analytics tracking is implemented. Google Fonts serves typography; it receives ordinary font requests, not calculator inputs. External source links leave the app. Saved plans can be cleared; downloads are generated locally. No identifying information is requested.

Before changing snapshot dates: update the full relevant Basic Savings table, tax-year evidence, fund returns/classifications and source labels together. Run the financial tests and inspect browser behaviour. Preserve the route-specific selection and avoid restoring the superseded 8% requirement.
