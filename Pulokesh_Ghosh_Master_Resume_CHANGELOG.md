# Pulokesh Ghosh — Master Resume Changelog

## v1 — 2026-11-07
- Initial master resume assembled from the "Resume Consultation Workshop" and "Resume Context Continuation" ChatGPT exports.
- Full STAR bullet bank: o9 Solutions, Publicis Sapient (7 verticals + leadership), Ninjacart, Reliance Retail, Reliance Industries, Tech Mahindra.
- Real contact/education/certification data pulled from the user's original resume (chat Parts 4–5 were unfilled placeholders).
- Validated against the user's own "Living Master Resume" docx (Parts 1–6) — no missing content found; added the Executive Highlights bullet list from Part 1.

## v2 — 2026-11-07
- Corrected employment dates per user-confirmed timeline:
  - Tech Mahindra: Nov 2015 – May 2017 (was Nov 2015 – May 2019)
  - Reliance Industries: Jun 2019 – Oct 2020 (was Jun 2019 – Jan 2020)
  - Reliance Retail: Jan 2020 – Jun 2021 (unchanged)
  - Ninjacart: Jun 2021 – Jan 2022 (unchanged)
  - Publicis Sapient: Jan 2022 – Apr 2025 (unchanged)
  - o9 Solutions: Apr 2025 – Present (was 2025–Present / earlier draft said 2022–Present)
- Corrected education dates:
  - B.Tech, WBUT: 2011–2015 (was "Jun 2015" graduation only)
  - MBA, IIM Kozhikode: 2017–2019 (was "Apr 2019" graduation only)
- Established versioning convention going forward: every master resume edit produces a new `_vN.docx`; prior versions are kept.

Note: Tech Mahindra ends May 2017 and Reliance Industries starts Jun 2019 — confirmed intentional (MBA at IIM Kozhikode, 2017–2019, fills the gap).

## v3 — 2026-11-07
- Restructured the Healthcare & Life Sciences section to be client-wise, matching the format used in every other Publicis Sapient vertical (Retail, Supply Chain, Transportation, Travel, Consumer Products, Financial Services).
- Now 18 named clients, each with its own "Client: X — Product: Y" heading:
  - 7 clients with full 5-bullet detail (Waters Corporation ×2 engagements, Novo Nordisk, Pfizer, UnitedHealth Group, Optum Rx, Vectura Fertin Pharma) — rewritten from the user-supplied bullet bank with selective bolding (only key metrics bolded, consistent with house style).
  - 11 clients with a single consolidated achievement bullet each (Mass General Brigham, National Health Insurer/Medicare GenAI, ASCO, Boehringer Ingelheim, Large U.S. Payer-Provider, Duke Health, Duke Cancer Institute, Global Biotechnology Company, Humana Go365, Humana Post-Discharge, Medtronic) — no more detailed bullets exist in the source chats for these.
- Healthcare & Life Sciences bullet count grew from 18 (one per client) to 46 across the same 18 clients.

## v4 — 2026-11-07
- Enriched Publicis Sapient bullets across every vertical (Retail & eCommerce, Supply Chain, Transportation & Mobility, Travel & Hospitality, Consumer Products, Financial Services) using the real, detailed project data found in `D:\...\PS Case Studies\` (two CV-points spreadsheets: 2024 and 2023).
- Per explicit instruction: **no real client names were added anywhere** — all existing anonymized labels (e.g. "Client: Leading Regional Grocery Retailer") were kept exactly as-is; only the underlying bullet metrics were swapped for richer, more specific figures pulled from the spreadsheets, with client names stripped from the bullet text itself.
- **No new Publicis Sapient clients/projects were added** — several real projects found in the spreadsheets (e.g. additional automotive OEMs, several financial institutions, two more consumer-products brands, an additional airline/airport engagement) did not match any existing anonymized bucket and were deliberately left out per instruction, since adding them would mean introducing new projects.
- Verified post-build: scanned the final .docx text for 40+ known real client names — zero matches.
- Net effect: same 18 existing Publicis Sapient client buckets (across Retail, Supply Chain, Transportation, Travel, Consumer Products, Financial Services), now with far more specific, numbers-heavy bullets (e.g. exact £/\$ figures, store counts, adoption percentages) in place of the previous more generic statements.
