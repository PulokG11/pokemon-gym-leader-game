# Part B. Keyword Prep Notes

> Format for every keyword: a plain-English definition, then a PM lens (how to talk about it as a product leader) and, where useful, an Optum link. Definitions are general industry knowledge unless a source is noted. Where an interviewer is likely to probe, the entry gives a talking point rather than a script.

# B1. Healthcare Domain

## B1.1 Healthcare landscape and business context

> Interview angle: show you understand who pays whom, where friction lives, and why administrative cost is the prize Optum is chasing.

- **US healthcare money flow (payers, providers, PBMs, employers, government)** — Patients get care from providers; payers (insurers, government programmes) reimburse providers; PBMs manage drug benefits; employers and governments fund most coverage.
  - PM lens: nearly every Optum product removes friction at a handoff in this chain (eligibility, authorization, claim, payment, appeal).
  - Optum link: UnitedHealthcare is a payer, Optum Health is a provider enterprise, Optum Rx is a PBM, Optum Insight sells the connective technology. That integration is both the advantage and the scrutiny risk.
- **Payer space** — Health plans: commercial, Medicare Advantage, Medicaid managed care, ACA exchanges. They design benefits, manage networks, adjudicate claims, run utilisation management and manage risk.
  - PM lens: payer users are claims analysts, medical directors, nurses, auditors, provider-relations and compliance staff. Their KPIs are medical care ratio, cost per claim, turnaround time, accuracy.
- **Provider space and payer-provider expectations** — Hospitals, physician groups, clinics. They want fast, predictable payment and minimal administrative burden; payers want accurate coding and appropriate care.
  - PM lens: the tension is the product opportunity. Payment integrity (payer-side) increases provider "abrasion" unless it is accurate and transparent. Strong answer: design for both sides, measure provider friction.
- **Health system; connecting care, data and services** — A health system combines hospitals, clinics, labs and sometimes a plan. Fragmented data across EHRs and systems is the core obstacle.
  - PM lens: talk about longitudinal records, interoperability and a single source of truth.
- **Clinical, administrative and financial processes** — Clinical (diagnosis, care delivery), administrative (scheduling, eligibility, authorization, documentation), financial (coding, billing, collections, payment).
  - PM lens: Optum's AI bets concentrate on administrative and financial processes because they are rules-heavy, high-volume and measurable.
- **Healthcare services / healthcare technology experience** — Experience in the industry is a hard requirement in several JDs (8 to 13+ years).
  - PM lens: prepare a one-minute summary of the regulated workflows you have shipped and the outcomes.
- **Healthcare managed-service platforms and offerings** — Platforms that run operations on a client's behalf (technology plus people plus process).
  - PM lens: managed services blur product and operations. Be ready to discuss when to productise, how to measure service quality (SLAs), and how to avoid custom builds per client.
- **Ancillary Benefits Management (ABM) platform** — Ancillary benefits are coverages outside core medical, such as dental, vision, hearing or similar benefits. ABM platforms manage the administration, data and integrations behind them (JD6 describes it as the orchestration layer for multiple managed-service offerings).
  - PM lens: emphasise multi-client configurability, data flows and integrations. Note the exact scope of Optum's ABM is not detailed publicly.
- **Large, matrixed or regulated organisation** — Many stakeholders, formal governance, compliance gates.
  - PM lens: stories about influencing without authority, steering committees and compliance partnership land well.
- **Consumer healthcare digital products (UnitedHealthcare App, member-facing apps)** — Mobile and web experiences for members: find care, view benefits, ID cards, claims, cost estimates.
  - PM lens: app-store ratings, Voice of the Customer (VoC) and release governance are first-class product inputs (JD1). Know metrics: ratings, downloads, active users, task completion, contact-centre deflection.
- **Pharmacy benefits, care access, health outcomes, health optimisation** — Optum's stated mission language.
  - PM lens: connect your examples to outcomes (access, affordability, quality, experience), not only efficiency.
- **Equitable care and health disparities** — UHG's mission statement references reducing barriers that disproportionately affect underserved groups.
  - PM lens: for AI features, mention bias testing across populations and monitoring for disparate impact.

## B1.2 Revenue Cycle Management (RCM)

> Interview angle: walk the revenue cycle end to end, name where AI and data platforms help, and quote the right metrics.

- **RCM lifecycle** — The process by which a provider earns payment: patient access (scheduling, registration, eligibility, prior authorization) → charge capture and clinical documentation → medical coding → claim creation and scrubbing → submission → payer adjudication → payment posting → denials management and accounts-receivable follow-up → patient billing and collections.
  - PM lens: every step has leakage. Frame products by the leakage they plug (for example, documentation gaps cause under-coding; missing authorization causes denials).
- **RCM operations and key metrics** — Days in accounts receivable (A/R), clean claim rate, first-pass resolution rate, denial rate (initial and final), net collection rate, cost to collect, A/R over 90 days, charge lag, appeal overturn rate.
  - PM lens: choose one or two as the product's north star and show how feature work moves them.
- **RCM data (US healthcare)** — Data from EHR/practice management systems (encounters, charges, orders, notes), clearinghouse and payer files (837 claims, 835 remittances, 277 status), contracts and fee schedules, denial reason codes (CARC/RARC), and patient-financial data.
  - PM lens: RCM data is messy and semantically inconsistent across systems; value comes from standardising it.
- **RCM technology background** — Know the vendor landscape: EHR vendors (Epic, Oracle Health, MEDITECH, athenahealth), RCM companies and platforms (Optum, R1, Waystar, Ensemble, Cotiviti on the payer side, among others), clearinghouses.
  - PM lens: be able to compare build, partner and buy decisions.
- **RCM Common Data Platform (CDP)** — A unified platform that ingests EHR and healthcare data from many sources, standardises and normalises it into a single source of truth to power analytics and AI (JD4).
  - PM lens: talk about ingestion patterns, canonical data model, data quality rules, lineage, access control and consumer use cases (dashboards, AI insights, operations tools). Emphasise the platform roadmap as a sequence of use cases that fund the foundation.
  - **Longitudinal Account Record** — a patient-account view that follows the full financial life of an account across encounters and systems (charges, claims, payments, adjustments, denials, notes).
    - PM lens: key design problems are identity matching, event ordering, source-of-truth rules and auditability.
  - **Ambulatory Insights** — analytics for outpatient and clinic settings, where billing and workflows differ from inpatient (shorter encounters, higher volume, professional fees).
    - PM lens: ambulatory specifics include E/M coding, modifiers, referral and authorization patterns and patient-responsibility collection at the point of service.
  - **AI-Powered RCM Insights** — predictive and generative features: denial prediction, root-cause clustering, worklist prioritisation, next-best action for staff, narrative summaries for executives.
    - PM lens: define the decision each insight supports, the owner, the action, and how you will measure uplift against a control group.
- **EHR and disparate data ingestion; normalise to a single source of truth** — Typical sources: HL7 v2 feeds (ADT, orders, results), FHIR APIs, CCDA documents, flat files, X12 transactions, database replication.
  - PM lens: discuss data contracts with source owners, schema drift handling, reconciliation and "bronze to silver to gold" refinement.
- **RCM data structures and associated applications** — Core entities: patient, encounter, account, charge, claim, remittance line, adjustment, denial, payer contract, fee schedule.
  - PM lens: show you can reason about one-to-many relationships (one account to many claims; one claim to many lines; one denial to many appeals).
- **Data warehouse concepts applied to RCM** — Dimensional models (facts: claim lines, payments; dimensions: payer, provider, date, procedure), slowly changing dimensions, aggregated marts for KPIs.
  - PM lens: you do not need to model it yourself; know the questions to ask and the trade-offs between freshness, cost and flexibility.
- **Reducing administrative burden; improving throughput, performance and financial outcomes** — The business case for RCM technology.
  - PM lens: quantify in hours returned, denials avoided, days saved in A/R, dollars recovered, and be clear on attribution.
- **Health Information Management (HIM)** — The discipline of managing clinical documentation, coding and records. Preferred background for data-platform roles.
  - PM lens: HIM professionals (coders, CDI specialists) are key users; consult them when designing AI-assisted coding.

## B1.3 Payer operations and claims domains

> Interview angle: explain the claim and authorization journey from the payer's chair, including where humans must stay in control.

- **Benefits, eligibility, claims, policy** — Benefits define what is covered and at what cost-share; eligibility confirms a member's active coverage on a date; claims are payment requests; policy refers to medical, reimbursement and coding policies.
  - PM lens: these four are the data backbone for payer agents (benefit, pricing and policy inquiry).
- **Eligibility and enrollment (X12 270/271, 834)** — Real-time eligibility checks use 270/271; enrollment files use 834.
  - PM lens: real-time accuracy and latency matter because downstream claims and authorizations depend on them.
- **Claims lifecycle** — Intake (837 via clearinghouse or portal) → front-end edits → member and provider validation → benefit and policy application → pricing (contract, fee schedule, DRG) → adjudication (pay, pend, deny) → payment and remittance (835) → adjustments, appeals.
  - PM lens: know where payment integrity rules run (pre-pay vs post-pay) and where auto-adjudication rates are measured.
- **Utilization management (UM)** — Reviewing whether care is medically necessary and appropriate: prior authorization, concurrent review (during stay), retrospective review.
  - PM lens: UM sits under regulatory time limits and clinical criteria (such as InterQual and MCG), so automation needs transparency and a clinician in the loop for adverse decisions.
- **Prior authorization** — A payer's pre-approval for a service or drug.
  - PM lens: the three-way problem is provider burden (manual submission), payer review cost, and patient delay. Optum's moves: Digital Auth Complete (provider side), InterQual Auth Accelerator (payer side), PreCheck (pharmacy).
  - Regulatory link: CMS prior authorization rule (CMS-0057-F). Per secondary compliance sources: decision-time requirements (72 hours expedited, 7 calendar days standard) took effect 1 January 2026 for impacted payers; public reporting of prior authorization metrics was due 31 March 2026; the four FHIR APIs are due by 1 January 2027. Re-verify against CMS before quoting.
- **Payer agent use cases: Benefit Inquiry, Pricing Inquiry, Policy Inquiry, Prior Authorization (JD3)** — Candidate AI agents for member, provider or staff questions and tasks.
  - **Benefit Inquiry** — "Is this covered and what will it cost?" Needs plan data, accumulators, benefit rules.
  - **Pricing Inquiry** — "What will the plan pay for this code at this provider?" Needs contracts, fee schedules, pricing logic.
  - **Policy Inquiry** — "What does the medical or reimbursement policy say?" Needs document retrieval with citations and version control.
  - **Prior Authorization** — "Is it needed, what is required, what is the status?" Needs criteria, clinical data and workflow integration.
  - PM lens for all four: define scope, source-of-truth systems, accuracy bar, escalation path, audit trail, and a staged autonomy plan (assist, recommend, act).
- **Medical coding (ICD-10-CM/PCS, CPT, HCPCS, DRG, modifiers)** — Standard code sets that translate diagnoses, procedures and supplies into billable form.
  - PM lens: coding accuracy drives reimbursement and compliance. AI-assisted coding (Optum Integrity One) needs measured accuracy by code family, audit sampling and clear human-review thresholds.
- **Risk adjustment models (HCC, RAF)** — Models (for example CMS-HCC for Medicare Advantage) adjust payments by member health risk using diagnosis codes; documentation completeness affects payment. Audits (such as RADV) check accuracy.
  - PM lens: this is a compliance-sensitive area. Product features must support accurate, supported documentation, not code inflation.
- **Medicaid state-specific payment cycles** — Medicaid is run by states within federal rules; each state has its own fee schedules, payment calendars, eligibility redetermination rules, encounter data requirements and managed care contract terms.
  - PM lens: show you plan for state-level configurability rather than hard-coding. Mention capitation, retroactive eligibility and recoupment timing as example complexities.
- **Clinical data** — Clinical notes, labs, imaging, orders, problem lists.
  - PM lens: clinical data powers medical necessity decisions and quality measures; it needs privacy controls and often natural-language processing.

## B1.4 Payment integrity, audit and recovery

> Interview angle: this is likely closest to the Lead TPM role. Be ready to define yield, abrasion and the pre-pay versus post-pay trade-offs.

- **Payment integrity (PI)** — Ensuring claims are paid correctly: right member, right provider, right code, right price, right time, no duplicates, no fraud, waste or abuse.
  - PM lens: PI is a funnel: identify → validate → act (adjust, deny, recoup) → communicate → learn. Measure at each stage.
- **Pre-pay vs post-pay** — Pre-pay stops errors before payment (claim edits, pended reviews). Post-pay recovers money after payment (audits, overpayment recovery).
  - PM lens: pre-pay is cheaper and less disruptive; post-pay can find more complex issues but adds provider friction and recovery costs. Industry direction: shift left toward real-time and pre-pay.
- **Claim editing and pricing** — Rules that check coding combinations (such as NCCI edits), unit limits, modifiers, duplicate billing and contract pricing.
  - PM lens: rules management is a product in itself: authoring, testing, versioning, impact simulation and rollback.
- **Coding advisor and claim review** — Tools that suggest corrections and queue claims for human clinical or coding review.
  - PM lens: reviewer productivity and decision quality are the metrics; design work queues, evidence display and one-click outcomes.
- **Audit execution, audit effectiveness, audit yield** — Audit execution is running reviews; effectiveness is how well they find true issues; yield is value found (or confirmed overpayments) relative to effort or claims reviewed.
  - PM lens: define yield precisely (savings identified vs savings realised after appeal), track false-positive rate and overturn rate, and tie model or rule changes to yield.
- **Recovery workflows** — Overpayment notification, provider dispute and appeal, offset or refund, reconciliation.
  - PM lens: compliance deadlines, letters and communication templates, status transparency and finance integration are key features.
- **Claims-related workflows** — Intake, triage, review, decision, notification, appeal.
  - PM lens: map the workflow, find handoffs and queues, then choose where automation, assisted decisioning or better data produces the largest cycle-time gain.
- **Throughput and cycle-time reduction** — Operations metrics for volume handled per time and time from intake to outcome.
  - PM lens: link to capacity planning and service-level agreements.
- **Multiple lines of business; multi-client, multi-use-case platforms** — One platform serving commercial, Medicare, Medicaid and different clients with different rules.
  - PM lens: configuration over customisation; tenant-aware rules; a shared core with client-level policy layers.
- **Provider abrasion and dispute rates** — Provider friction caused by audits and denials.
  - PM lens: build in provider-facing transparency, clear evidence, and tight criteria to protect relationships.
- **"CAP" (as named in JD9)** — The JD refers to "CAP capabilities and workflows" without defining it. Ask the recruiter what it stands for and what it covers; do not guess in an interview.

## B1.5 Interoperability and healthcare data standards

> Interview angle: know what each standard is for and how you would roadmap compliance without over-building.

- **HL7 (v2 messages)** — Long-standing message standard used by hospitals for admissions (ADT), orders, results. Pipe-delimited segments.
  - PM lens: still pervasive; plan for interface engines, mapping and error handling.
- **FHIR (Fast Healthcare Interoperability Resources)** — Modern REST/JSON standard for healthcare data resources (Patient, Claim, Coverage, ServiceRequest, and others). Implementation guides (such as US Core and the Da Vinci guides for coverage requirements, documentation templates and prior authorization support) define use-case specifics.
  - PM lens: FHIR is the backbone of the CMS-0057 APIs (Patient Access, Provider Access, Payer-to-Payer, Prior Authorization). Talk about versioning, security (SMART on FHIR / OAuth), and performance.
- **Healthcare interoperability** — The ability of systems to exchange and use data. Related items: the 21st Century Cures Act information blocking rules, USCDI data elements, national exchange frameworks (TEFCA).
  - PM lens: interoperability is table stakes for platforms; differentiation comes from usable, trusted, timely data.
- **X12 EDI transactions (837, 835, 270/271, 276/277, 278)** — HIPAA-mandated electronic transactions for claims, remittance, eligibility, claim status and authorization.
  - PM lens: payers and clearinghouses (including the Change Healthcare network now inside Optum) move enormous X12 volumes; a move to API-first (FHIR) does not eliminate X12 soon.
- **Healthcare data, clinical data, EHR integration** — Integrating with EHRs means dealing with vendor-specific interfaces, app marketplaces, customer-specific configurations and long implementation timelines.
  - PM lens: plan integration effort explicitly; treat connectors as products with owners and SLAs.
- **Data governance for healthcare data** — Ownership, quality rules, lineage, consent, retention, access controls, de-identification.
  - PM lens: specify who can see what, for which purpose, and how it is logged.

## B1.6 Regulation, security and compliance

> Interview angle: show you treat compliance as design input, not a late-stage gate.

- **HIPAA (Privacy Rule, Security Rule, Breach Notification)** — Protects protected health information (PHI); requires safeguards, minimum necessary use, business associate agreements and breach notification.
  - PM lens: build in role-based access, audit logging, encryption, retention and de-identification from the start; involve privacy and security early.
- **Healthcare regulations and organisational policies** — Include CMS rules for Medicare Advantage and Medicaid managed care, state insurance laws, transparency rules, No Surprises Act, and accreditation or quality programmes (for example Star Ratings for Medicare Advantage).
  - PM lens: maintain a regulatory calendar tied to the roadmap.
- **Data security and compliance standards** — Typical frameworks: SOC 2, HITRUST, NIST (Cybersecurity Framework and AI Risk Management Framework), ISO 27001.
  - PM lens: ask which attestation clients require and how it affects release practices.
- **Security, privacy and compliance frameworks** — Threat modelling, data classification, least privilege, secrets management, vendor risk.
  - PM lens: include security and privacy acceptance criteria in stories.
- **Highly regulated enterprise environments** — Change control, validation evidence, audit trails, regulator-facing documentation.
  - PM lens: show how you keep velocity within controls (automated evidence, pre-approved patterns).
- **Regulation of AI in healthcare operations** — Emerging expectations: human review of adverse medical-necessity decisions, transparency about AI use, bias monitoring, record keeping. Several US states have passed or proposed rules on AI in utilisation review; federal guidance is evolving.
  - PM lens: build explainability, override and audit features now; Optum's public stance is that it does not automate denials.
