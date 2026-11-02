# Validation record

Checked on 3 November 2026, Malaysia.

- `npm test`: 8 passing test groups covering official KWSP examples, eligibility limits, membership/age exclusions, strict fund-screen thresholds, NAV-based sales charges, an independent annuity calculation, negative/zero returns, PRS caps and progressive tax-band crossings.
- `npm run check`: JavaScript syntax checks pass for the application, financial model and local server.
- `git diff --check`: no whitespace errors.
- Browser: default desktop and 390 × 844 responsive viewport inspected. No page-wide horizontal overflow at the mobile size. Chart labels adjusted for small screens. Browser console reported no errors during the checked flows.
- Browser calculations: age 22 / RM6,000 gives no eligible transfer and disables the transfer button; chargeable income RM71,000 with RM3,000 PRS relief gives RM410 savings before rebates; a 3-year zero-return scenario with RM10,000 initial + RM500/month and 5% NAV charge gives RM26,667 rounded, against RM28,000 gross contributions.
- Browser flows: KWSP transfer populates the simulator and disables automatic monthly transfers. PRS annual RM3,000 populates RM250/month, zero initial amount, 3% sales charge. PRS filter shows one fund and its official fee details. KWSP filter shows PAIF only.
- Browser interaction: Exchange Mode exposes the scenario table; all-zero allocation renders an explicit empty state; cautious risk preference produces an appropriate mismatch note; plan save/restore retains inputs and zero allocations; tool search filters correctly; Escape dismisses the dialog; CSV download contains the scenario inputs, fees and dated values.
- Tests used illustrative values, with an isolated localhost origin for saved-plan QA. No real investment or account application was performed.

This is functional and visual QA, not an independent audit of screenshot returns or an assessment of investor suitability. The fund universe is limited to the supplied complete rows. No live NAV/holdings feed or backend account onboarding is implemented.
