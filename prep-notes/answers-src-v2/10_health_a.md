# A1. Healthcare Domain: Answers

## A1.1 Healthcare landscape and business context

### Q1.1.1 [Conceptual] Walk us through how money and information flow between patients, providers, payers, PBMs and employers. Where is the most friction?

Money flows in one loop and information flows in another, and most friction sits where the two have to match. Employers, individuals and governments pay premiums or taxes to payers. Payers reimburse providers for care, usually after a claim is submitted and adjudicated. Patients pay cost-sharing at the point of care or afterward. Pharmacy benefit managers sit beside this loop, negotiating with drug manufacturers and pharmacies and administering drug benefits for employers and plans. Information runs the other way: eligibility and benefits go from payer to provider before care, authorization requests and clinical documentation go from provider to payer, claims and remittances carry the payment, and appeals handle disagreements.

I think of it as a chain of handoffs: verify coverage, authorize, document and code, bill, adjudicate, pay, appeal. The most friction sits in four places. First, prior authorization, because clinical evidence has to move between two organizations under time pressure. Second, coding and documentation, because small gaps change payment. Third, claim denials and rework, because errors are usually found after care is delivered. Fourth, eligibility and benefits accuracy, because everything downstream depends on it. These are also the areas Optum's recent products target: digital prior authorization, Integrity One for coding, and Optum Real for real-time claims exchange.

Why it matters for a product leader: every handoff is a candidate for a product, and the best ones remove a handoff or move an error check earlier in the chain.

### Q1.1.2 [Conceptual] Optum owns payer, provider, pharmacy and technology businesses. What are the product opportunities and the risks of that integration?

I'd use a simple opportunity and risk lens.

- **Opportunities:**
  - Shared data across payer, provider and pharmacy lets you close loops that independent companies cannot, such as checking eligibility and claims rules before care is delivered.
  - Scale for learning: Optum serves around 120 million patients and consumers (company-reported, Q3 2026), which gives data and workflow coverage for training and testing AI.
  - Early adopters inside the group can prove a product before it is sold externally. UnitedHealthcare is the first payer on Optum Real.
- **Risks:**
  - Trust: competing payers and providers may worry about data use and conflicts of interest if they run on Optum technology.
  - Credibility: results reported by a company that owns both sides get discounted, so third-party validation matters.
  - Regulatory and antitrust scrutiny of vertical integration.
  - Concentration risk: the 2024 Change Healthcare incident showed how one failure can ripple across the industry.

My recommendation, if I were the product leader: build the technology products as neutral by design. That means clear data firewalls and contractual limits on data use, independent measurement of outcomes, transparent explanations for any adverse decision, and resilience engineering treated as a core feature. That turns the integration from a liability into a differentiator.

### Q1.1.3 [Experience] Describe a healthcare product you owned. Who were the users, and which outcome did you move?

*Real story: Story 9 (digital healthcare experience platform).*

For a global healthcare organization, I directed a digital transformation of how patients register, book appointments and find care. The users were patients, and also the administrators and operations teams who run those services. Patients hit friction at each step, and administrators couldn't easily see where bottlenecks were, so my task was to define the vision for an enterprise healthcare experience platform and make the journeys simpler. I redesigned the journeys to remove friction from registration, appointment management and digital service interactions, built configurable workflows for personalized patient communications across care channels, and added analytics and dashboards so administrators could measure engagement and find bottlenecks. I worked with clinicians, operations leaders, UX designers and engineers throughout, and set up experimentation and feedback loops so we could keep improving after launch. Patient satisfaction rose 30 percent and successful digital task completion rose 26 percent. To be precise about scope, it was a patient-experience platform, not a claims or clinical system.

### Q1.1.4 [Conceptual] How do payer and provider incentives conflict, and how do you design a product that serves both?

**Clarifying questions I'd ask:** Which workflow (authorization, claim, audit)? Who is the paying customer? Is the product used by one side or shared?

**Assumption:** a claims-related workflow where the payer pays for the product and providers are affected by it.

**Framework: incentive map, then design for the shared outcome.**
- Payers want accurate payment and cost control, so they favor edits, audits and authorization.
- Providers want fast, predictable payment and minimal administrative work, so they experience the same controls as friction.
- The conflict is strongest where an error is found late: the payer recovers money, the provider reworks and may dispute.

**Design principles:** move checks earlier so errors are fixed before care or at submission (the idea behind real-time claim exchange); give both sides the same view of the rule and the evidence, so disputes shrink; make explanations specific and fast; measure provider abrasion alongside savings; and set a rule that a control must show its false-positive rate.

**Recommendation:** make "first-pass correct and explainable" the shared metric. A payer-side product that raises provider dispute rates is not really saving money, because rework and relationships carry cost. I'd measure cost per claim, first-pass accuracy, overturn rate and time to payment together.

### Q1.1.5 [Experience] Tell us about a time you worked in a large, matrixed or regulated organization to ship something. What slowed you down and how did you adapt?

*Real story: Story 5 (pharma GenAI content platform).*

A global pharma company wanted personalized marketing and medical content across channels much faster, but every piece of content goes through medical, legal and regulatory review. My task was to drive the platform to a working MVP without weakening compliance. The biggest slowdown was that review and approval were separate from the creation workflow, so any speed we gained could be lost at the review stage. I adapted by designing the reviewers, approved claims, guardrails and quality metrics into the product, and by running repeated user acceptance testing with those reviewers. I planned a 16-week MVP across eight sprints and three build-and-test cycles, so the review partners saw working software early. End-to-end content creation became about 75 percent faster and cost fell 35 to 45 percent on targeted activities. User testing feedback was 100 percent positive and about 70 percent of generated content was rated useful. The estimated annual savings of about $34 million is an estimate, not an achieved result.

### Q1.1.6 [Conceptual] What is a managed-service platform, and when should a service be productized versus delivered as custom work?

A managed-service platform combines technology, people and process to run an operation on a client's behalf, for example administering a benefit or processing claims. The client buys an outcome and a service level, not software alone.

**Productization test I use:**
1. Repeatability: at least three clients need the same core workflow, and about 70 percent or more of the work is common (a heuristic, not a rule).
2. Variation is configurable: differences can be expressed as settings and rules, not code.
3. Economics: the unit cost falls as volume grows.
4. Measurable service levels: you can define and meet SLAs consistently.
5. Regulatory fit: compliance can be built once and inherited.

If a request fails those, treat it as custom work, price it accordingly and plan how it would later fold into the product. The risk of too much custom work is a roadmap that serves one client at a time.

*Evidence from my work:* in Story 6 I built the first industry-specific planning template, which turned one customer's learning into a starting point for the next and helped cut onboarding time 75 percent. That is the same productization move, in a different domain.

### Q1.1.7 [Technical] What do you know about ancillary benefits (for example dental or vision) and how would you design a platform that administers them for many clients?

**Honest framing:** Optum's exact ABM scope is not public. I'm answering from the general ancillary benefits model: dental, vision, hearing and similar coverages administered for employers or health plans.

**Clarifying questions:** Which benefits and which clients (employers, plans)? Is the platform the system of record for eligibility and claims or does it orchestrate other systems? What integrations are required? What service levels?

**Assumptions:** 5 clients, about 200,000 members each, so about 1 million members; about 2.5 claims per member per year.

**Framework: R-C-A-D-T.**
- *Requirements:* member eligibility, benefit rules per plan, claims intake and adjudication, provider network and fee schedules, payments, reporting, and client-specific configuration.
- *Capacity estimate:* 1 million members × 2.5 = 2.5 million claims a year, about 6,800 a day. Assume peak is 5 times average, about 34,000 a day, or under one claim per second. Eligibility files may be larger but still moderate. *Sanity check:* the scale is small, so the difficulty is configuration and integration, not throughput.
- *APIs and data:* canonical member, plan, benefit, provider, claim and payment models; eligibility and claims APIs; standard file formats for batch partners.
- *Design:* a benefits rules engine with tenant-level configuration and versioning; an integration layer for client and partner systems; an audit trail; reporting.
- *Trade-offs:* a single multi-tenant platform with strong configuration is cheaper to run, while dedicated stacks per client isolate risk but multiply cost.

**Recommendation:** build one multi-tenant platform with configurable benefit rules and a clean integration layer, with templates by benefit type, and invest first in the rules authoring and testing tools because that is where client variation lives.

### Q1.1.8 [Experience] Give an example of a consumer-facing health product decision you made using customer feedback or app-store data.

*Real story: a member wellness and rewards program for a large health insurer (client under NDA), from your attached document.*

For a large US health insurer's member wellness and rewards program, the question was how to redesign the experience without guessing what members wanted. My task was to run discovery fast enough to shape the build. I ran a seven-week program with three co-creation workshops, six working prototypes and three rounds of user testing, so the team could see where members hesitated and what they valued before committing to the full build. We used those findings to simplify the experience and decide what to build first. The platform that launched had twice the launch adoption and 60 percent greater engagement time than the previous experience. On the patient experience platform (Story 9), I used journey analytics and feedback loops in the same way, and patient satisfaction rose 30 percent. I haven't run an app-store review program inside a health app. If asked, I would say so and explain how I'd do it: tag review themes, compare them with usage data, route defects to owners and track rating trends by release.

### Q1.1.9 [Behavioral] Optum's mission references health equity. Tell us about a time you considered fairness or access in a product decision.

*Approach answer with real evidence. You have documented accessibility work on the planning platform UI, not a health equity decision.*

On the enterprise planning platform UI, I led a modernization that included accessibility improvements: simpler navigation patterns, visualization standards and clearer workflows. I made accessibility an explicit acceptance criterion instead of a later polish item, and the redesign improved planner productivity by 30 percent while making the product easier for more users to use. I haven't yet made an equity decision on a health product, so here is how I would approach one at Optum: define which populations could be affected, check outcomes by segment for any AI or rules feature (for example, whether error or denial rates differ by group where it is lawful and appropriate to measure), involve clinicians and community perspectives early, offer non-digital alternatives for people with limited access, and monitor after launch. For AI features I'd add bias testing to the launch criteria.

### Q1.1.10 [Behavioral] Why healthcare, and why Optum, at this point in your career?

*Real story: Story 9 plus public Optum facts.*

Healthcare is where my skills do the most good at the largest scale. When I worked on a digital healthcare platform, patient satisfaction rose 30 percent and task completion rose 26 percent, and I realized the work mattered differently because the users were people trying to get care. Since then I've built platforms and AI where accuracy and trust are non-negotiable: a GenAI assistant that took answers from hours to seconds with retrieval precision above 95 percent, approved by the client's scientists, and a pharma content platform where reviewers sat inside the workflow. Optum is where those skills meet real operations at scale. The company reported that Integrity One went from two clients to fifteen live with twenty-four more implementing, and that AI chart summaries cut chart review time by a third, which tells me AI is going into core workflows. At this point in my career I'm leading a Senior PM and two PMs and working at Associate Director scope, so I'm ready to lead a product team on a platform that matters.

## A1.2 Revenue Cycle Management (RCM)

### Q1.2.1 [Conceptual] Take us through the revenue cycle from scheduling to final payment. Where does the largest leakage occur?

**Walkthrough:** patient access (scheduling, registration, eligibility and benefits check, prior authorization), then care and documentation, then charge capture and medical coding, claim creation and scrubbing (checking for errors before submission), submission to the payer (often through a clearinghouse), payer adjudication, payment posting and remittance, denial management and accounts-receivable follow-up, and finally patient billing and collections.

**Where leakage occurs (issue tree):**
- Front end: wrong or missing eligibility and authorization lead to denials that cannot be fixed later.
- Documentation and coding: missing clinical detail causes under-coding or compliance risk.
- Claim quality: errors caught only after the payer rejects.
- Denials and appeals: work abandoned because follow-up costs more than the claim is worth.
- Patient collections: slow or unclear patient balances.

**My view:** the largest and most preventable leakage is at the front end and in documentation and coding, because errors there propagate to every later step and are cheapest to fix early. Denial work is the most visible cost, but it is largely a symptom.

### Q1.2.2 [Conceptual] Which RCM metrics matter most and why: days in A/R, clean claim rate, denial rate, net collection rate, cost to collect?

I'd choose a north-star plus guardrails, not a single number.

- **Net collection rate** is my north star for financial outcome: of what you could collect, how much did you collect.
- **Clean claim rate or first-pass resolution** is the leading indicator: it shows quality at the source and predicts denials.
- **Denial rate** (initial and final) shows where the process breaks and is the diagnostic.
- **Days in A/R** shows speed of cash, useful but easy to game by write-offs.
- **Cost to collect** is the efficiency guardrail, so automation does not just shift work.

For a product, I'd pick the metric the product can plausibly move: a coding product would track coding accuracy and productivity, an eligibility product would track front-end denials, and a worklist product would track recovered dollars per hour. Then I'd show the link up to net collection rate.

### Q1.2.3 [Technical] How would you design a Common Data Platform that ingests data from many EHRs and produces a single source of truth for RCM?

**Clarifying questions:** Which RCM use cases come first (denial analytics, account history, AI insights)? Which EHRs and how many sites? Latency needs (daily vs near real time)? Who are the consumers? Who owns data quality? PHI and access constraints?

**Assumptions:** 5 EHR instances across a health system, about 3 million encounters a year, about 40 lifecycle events per account (registration, charge, claim, status, payment, adjustment, denial, note).

**Framework: R-C-A-D-T.**
- *Requirements:* ingest, standardize, normalize and unify encounter, charge, claim, remittance and denial data; support analytics and AI; ensure auditability and access control.
- *Capacity estimate:* 3 million accounts × 40 events = 120 million events a year, about 330,000 a day, or 3.8 a second on average. Assume peak is 10 times, about 38 a second. At about 1 KB an event, storage is about 120 GB a year. *Sanity check:* the volume is modest, which means the hard part is semantics and data quality, not scale.
- *APIs and data:* ingestion through HL7 v2 feeds, FHIR APIs, files and X12 transactions; a canonical model (patient, encounter, account, charge, claim, remittance, adjustment, denial, payer contract); a layered store (raw, cleaned and conformed, curated); an identity service for patient and account matching.
- *Design:* connectors per source with data contracts; a validation and quality layer with rules and reject queues; a mapping service for code sets and payer names; lineage and a catalog; role-based access; serving layers for BI and AI.
- *Trade-offs:* one canonical model gives consistency but slows onboarding of new sources; schema-on-read is faster but pushes complexity to consumers. Batch is cheaper; streaming adds freshness where it earns its keep.

**Recommendation:** start with two high-value use cases (for example denial root-cause analytics and a longitudinal account view), build the canonical model and quality layer around them, onboard two EHRs first, and publish quality metrics (completeness, accuracy, timeliness) as product KPIs. Expand by use case so each increment funds the next.

### Q1.2.4 [Technical] What is a longitudinal account record and what makes it hard to build?

It is a single, time-ordered view of an account's financial life across encounters and systems: charges, claims, status changes, payments, adjustments, denials, appeals and notes. It lets a user answer "what happened to this account and why" without logging into five systems.

It is hard for four reasons. First, identity: matching the same patient and account across systems with different identifiers, without merging the wrong people. Second, event ordering: sources record events at different times, so you need event time versus received time and rules for late or corrected data. Third, conflicting sources: the EHR, billing system and clearinghouse may disagree, so you need survivorship rules about which source wins per field. Fourth, auditability: every change must be traceable for compliance and dispute handling. As a product manager, I would define the rules with operations users, publish match-confidence and review queues for uncertain matches, and show data lineage in the UI so users trust it.

### Q1.2.5 [Conceptual] How is ambulatory RCM different from inpatient, and how would that change product requirements?

Inpatient revenue is dominated by a single high-value stay, grouped by DRG, with complex coding and long cycles. Ambulatory revenue is many smaller encounters, billed mostly on professional fees using evaluation and management codes and modifiers, with higher volume and a larger share of patient responsibility collected at or near the visit.

**Product implications:** ambulatory tools need to be fast and light for high-volume clinic staff; they need strong front-end eligibility, copay estimation and point-of-service collection; coding support focused on E/M level and modifiers; referral and authorization tracking; and worklists that prioritize many small accounts by recovery value per minute. Inpatient tools lean toward documentation improvement, DRG validation and complex denial appeals. A common data platform should model both, but dashboards and AI insights should be tuned to each setting's economics.

### Q1.2.6 [Experience] Describe a data-driven insight you delivered that changed an operations team's behavior. How did you prove impact?

*Real story: Story 11 (registration automation) with Story 6 as support.*

For a scientific-instruments company's online store, customer registration was manual and slow: about 24 hours for existing customers and 48 for new ones, with dependencies on Sales, master data and the service desk. My task was to change how that work flowed. I looked at the process baseline and found that the work was mostly identification and mapping that could be automated, so I productized automated account identification, verification and mapping with approval workflows and analytics. Operations teams stopped doing manual lookups for most registrations and handled exceptions through approval workflows. I proved impact against the baseline: existing-customer registration dropped from 24 hours to under a minute and new-customer onboarding from 48 hours to about 30 minutes, across about 12,000 annual registrations. The projected savings of about 20,000 person-days is a projection, not a result.

### Q1.2.7 [Technical] Where can AI help in RCM, and where is it risky? Give two examples of each.

**Framework: AI use-case fit test (task, data, risk, value).**

- **Good fits:**
  1. Coding assistance and clinical documentation gap detection. The task is language-heavy, volume is high, and a coder reviews the result. Optum's Integrity One is built on this idea and was reported to show over 20 percent coding productivity gain in a pilot.
  2. Denial root-cause clustering and worklist prioritization. It turns messy denial data into ranked actions with a measurable recovered-dollars outcome.
- **Risky uses:**
  1. Fully autonomous coding on high-complexity cases or in ways that could over-code. Errors create compliance exposure and audit risk.
  2. Automated adverse decisions or patient-facing collection messaging without review, where errors affect people directly and regulators are watching.

**Controls:** human review thresholds by risk, measured accuracy by code family, audit sampling, logging, and bias checks. My recommendation is to start with assistive features, measure, and promote autonomy only where error rates and error costs justify it.

### Q1.2.8 [Experience] Tell us about a time you reconciled inconsistent definitions of a metric across teams. What did you do?

*Approach answer. You have related evidence on KPI governance but no documented definition dispute.*

The closest evidence I have is the KPI governance I set up in Story 11, where I introduced analytics, SLA tracking and Jira roadmaps for a digital-commerce portfolio, and in the product practice work in Story 15 where I standardized PRDs and success metrics. The approach I follow when definitions conflict is: write down each team's current definition and where the numbers differ, agree the decision each metric supports, pick one owner and one definition, document it in a shared metric dictionary with the formula and data source, backfill history, and publish the dictionary where the dashboards live. For RCM I'd start with "denial" (initial vs final, by reason code, excluding or including adjustments) and "clean claim". If you have an instance, tell it using the same steps: which metric, who disagreed, what you did and what changed.

### Q1.2.9 [Behavioral] Operations leaders say your tool adds clicks. How do you respond and what do you change?

*Real story with approach: the grocery supplier-collaboration platform (attached document) and Story 13.*

On a supplier-collaboration platform for a large grocery retailer, operations users judged the product by whether it removed manual work, so I treated "adds clicks" as the most important feedback I could get. We used process data to see where manual work and exceptions concentrated, prioritized the workflows that removed the most friction, and read usage data after launch to see where to simplify or expand. Over time the platform saved more than 680 hours of work a week across more than 10,000 active users, and ordering savings reached £8.4 million. On the planning platform (Story 13) I ran more than 50 discovery sessions and planner productivity rose 30 percent. My routine when a user says a tool adds clicks: shadow real work, time the task before and after, count clicks and context switches, remove steps that produce no value (pre-fill known data, remove duplicate entry, add shortcuts), set a target such as time per account, and share the results. If a feature can't pay for its clicks in time or dollars, I'd cut it.

### Q1.2.10 [Experience] Describe a multi-year customer deployment plan you created or influenced. How did you sequence waves and manage risk?

*Real story: the grocery supply-chain platform and a B2B commerce program (attached document), with Story 6.*

At Publicis Sapient I helped shape a multi-phase rollout for a supplier-collaboration platform that touched forecasting, ordering, replenishment, ranging, stock and promotions across 19 integrated systems. The challenge was that every function wanted to go first, so my task was to sequence the work so value arrived early without breaking dependencies. I mapped the journeys, constraints and dependencies, built foundational capabilities first, then released the workflows with measurable outcomes, and let adoption data guide the next phase. The platform delivered £8.4 million in ordering savings, more than 680 hours saved each week, 28 percent higher stock availability and 50 percent higher supplier engagement across more than 10,000 users. On a B2B commerce program, delivering nine major features in sixteen weeks built enough client confidence for the engagement to extend into later phases. In Story 6, I cut customer onboarding time 75 percent through workflow redesign and an industry template. My pattern: a design-partner wave first, then similar customers using a template, then variations, with entry and exit criteria, a rollback path and a feedback loop into the roadmap.

## A1.3 Payer operations and claims domains

### Q1.3.1 [Conceptual] Describe the claim lifecycle at a payer from receipt to payment or denial.

A claim arrives from a provider, usually as an electronic 837 through a clearinghouse or portal. The payer runs front-end edits for format and completeness, validates the member's eligibility and the provider's status, applies the member's benefits and medical and reimbursement policies, prices the claim using the provider contract or fee schedule (or a DRG grouping), and checks for duplicates, coding conflicts and potential overpayment. The claim is then adjudicated: paid, pended for manual review, or denied with reason codes. Payment and an 835 remittance go back to the provider, and the member may receive an explanation of benefits. Afterward, adjustments, appeals, coordination of benefits and post-payment audits can change the outcome.

For a product leader, the key points are where payment integrity rules run (before payment is cheaper, after payment recovers more complex errors), what share of claims auto-adjudicate without touch, and how long pends take. Each stage is a candidate for automation or better data.

### Q1.3.2 [Conceptual] What is utilization management and why is prior authorization so contentious?

Utilization management reviews whether care is medically necessary and appropriate. It includes prior authorization before care, concurrent review during a stay, and retrospective review after care. Payers use clinical criteria such as InterQual or MCG to decide.

It's contentious because the costs and benefits land on different parties. Payers see it as a way to avoid unnecessary or low-value care and control cost. Providers see it as administrative burden: staff spend hours each week assembling documentation and chasing decisions. Patients experience delays and sometimes denials of care their clinician recommended. Regulators have responded, for example with the CMS rule setting decision timeframes (72 hours expedited, 7 calendar days standard; verify dates) and API requirements. The product opportunity is to make the process faster and more transparent without weakening clinical oversight, which is why Optum's tools accelerate approvals and keep clinicians reviewing any adverse decision.

### Q1.3.3 [Technical] How would you scope four AI agents for benefit, pricing, policy and prior authorization inquiries, and what are their sources of truth?

**Clarifying questions:** Who are the users (members, providers, internal staff)? What actions are allowed (answer only, or take actions)? Which lines of business and plans? What accuracy and latency are required? What are the audit and escalation requirements?

**Assumptions:** internal staff and provider-facing users first; answers only in phase 1, actions in phase 2; Medicare Advantage and commercial lines in scope.

**Framework: use-case fit test plus autonomy ladder.**

| Agent | Question it answers | Source of truth | Key risk | Autonomy at launch |
|---|---|---|---|---|
| Benefit inquiry | Is it covered, what will it cost? | Plan and benefit configuration, accumulators, eligibility | Wrong plan year or stale accumulators | Answer with cited source |
| Pricing inquiry | What will the plan pay for this code at this provider? | Contracts, fee schedules, pricing engine | Mispricing, contract versioning | Answer from pricing engine, never from the model's memory |
| Policy inquiry | What does the policy say? | Versioned medical and reimbursement policy documents | Outdated or conflicting policy | Retrieval with citations |
| Prior authorization | Is it required, what is needed, what is the status? | Authorization criteria, requirements engine, case system | Wrong requirement, clinical sensitivity | Status and requirements first; submit with human review later |

**Platform design:** shared orchestration, retrieval, tool connectors (read-only first), evaluation harness, guardrails, audit logging and identity. **Recommendation:** launch benefit and policy agents first because the sources are structured or documentary and errors are lower-risk; pricing next with calls to the pricing engine; prior authorization last and with the strictest review. Set accuracy thresholds per agent and widen autonomy only after measured performance.

### Q1.3.4 [Technical] What are eligibility transactions (270/271) and why do accuracy and latency matter downstream?

The 270 is a request asking a payer whether a person is covered and what benefits apply on a given date; the 271 is the response. Providers send them at scheduling and registration.

Accuracy matters because everything downstream depends on it. Wrong coverage leads to claims billed to the wrong payer, denials for ineligible members, incorrect patient estimates and rework. Latency matters because front-desk and scheduling workflows run in seconds; a slow response either blocks staff or makes them skip the check. A reliable real-time eligibility service therefore reduces front-end denials, supports accurate price estimates and keeps registration fast. From a product view, I'd track response time (p95), response completeness, mismatch rate between eligibility and later claim outcomes, and denial rate for eligibility reasons.

### Q1.3.5 [Conceptual] Explain risk adjustment (for example HCC coding) and the compliance risk when building features around it.

In programs such as Medicare Advantage, payments to health plans are adjusted for the expected cost of each member, based on diagnoses captured in claims and medical records, grouped into hierarchical condition categories that produce a risk score. Plans therefore have a financial incentive to capture documented diagnoses, and the government audits for accuracy (for example through RADV audits).

The compliance risk is that features meant to help capture conditions can drift into encouraging unsupported coding. Safe product design: surface potential gaps for clinician review, require documented clinical evidence for any diagnosis, never auto-add codes, log who reviewed what, and monitor for patterns that look like over-coding. I would involve compliance early, test on audit samples, and design incentives that reward accuracy, not volume.

### Q1.3.6 [Technical] What makes Medicaid different from commercial and Medicare, and how do you handle state-specific payment cycles in a product?

Medicaid is jointly funded and run by states within federal rules. Each state sets its own eligibility groups, fee schedules, managed care contracts, payment timing, documentation requirements and reporting formats. Eligibility also changes frequently through redeterminations and can be retroactive. Commercial plans vary by employer, and Medicare follows national rules with some regional variation.

**Product approach:** model state differences as configuration, not code. Use a rules layer with state, program and effective-date dimensions, a calendar service for state payment cycles, versioned fee schedules, and test packs per state. Keep a shared core for claims intake and adjudication logic. Track configuration changes with approvals and audit trails. Plan for eligibility churn with retroactive adjustment handling and clear recoupment workflows. Start with a few states, build the configuration tooling, and then expand.

### Q1.3.7 [Experience] Tell us about a claims or authorization workflow you improved. What was the baseline and the result?

*Approach answer with real evidence from the grocery ordering platform (attached document) and Story 14. You have no documented claims or authorization workflow.*

I haven't owned a claims or prior authorization workflow, and I'd rather say so than stretch another project. The closest comparisons are two workflow products. On a grocery supplier-collaboration platform, I helped redesign ordering and replenishment workflows that had been manual and spread across 19 systems; the platform saved £8.4 million in ordering cost and more than 680 hours of work a week. On a roadside assistance platform, I designed dispatch and incident-management workflows and configurable case management, and average service response time fell 22 percent. The skills transfer: mapping the workflow, finding the bottleneck with operations teams, configuring rules and measuring cycle time. In a claims context I'd add auto-adjudication rate, pend time, error rate and overturn rate, and I'd learn the workflow from claims analysts in my first weeks.

### Q1.3.8 [Conceptual] How do medical coding systems (ICD-10, CPT, DRG) affect pricing and payment integrity?

ICD-10 codes describe diagnoses (and procedures for inpatient care), CPT and HCPCS codes describe procedures and services, and DRG groups an inpatient stay into a category that drives a case rate. Payment is a function of codes: the combination determines the allowed amount, which contract rate applies, and whether a service is bundled or separately payable.

For payment integrity, codes are both the input and the main source of error. Edits check code combinations (for example mutually exclusive procedures), units, modifiers, diagnosis-procedure consistency and DRG validity. Errors or inflation change payment, so reviewers compare codes to clinical documentation. A good PI product keeps code sets and edit rules current, explains which code or rule drove a finding, and measures accuracy by code family.

### Q1.3.9 [Behavioral] A medical director objects to automating part of utilization review. How do you handle it?

*Approach answer. No documented instance.*

I'd start by listening for the specific concern, because it is usually legitimate: patient safety, accuracy, accountability or regulatory exposure. Then I'd show the evidence and offer a design that addresses the worry. In practice: define clearly which decisions are in scope (for example, assembling documentation and recommending approvals for clear cases) and which stay with clinicians (any adverse decision); make the logic transparent so the director can inspect the criteria used; run in shadow mode first and compare automated recommendations with reviewers; and agree success and stop criteria up front. Optum's public position is to accelerate approvals and keep clinician review for denials, which is a good model. I'd make the director a co-owner of the clinical rules and the evaluation, so the product reflects clinical judgment. The same human-review approach worked on my GenAI projects, where scientists and medical-legal reviewers signed off before launch.

### Q1.3.10 [Experience] Describe how you worked with clinicians, coders or nurses as product users. What did you change after learning from them?

*Real story: Story 9 (clinicians) and Story 4 (scientist reviewers).*

On the digital healthcare experience platform, I partnered with clinicians, operations leaders, UX and engineering because the experience only works if it respects how care is delivered. Our task was to simplify patient journeys without disrupting care workflows. We designed journeys and configurable workflows with clinician input, built dashboards for administrators, and used experiments and feedback to keep improving. Patient satisfaction rose 30 percent and digital task completion rose 26 percent. On the scientific GenAI assistant (Story 4), I worked directly with the client's scientists to validate accuracy until they formally approved the assistant, and it reached retrieval precision above 95 percent across more than 1,000 documents. The lesson I carry to coders and nurses is to put them in the loop early with real cases, not demos.
