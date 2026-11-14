# Q1. Healthcare Domain: Top 10 Questions per Sub-category

> Question types: Conceptual (explains understanding), Technical (depth on how it works), Experience (asks for your past work), Behavioral (asks how you act in situations). Each question has a short "Look for" line describing what a strong answer contains.

## Q1.1 Healthcare landscape and business context

- **1. [Conceptual]** Walk us through how money and information flow between patients, providers, payers, PBMs and employers. Where is the most friction?
  - Look for: a clear map of handoffs (eligibility, authorization, claim, payment, appeal) and where administrative cost accumulates.
- **2. [Conceptual]** Optum owns payer, provider, pharmacy and technology businesses. What are the product opportunities and the risks of that integration?
  - Look for: data and workflow advantages balanced against conflict-of-interest and trust concerns.
- **3. [Experience]** Describe a healthcare product you owned. Who were the users, and which outcome did you move?
  - Look for: named user roles, a baseline, a measured result, regulatory context.
- **4. [Conceptual]** How do payer and provider incentives conflict, and how do you design a product that serves both?
  - Look for: provider abrasion, transparency, shared data, win-win metrics.
- **5. [Experience]** Tell us about a time you worked in a large, matrixed or regulated organisation to ship something. What slowed you down and how did you adapt?
  - Look for: stakeholder mapping, early compliance engagement, pragmatic sequencing.
- **6. [Conceptual]** What is a managed-service platform, and when should a service be productised versus delivered as custom work?
  - Look for: repeatability, margin, configurability, SLA design.
- **7. [Technical]** What do you know about ancillary benefits (for example dental or vision) and how would you design a platform that administers them for many clients?
  - Look for: multi-tenant configuration, eligibility and claims integration, data flows; honesty about gaps.
- **8. [Experience]** Give an example of a consumer-facing health product decision you made using customer feedback or app-store data.
  - Look for: theme analysis, prioritisation, close-the-loop communication, metric movement.
- **9. [Behavioral]** Optum's mission references health equity. Tell us about a time you considered fairness or access in a product decision.
  - Look for: concrete action such as bias testing, accessibility, segment analysis.
- **10. [Behavioral]** Why healthcare, and why Optum, at this point in your career?
  - Look for: authentic motivation tied to scale, complexity and AI-enabled transformation, not generic praise.

## Q1.2 Revenue Cycle Management (RCM)

- **1. [Conceptual]** Take us through the revenue cycle from scheduling to final payment. Where does the largest leakage occur?
  - Look for: all stages named; leakage examples (eligibility errors, documentation gaps, denials).
- **2. [Conceptual]** Which RCM metrics matter most and why: days in A/R, clean claim rate, denial rate, net collection rate, cost to collect?
  - Look for: choosing a north-star metric and explaining trade-offs between them.
- **3. [Technical]** How would you design a Common Data Platform that ingests data from many EHRs and produces a single source of truth for RCM?
  - Look for: ingestion patterns, canonical model, identity matching, data quality rules, lineage, phased use cases.
- **4. [Technical]** What is a longitudinal account record and what makes it hard to build?
  - Look for: event ordering, patient and account matching, conflicting sources, auditability.
- **5. [Conceptual]** How is ambulatory RCM different from inpatient, and how would that change product requirements?
  - Look for: high volume, professional billing, E/M coding, point-of-service collections.
- **6. [Experience]** Describe a data-driven insight you delivered that changed an operations team's behaviour. How did you prove impact?
  - Look for: worklist or decision change, control group, adoption evidence.
- **7. [Technical]** Where can AI help in RCM, and where is it risky? Give two examples of each.
  - Look for: coding assistance, denial prediction, documentation gaps; risks in compliance and over-coding.
- **8. [Experience]** Tell us about a time you had to reconcile inconsistent definitions of a metric across teams. What did you do?
  - Look for: governed definitions, stakeholder alignment, semantic layer.
- **9. [Behavioral]** Operations leaders say your tool adds clicks. How do you respond and what do you change?
  - Look for: shadowing users, measuring effort, redesign, willingness to cut features.
- **10. [Experience]** Describe a multi-year customer deployment plan you created or influenced. How did you sequence waves and manage risk?
  - Look for: risk-based sequencing, pilots, feedback loops, change management.

## Q1.3 Payer operations and claims domains

- **1. [Conceptual]** Describe the claim lifecycle at a payer from receipt to payment or denial.
  - Look for: edits, validation, pricing, adjudication, remittance, appeals.
- **2. [Conceptual]** What is utilization management and why is prior authorization so contentious?
  - Look for: medical necessity, burden on providers, delays for patients, regulation.
- **3. [Technical]** How would you scope four AI agents for benefit, pricing, policy and prior authorization inquiries, and what are their sources of truth?
  - Look for: system-of-record mapping, retrieval and tool needs, accuracy bars, escalation.
- **4. [Technical]** What are eligibility transactions (270/271) and why do accuracy and latency matter downstream?
  - Look for: real-time dependency chain for claims and authorizations.
- **5. [Conceptual]** Explain risk adjustment (for example HCC coding) and the compliance risk when building features around it.
  - Look for: documentation integrity, audit exposure, avoiding incentives to over-code.
- **6. [Technical]** What makes Medicaid different from commercial and Medicare, and how do you handle state-specific payment cycles in a product?
  - Look for: configurability, state rule layers, eligibility churn, encounter data.
- **7. [Experience]** Tell us about a claims or authorization workflow you improved. What was the baseline and the result?
  - Look for: cycle time, auto-adjudication rate, error rate, user adoption.
- **8. [Conceptual]** How do medical coding systems (ICD-10, CPT, DRG) affect pricing and payment integrity?
  - Look for: code to payment logic, grouping, edits and audits.
- **9. [Behavioral]** A medical director objects to automating part of utilization review. How do you handle it?
  - Look for: listening, human-in-the-loop design, evidence, staged autonomy.
- **10. [Experience]** Describe how you worked with clinicians, coders or nurses as product users. What did you change after learning from them?
  - Look for: co-design, usability testing with real cases, trust building.

## Q1.4 Payment integrity, audit and recovery

- **1. [Conceptual]** What is payment integrity and how does pre-pay differ from post-pay? Which would you invest in first?
  - Look for: cost and abrasion trade-offs; shift-left rationale; complementary roles.
- **2. [Conceptual]** How would you define "audit yield" and what could make it a misleading metric?
  - Look for: identified versus realised savings, overturn rate, false positives, gaming.
- **3. [Technical]** Design a rules and claim-editing platform that can serve multiple lines of business and clients.
  - Look for: rule authoring, versioning, simulation, tenant layers, rollback, audit trail.
- **4. [Technical]** Where would you apply machine learning in payment integrity, and how would you keep decisions explainable to providers?
  - Look for: candidate selection and prioritisation, evidence display, human review.
- **5. [Experience]** Tell us about a product you owned where false positives created customer or provider friction. What did you do?
  - Look for: measurement, tuning thresholds, feedback loops, communication.
- **6. [Conceptual]** What does a good recovery workflow look like end to end, including disputes and appeals?
  - Look for: notifications, deadlines, evidence, status transparency, finance integration.
- **7. [Experience]** Describe how you set outcome KPIs such as throughput, cycle-time reduction and adoption for a workflow product.
  - Look for: baseline, targets, instrumentation, review cadence.
- **8. [Behavioral]** Compliance asks for a change that threatens your delivery date. What do you do?
  - Look for: risk framing, options, escalation with recommendation.
- **9. [Technical]** How would you make a payment integrity product reusable across clients without custom code for each?
  - Look for: configuration over customisation, extension points, product boundaries.
- **10. [Behavioral]** You lead a team of product managers on an audit platform. How do you grow them and set expectations?
  - Look for: goals, feedback cadence, coaching on prioritisation, hiring plan.

## Q1.5 Interoperability and healthcare data standards

- **1. [Conceptual]** Explain HL7 v2, FHIR and X12. When would you use each?
  - Look for: legacy messaging, modern APIs, administrative transactions.
- **2. [Technical]** What would a FHIR-based prior authorization API require from a payer?
  - Look for: resources, implementation guides, security, performance, timelines.
- **3. [Conceptual]** What does the CMS prior authorization rule change for payer roadmaps?
  - Look for: decision timeframes, reporting, API deadlines; acknowledgement of need to verify dates.
- **4. [Experience]** Describe an integration with an EHR or external partner you led. What went wrong and what did you learn?
  - Look for: long timelines, interface variation, testing, ownership.
- **5. [Technical]** How do you map and normalise data from many sources into a consistent model?
  - Look for: canonical model, terminology mapping, data contracts, reconciliation.
- **6. [Conceptual]** What is information blocking and why does it matter for product strategy?
  - Look for: Cures Act obligations and the push toward open access.
- **7. [Technical]** How do you handle versioning and backward compatibility for APIs consumed by many external parties?
  - Look for: version policy, deprecation windows, contract tests.
- **8. [Experience]** Tell us about a time interoperability constraints changed your roadmap.
  - Look for: pragmatic re-scoping and stakeholder communication.
- **9. [Behavioral]** Engineering wants to delay a standards-compliance feature for new functionality. How do you decide?
  - Look for: cost of delay, regulatory deadlines, risk-based trade-off.
- **10. [Technical]** How would you test interoperability readiness before go-live?
  - Look for: sandboxes, conformance suites, partner testing, monitoring.

## Q1.6 Regulation, security and compliance

- **1. [Conceptual]** What does HIPAA require of a product team in practice?
  - Look for: minimum necessary, access controls, audit logs, breach processes, vendor agreements.
- **2. [Technical]** How would you design a feature that uses PHI for analytics or model training?
  - Look for: de-identification options, limited data sets, approvals, access scope.
- **3. [Conceptual]** How do you stay ahead of regulatory changes such as Medicare Advantage rules or prior authorization mandates?
  - Look for: regulatory calendar, compliance partnership, roadmap buffers.
- **4. [Experience]** Tell us about a time compliance or privacy review changed your design. How did you respond?
  - Look for: early engagement, redesign, no blame.
- **5. [Conceptual]** How should AI in utilization review be governed, given state and federal attention?
  - Look for: human review of adverse decisions, transparency, bias monitoring, records.
- **6. [Technical]** What controls do you expect for an agent that can read member data and take actions?
  - Look for: scoped identity, least privilege, logging, approvals for high-risk actions.
- **7. [Behavioral]** Describe a time you escalated a risk you believed leadership would not want to hear.
  - Look for: courage, evidence, constructive recommendation.
- **8. [Conceptual]** What are SOC 2, HITRUST and NIST frameworks, and which matter for your product?
  - Look for: purpose of each and client expectations.
- **9. [Experience]** How have you embedded compliance into agile delivery without slowing teams?
  - Look for: acceptance criteria, automated evidence, pre-approved patterns.
- **10. [Behavioral]** After a major industry cyber incident, how would you reassess your product's resilience roadmap?
  - Look for: dependency mapping, recovery objectives, drills, vendor concentration risk.

# Q2. AI / Gen AI / Agentic AI / ML: Top 10 Questions per Sub-category

## Q2.1 Generative AI and LLMs

- **1. [Conceptual]** Explain how an LLM works to a non-technical executive, including why it can be wrong.
  - Look for: plain language, tokens and prediction, hallucination, mitigation.
- **2. [Conceptual]** When would you choose prompting, retrieval or fine-tuning?
  - Look for: start simple, add retrieval for private and fresh knowledge, fine-tune with evidence.
- **3. [Technical]** Describe a RAG architecture and the main places quality is lost.
  - Look for: chunking, embeddings, hybrid search, reranking, permissions, freshness.
- **4. [Technical]** How do you reduce hallucinations in a policy-answering assistant?
  - Look for: grounding with citations, abstention, evaluation, human review.
- **5. [Experience]** Tell us about a generative AI feature you shipped. What did you measure and what failed?
  - Look for: evaluation approach, honest failures, iteration.
- **6. [Conceptual]** How do you choose between a large and small model for a task?
  - Look for: accuracy, latency, cost, routing.
- **7. [Technical]** What are the cost drivers of an LLM feature and how do you control them?
  - Look for: tokens, context size, caching, model routing, batching.
- **8. [Conceptual]** Where is generative AI a poor fit in healthcare operations?
  - Look for: deterministic calculations, high-stakes decisions without review.
- **9. [Behavioral]** A senior stakeholder wants an AI chatbot immediately because competitors have one. What do you do?
  - Look for: problem framing, pilot scope, evaluation gates.
- **10. [Experience]** Describe how you introduced AI-assisted work to a team sceptical of it.
  - Look for: pilots, training, transparent metrics, addressing job-security concerns.

## Q2.2 Agentic AI

- **1. [Conceptual]** What is the difference between a chatbot, a workflow and an agent? When do you use each?
  - Look for: variability, tool use, reliability and cost trade-offs.
- **2. [Technical]** How would you design a shared Payer Agentic Platform so each new agent launches faster than the last?
  - Look for: shared orchestration, retrieval, connectors, evaluation harness, guardrails, observability.
- **3. [Conceptual]** What is an autonomy ladder and how do you decide when to promote an agent?
  - Look for: suggest, draft, act with sampling, act broadly; promotion criteria.
- **4. [Technical]** How do tool connectivity standards such as MCP change platform design?
  - Look for: standard interfaces, security and governance, tool ownership.
- **5. [Technical]** When is a multi-agent design justified, and what are its costs?
  - Look for: specialisation gains versus latency, complexity and failure modes.
- **6. [Experience]** Tell us about an automation or agent you took from prototype to production. What broke?
  - Look for: integration pain, monitoring, edge cases, governance.
- **7. [Technical]** What should you log and trace for an agent run in a PHI environment?
  - Look for: prompts, tool calls, outputs, cost, with redaction and access control.
- **8. [Conceptual]** How do you manage agent lifecycle: versioning, rollout, rollback and retirement?
  - Look for: coupled versioning of prompts, tools and models; canaries.
- **9. [Behavioral]** An agent made a wrong recommendation that reached a customer. How do you respond?
  - Look for: containment, root cause, communication, preventive controls.
- **10. [Conceptual]** Where do you expect agents to create the most value at Optum in the next two years, and why?
  - Look for: high-volume administrative workflows such as claims, prior authorization, coding, appeals.

## Q2.3 AI product lifecycle, evaluation and governance

- **1. [Technical]** Design an evaluation plan for a benefit-inquiry agent before launch.
  - Look for: golden set, groundedness, segment accuracy, escalation rate, regression suite.
- **2. [Conceptual]** How does the AI product lifecycle differ from traditional software?
  - Look for: data gates, evaluation thresholds, drift, oversight design.
- **3. [Technical]** How do you use model-as-judge evaluation responsibly?
  - Look for: calibration to human labels, bias awareness, spot checks.
- **4. [Experience]** Tell us about a time you set launch thresholds for an AI feature. How did you pick them?
  - Look for: cost of errors, baseline human performance, stage gates.
- **5. [Conceptual]** What is human-in-the-loop done well versus done poorly?
  - Look for: reviewer interface, automation bias, feedback loops.
- **6. [Conceptual]** How would you build a Responsible AI process for a product team?
  - Look for: risk tiering, model cards, bias tests, approvals, incident response.
- **7. [Behavioral]** The governance board delays your launch. What do you do?
  - Look for: early engagement, understanding concerns, evidence packages.
- **8. [Experience]** How have you shown the financial value of an AI initiative to finance leaders?
  - Look for: baseline, holdout, savings realised versus identified, payback.
- **9. [Conceptual]** What is your view on "no automated denials" as a product principle?
  - Look for: nuance on approvals versus denials, clinician accountability, transparency.
- **10. [Technical]** How do you monitor for model drift and when do you trigger retraining or rollback?
  - Look for: quality metrics, input shift, alerts, runbooks.

## Q2.4 Machine learning and data science

- **1. [Conceptual]** How do you decide whether a problem needs machine learning?
  - Look for: decision definition, data availability, simpler baselines.
- **2. [Technical]** Which metrics would you use for a model that prioritises claims for audit, and why?
  - Look for: precision at top-K, recall, lift, recovery per reviewer hour.
- **3. [Experience]** Describe how you partnered with data scientists. How did you handle disagreements?
  - Look for: shared success metrics, data readiness, respect for expertise.
- **4. [Conceptual]** What is the cost of false positives versus false negatives in healthcare operations?
  - Look for: concrete examples and threshold setting.
- **5. [Technical]** What is MLOps and which parts must a product manager care about?
  - Look for: versioning, monitoring, retraining, deployment, cost.
- **6. [Conceptual]** How do you test a model for bias across populations?
  - Look for: segment metrics, data representativeness, mitigation.
- **7. [Experience]** Tell us about a model that performed well offline but failed in production.
  - Look for: distribution shift, workflow mismatch, learning.
- **8. [Technical]** How would you source and manage expert-labelled data (coders, nurses)?
  - Look for: guidelines, agreement checks, cost and throughput.
- **9. [Behavioral]** How do you communicate model uncertainty to operations leaders?
  - Look for: plain language, confidence bands, decision rules.
- **10. [Experience]** Describe how you evaluated emerging AI capabilities and decided what to adopt.
  - Look for: time-boxed spikes, evaluation sets, criteria for adoption.

## Q2.5 AI infrastructure and platforms

- **1. [Conceptual]** How is an enterprise AI runtime platform a product, and who are its customers?
  - Look for: internal developers, adoption metrics, service tiers.
- **2. [Technical]** Explain how GPU capacity should be managed across many teams.
  - Look for: quotas, priority scheduling, showback, utilisation targets.
- **3. [Technical]** What do you need to decide when offering model serving and inference as a service?
  - Look for: SLOs, latency tiers, autoscaling, cost model, security.
- **4. [Conceptual]** How would you abstract differences between private cloud, Azure, AWS and GCP for consumers?
  - Look for: Kubernetes, standard APIs, infrastructure as code, common observability.
- **5. [Technical]** What are your criteria for comparing managed AI platforms such as Azure AI Foundry, Bedrock, Vertex AI and Databricks?
  - Look for: model access, governance integration, private networking, cost, lock-in.
- **6. [Experience]** Describe a platform you launched. What was your time-to-first-success metric and how did you improve it?
  - Look for: self-service, documentation, templates, measured onboarding.
- **7. [Behavioral]** Teams complain the platform is too restrictive. How do you balance guardrails and freedom?
  - Look for: golden paths, exceptions process, listening.
- **8. [Technical]** What would you put in a service catalogue entry for an agent runtime?
  - Look for: purpose, SLOs, limits, pricing, support, security.
- **9. [Conceptual]** What is FinOps and how does it apply to AI workloads?
  - Look for: tagging, unit economics, budgets, anomaly alerts.
- **10. [Conceptual]** Where does your platform's responsibility end and enterprise governance begin?
  - Look for: integration without duplication, clear RACI.

## Q2.6 AI-enabled productivity tools and practices

- **1. [Experience]** How do you use AI in your own PM workflow today? Give a specific example with a result.
  - Look for: concrete use, time saved, quality checks.
- **2. [Conceptual]** What data must never go into a non-approved AI tool, and how do you enforce it?
  - Look for: PHI and confidential data rules, approved tools, training.
- **3. [Experience]** Describe how you validate AI-generated user stories or acceptance criteria.
  - Look for: human review, engineering feedback, traceability.
- **4. [Behavioral]** A teammate shares an AI-written summary that contains an error. How do you handle it?
  - Look for: correction without blame, process fix.
- **5. [Technical]** How would you set up quality checks for AI-assisted recurring reports?
  - Look for: source links, sampling, sign-off, error log.
- **6. [Experience]** Tell us about a process you automated to free up time for higher-value work.
  - Look for: baseline, outcome, adoption.
- **7. [Conceptual]** How can Copilot-style tools change the role of a product manager?
  - Look for: more time on judgement and customers, risk of shallow work.
- **8. [Behavioral]** How do you coach a team to use AI tools responsibly?
  - Look for: guidelines, examples, review practices.
- **9. [Experience]** How do you measure productivity gains from AI tools credibly?
  - Look for: before and after metrics, avoiding vanity measures.
- **10. [Conceptual]** How do you keep the roadmap tool the system of record while using AI drafting?
  - Look for: drafts versus decisions, ownership, audit trail.
