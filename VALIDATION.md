# Validation record

Checked on 3 November 2026, Malaysia. This record describes the final bilingual route-based app.

- Nine passing financial test groups cover official KWSP examples and boundaries, the revised cash/EPF fund selections, PRS ages 18/44/45/54/55/80, first-contribution birthday exceptions, invalid ages, NAV-based fees, an independently calculated annuity result, zero/negative returns, PRS caps and progressive tax-band crossings.
- JavaScript syntax checks pass for planner.mjs, page.mjs, finance.mjs and server.mjs. Whitespace checks pass.
- Desktop and 390 × 844 mobile layouts inspected. Malay home and PRS screens have no page-wide horizontal overflow; the temporary test viewport was reset.
- Language switch: cash starting amount RM25,000 remains RM25,000 when switching BM to EN; route, selected fund and projection are preserved. Navigation, explanations, chart labels, dialogs and exports use the selected language. Official fund names remain unchanged.
- Cash route shows exactly PIATAF, PAIF, PCIF. KWSP shows PAIF plus a separately explained PESMACF defensive option. The old claim that every choice passes both 8% thresholds is removed.
- PRS browser checks: age 45 selects PRS-IMDF; age 44 with the first-contribution exception also selects PRS-IMDF; age 55 selects PRS-ICVF and hides the exception checkbox. Annual RM3,000 translates to RM250 monthly. The Conservative example uses an explicitly assumed 3% return, not a historical rate.
- Tax browser check: RM71,000 annual taxable income with RM3,000 PRS relief saves RM410 before rebates, correctly crossing a rate band.
- Malay three-step discussion guide tested, including the capital-protection mismatch note. Save/reload preserves age 55, PRS-ICVF, RM250 monthly, language and the RM33,847 rounded example result.
- Existing calculations retain independent coverage for zero-return scenarios, monthly compounding, fee reconciliation, membership requirements and the RM1,000 minimum.
- Browser console reported no application errors in the tested route/language flows. Tests use illustrative values and an isolated localhost origin. No real investment or account application was performed.

This is functional and visual QA, not an independent audit of screenshot returns, a suitability assessment or a prediction. Live NAV/holdings and backend account onboarding are not implemented. The constant-rate simulator does not model the five-year PRS transition.
