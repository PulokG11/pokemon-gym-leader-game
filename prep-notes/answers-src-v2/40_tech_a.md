# A4. Technical Expertise: Answers

## A4.1 Architecture and software engineering

### Q4.1.1 [Conceptual] Explain microservices trade-offs and when you would not use them.

Microservices split an application into small services that each own a capability and a data store, and can be built, deployed and scaled independently by separate teams.

**Benefits:** independent releases, scaling only what needs scaling, fault isolation, technology choice per service, and clearer team ownership. **Costs:** distributed-systems complexity (network failures, latency, data consistency), more operational overhead (deployment, monitoring, tracing), harder testing, and the need for strong API discipline.

**When not to use them:** a small team or early product with unclear boundaries; a tightly coupled domain that always changes together; limited operations maturity; or when a modular monolith would meet the need. A sensible path is to start with a well-structured modular monolith and extract services where scale, team autonomy or release cadence demands it. On the platform modernization I led (Story 2), moving from a monolith to cloud-native services supported growth from about 40 to more than 1,000 concurrent users and cut downtime by 30 percent, but it required investment in monitoring and release automation to be safe.

### Q4.1.2 [Technical] What makes a good API from a product perspective?

An API is a product whose users are developers, so I judge it on: **clarity** (resources and names match business concepts), **consistency** (naming, errors, pagination, filtering), **stability** (versioning, backward compatibility, clear deprecation), **safety** (authentication and authorization with OAuth 2.0, rate limits, idempotency for operations that must not be repeated), **usability** (good documentation, examples, SDKs, a sandbox), **observability** (request IDs, usage analytics for the provider and status for the consumer), and **performance** (latency and throughput commitments). Measure it with time to first successful call, error rates, support tickets and consumer satisfaction. I treat breaking changes as costly events that need notice and migration help.

### Q4.1.3 [Technical] How would you integrate a modern product with a legacy claims core?

**Clarifying questions:** What does the legacy core do (adjudication, pricing, eligibility)? What interfaces exist (batch files, X12, database, APIs)? What latency is needed? What is the long-term plan for the core (keep, replace, modernize)? What is the risk tolerance?

**Assumptions:** a mature claims core with batch files and limited APIs; the new product needs near-real-time claim data and must write decisions back; the core will be replaced over several years.

**Framework: strangler pattern with an anti-corruption layer (R-C-A-D-T).**
- *Requirements:* read claim and member data, write back findings or decisions, maintain audit trail, no disruption to adjudication.
- *Capacity estimate:* assume 100 million claims a year, about 274,000 a day. If 70 percent arrives in 10 business hours, that is about 19,200 an hour, 5.3 a second average; assume 3 times peak, about 16 a second. *Sanity check:* modest, so the work is integration and reliability.
- *APIs and data:* an integration layer that exposes clean APIs and canonical events on one side and speaks the legacy interfaces (files, queues, database change capture) on the other; a translation layer that maps legacy codes to the canonical model so the new product is not tied to legacy quirks.
- *Design:* change data capture or file ingestion feeds an event stream; the new product subscribes; results go back through a controlled write interface; reconciliation jobs compare totals daily; feature flags route a small share of traffic first.
- *Trade-offs:* direct database access is fast but couples you to the core's schema; APIs are cleaner but may need building; batch is simple but slow; real-time needs the core to emit events.

**Recommendation:** build the anti-corruption layer and canonical model first, start with read-only integration to prove value, add write-back once reconciliation is trusted, and migrate capabilities one at a time so the legacy core can be retired in steps.

### Q4.1.4 [Conceptual] What does the CAP theorem mean for a real-time eligibility service?

The CAP theorem says that when a network partition occurs, a distributed system must choose between consistency (every read sees the latest write) and availability (every request gets a response). For a real-time eligibility service, a partition means some nodes may not have the latest coverage change. If the service favors **consistency**, it may refuse or delay answers during a partition, which blocks registration. If it favors **availability**, it may answer with slightly stale data, risking a wrong coverage answer.

The business decision is which error is worse. For eligibility, availability usually matters for front-desk workflows, but an incorrect "covered" answer can cause denials. A balanced design: answer from the best available data with a timestamp and a confidence flag, set short cache lifetimes, reconcile quickly, and fall back to a "verify" status for risky cases. PACELC adds that even without a partition, there is a trade-off between latency and consistency, which matters for response time targets.

### Q4.1.5 [Experience] Tell us about a technical trade-off you influenced between engineering and the business.

*Real story: Story 2 and Story 1.*

On the enterprise platform, the business wanted new features, while engineering and I saw that the monolithic APIs and infrastructure capped scale at about 40 concurrent users and caused production issues. My task was to decide how much to invest in modernization versus features. I used customer feedback to make the case, showed what modernization would unlock (scale, stability, faster delivery) and sequenced the work with the architects: cloud-native services, centralized monitoring, CI/CD automation and migration of 13 integration workflows. Results: more than 1,000 concurrent users, downtime down 30 percent, API-related production issues down 90 percent, about $900,000 a year in infrastructure savings. On the solver, I similarly balanced customer feature requests against architecture work that cut runtime by 65 percent.

### Q4.1.6 [Behavioral] An architect disagrees with your scope. How do you reach alignment?

*Real story: platform modernization (attached document, questions 56 and 117).*

At o9, the platform was commercially important and customer demand for new features was growing, but Engineering and Architecture were concerned that parts of the platform would not scale reliably and that continuing to add functionality would make future changes harder and more expensive. The tension was how much capacity should go to customer features versus architecture. My task was to get a decision both sides could support. I moved the discussion from "Product wants features, Engineering wants refactoring" to business impact: production downtime, infrastructure cost, concurrency limits, repeated engineering effort and the future capabilities that would be blocked. At the same time I challenged a large rewrite because it carried its own commercial risk. We agreed on an incremental modernization of the highest-risk components while the customer roadmap continued. Production downtime fell 30 percent, concurrency went from about 40 to more than 1,000, infrastructure cost fell about 35 percent and the program saved roughly $900,000 a year. I don't try to win the architecture argument. I make sure we decide against the same evidence.

### Q4.1.7 [Conceptual] How do you handle technical debt in planning?

Keep a **debt register** with severity, business impact (incidents, slow delivery, cost) and estimated effort. Reserve a fixed share of capacity (for example 15 to 20 percent) so debt work doesn't compete item by item with features. Link debt items to metrics (deploy time, incident count, onboarding time) so value is visible. Explain debt to executives as interest: slower delivery and more incidents. Pay it down where it blocks planned work first. Review quarterly with engineering leaders. In Story 2 the modernization work was essentially paying down architectural debt, and it paid back in downtime, support effort and infrastructure cost.

### Q4.1.8 [Technical] How do you specify non-functional requirements for a high-volume claims service?

**Clarifying questions:** Volume and peak? Real-time or batch? Regulatory retention? Availability expectations of clients? Data sensitivity?

**Assumptions (illustrative):** 100 million claims a year; 70 percent arrive in business hours.

**Sizing:** 100,000,000 / 365 = about 274,000 a day. 70 percent in 10 hours = 191,800 / 10 = about 19,200 an hour = 5.3 a second. Design for peak 3 times (16 a second) and headroom of another 3 times, so a target capacity of about 50 claims a second. Storage: 100 million × 5 KB = 500 GB a year; 7-year retention = 3.5 TB (before indexes and replicas).

**NFR set (measurable):**
- *Performance:* p95 evaluation latency under 300 ms at 50 requests a second; batch of 1 million claims in under 2 hours.
- *Availability:* 99.9 percent monthly (about 43 minutes of downtime); planned maintenance windows defined.
- *Recovery:* RTO 4 hours, RPO 15 minutes; quarterly recovery test.
- *Security:* encryption in transit and at rest; role-based access; PHI access logged and retained; penetration test before launch.
- *Auditability:* every decision stored with rule version and inputs for 7 years.
- *Scalability:* horizontal scaling to 3 times current volume without redesign.
- *Observability:* metrics, logs and traces; alerts on error rate and latency.
- *Compliance:* HIPAA, SOC 2 controls.

Each NFR becomes a test or monitor before release.

### Q4.1.9 [Conceptual] How does multi-tenancy affect product design?

Multi-tenancy means one platform instance serves many clients with logical separation. It lowers cost and speeds updates, but affects design: **data isolation** (separate schemas or tenant IDs with strict access control), **configuration per tenant** (rules, thresholds, branding), **noisy neighbor control** (quotas, rate limits, fair scheduling), **security** (tenant-aware authorization and audit), **upgrades** (everyone moves together, so backward compatibility matters), **reporting** (per-tenant metrics and cost), and **compliance** (some clients may require dedicated environments). Decide early which tier of isolation you support and price accordingly. My experience with tenant-level resource management on the solver reduced infrastructure costs by 35 percent.

### Q4.1.10 [Experience] Describe how you got credibility with a highly technical engineering team.

*Real story with background: current role and Story 2.*

I came up through software engineering and solution delivery and hold a BTech, which helps me understand how things are built. In the platform modernization, my task was to lead the product side with architects and engineers who knew the system better than I did. I prepared before meetings, asked about trade-offs instead of dictating solutions, wrote clear requirements and acceptance criteria, and followed through on commitments. I also brought customer evidence that helped them prioritize, and I credited the team for results: downtime down 30 percent, more than 1,000 concurrent users, API-related production issues down 90 percent. Credibility comes from being prepared, being honest about what I don't know and delivering outcomes together.

## A4.2 Cloud platforms

### Q4.2.1 [Conceptual] Compare IaaS, PaaS, SaaS and serverless from a product decision viewpoint.

| Model | You manage | Speed | Control | Typical choice |
|---|---|---|---|---|
| IaaS (virtual machines, storage, network) | OS, runtime, apps | Slowest | Highest | Specialized workloads, legacy lift-and-shift |
| PaaS (managed platforms, databases, Kubernetes services) | Apps and data | Fast | Medium | Most custom products |
| SaaS (finished software) | Configuration | Fastest | Lowest | Commodity capabilities |
| Serverless (functions, managed event services) | Code only | Fast to start | Lower | Spiky, event-driven workloads |

Decision lens: buy SaaS for non-differentiating needs, use PaaS to build differentiating products faster, use IaaS only when you need control, and use serverless where usage is bursty and operations should be minimal. Consider cost at scale, lock-in, compliance and team skills.

### Q4.2.2 [Technical] What are the challenges of delivering a product across private cloud, public cloud and hybrid environments?

Challenges: **inconsistent services and APIs** across environments; **identity and access** management spanning domains; **networking and latency** between sites; **data residency and gravity** (moving large data is slow and costly); **deployment consistency** (different tooling); **observability** across environments; **security policy** enforcement everywhere; **cost visibility** and capacity planning; **skills** across platforms; and **testing** in all targets. Mitigations: a common abstraction (containers, Kubernetes or OpenShift, infrastructure as code), shared identity, policy as code, a common observability stack, and a clear placement policy (what runs where and why). Decide what you will standardize and what you will allow to differ.

### Q4.2.3 [Experience] Describe a cloud migration or cloud-based platform you led or influenced.

*Real story: Story 2.*

I led the product side of moving the enterprise platform's APIs and developer infrastructure from a monolith to cloud-native services. The situation: scale limited to about 40 concurrent users, production issues and slow troubleshooting across more than 200 customers. The task: enable enterprise-grade deployments with reliability. I worked with architects and engineers, used customer feedback to prioritize, built centralized monitoring and telemetry pipelines, migrated 13 integration workflows, created reusable accelerators and automated release validation and deployment. Results: more than 1,000 concurrent users, downtime down 30 percent, API-related production issues down 90 percent, issue diagnosis effort down 40 percent, release preparation from days to hours and about $900,000 a year in infrastructure savings. I did not own the cloud architecture choices; I owned the product outcomes and priorities.

### Q4.2.4 [Technical] What are RTO and RPO and how would you set them for a tiered service?

**RTO** (recovery time objective) is how long the service can be down; **RPO** (recovery point objective) is how much data loss, measured in time, is acceptable. Set them from business impact: what does an hour of outage or loss cost, and what does protection cost?

| Tier | Example service | RTO | RPO | Approach |
|---|---|---|---|---|
| 0 | Real-time eligibility and claim evaluation | 15 to 60 minutes | Near zero to 5 minutes | Active-active or hot standby, replicated data |
| 1 | Review workbench, case management | 4 hours | 15 minutes | Warm standby, frequent backups |
| 2 | Reporting and analytics | 24 hours | 4 to 24 hours | Backups and rebuild |
| 3 | Non-critical tools | 72 hours | 24 hours | Backup only |

I'd agree tiers with business owners, cost them, test with recovery drills, and record the results.

### Q4.2.5 [Conceptual] How do you reduce lock-in risk without losing the benefits of managed services?

Accept some lock-in where the benefit is large, and contain it. Keep business logic and data models portable; wrap provider-specific services behind your own interfaces or a gateway; use open standards and formats (containers, SQL, open table formats, standard APIs); keep data exportable; document an exit plan with an estimated cost and time; and avoid exotic services for core functions. Decide per service: the more differentiating or expensive to switch, the more containment effort. Review annually.

### Q4.2.6 [Technical] Map equivalent services across Azure, AWS and GCP for compute, data and AI.

| Capability | Azure | AWS | GCP |
|---|---|---|---|
| Virtual machines | Virtual Machines | EC2 | Compute Engine |
| Managed Kubernetes | AKS (and OpenShift options) | EKS | GKE |
| Serverless functions | Functions | Lambda | Cloud Functions / Cloud Run |
| Object storage | Blob Storage | S3 | Cloud Storage |
| Managed relational DB | Azure SQL / PostgreSQL | RDS / Aurora | Cloud SQL / AlloyDB |
| Data warehouse | Synapse / Fabric | Redshift | BigQuery |
| Streaming | Event Hubs | Kinesis / MSK | Pub/Sub |
| Identity | Entra ID | IAM / Identity Center | Cloud IAM |
| AI platform | Azure AI Foundry (rebranded Microsoft Foundry) | Bedrock / SageMaker | Vertex AI |
| Observability | Monitor | CloudWatch | Cloud Operations |

Service names change, so I describe the capability first and use this as a map, not a memorized list.

### Q4.2.7 [Conceptual] What is the shared responsibility model?

The cloud provider is responsible for the security **of** the cloud (physical facilities, hardware, core services), and the customer is responsible for security **in** the cloud (identity and access, data protection, configuration, network settings, application security). The split shifts with the service model: with IaaS you manage more; with SaaS the provider manages more. The practical point is that most cloud breaches come from customer-side misconfiguration, so product teams need secure defaults, policy checks and clear ownership.

### Q4.2.8 [Behavioral] Cloud costs exceed forecast. What do you do?

*Approach answer with a worked example.*

**Example (illustrative):** monthly budget $100,000; actual $140,000, a 40 percent overrun ($40,000).

**Steps:** (1) Contain: check for runaway resources and set alerts. (2) Diagnose with tagged cost data: by service, team and environment. (3) Quantify drivers, for instance: idle non-production environments $12,000, oversized databases $10,000, unplanned data transfer $8,000, a new feature's inference usage $10,000 = $40,000. (4) Fix the quick wins: shut down idle environments on schedules, right-size, cache and reduce transfer. (5) Decide with the business whether the feature's cost is justified. (6) Prevent: budgets and anomaly alerts, showback to teams and a monthly review. Savings of $30,000 of the $40,000 would bring the run-rate to about $110,000, and the rest is a decision to accept or re-forecast.

### Q4.2.9 [Experience] How have you worked with cloud architects on a landing zone or platform design?

*Approach answer with real evidence from Story 2.*

I haven't designed a landing zone myself; that is an architect's area. In the platform modernization (Story 2), I worked with architects as the product partner: I described scale targets (1,000-plus concurrent users), reliability goals, observability needs and customer integration requirements, reviewed design options and trade-offs, and prioritized the sequence of work. I added requirements for monitoring and release automation. For a landing zone I'd contribute requirements such as tenant isolation, data residency, environment tiers, cost tagging and compliance controls, and I'd ask for decision records on choices.

### Q4.2.10 [Conceptual] When would you choose multi-cloud?

When there is a clear reason: regulatory or customer requirements for specific clouds; resilience goals that require independence from a single provider; best-of-breed services that differ by provider; acquisition or existing estate; or negotiation leverage. Costs include more skills and tooling, duplicated effort and weaker use of provider-specific strengths. If the main driver is fear of lock-in, a single primary cloud with a portable architecture and tested exit plan is often cheaper. For an enterprise AI platform spanning private cloud, Azure, AWS and GCP, abstraction at the platform layer is what makes multi-cloud practical.

## A4.3 Data platforms and analytics

### Q4.3.1 [Technical] Explain bronze, silver and gold data layers and how they inform roadmap phasing.

- **Bronze:** raw data landed as received, immutable, with source and load metadata. Purpose: traceability and replay.
- **Silver:** cleaned, validated, de-duplicated and conformed to standard formats and code sets; business entities start to appear. Purpose: reliable, reusable data.
- **Gold:** curated, aggregated datasets and marts for specific use cases (dashboards, models, APIs). Purpose: fast, trusted consumption.

**Roadmap phasing:** pick a first use case; land its sources in bronze; build the silver rules and quality checks it needs; deliver a gold dataset and a visible outcome; then repeat for the next use case, reusing silver. Each phase has quality gates (completeness, validity, timeliness) and an owner. This delivers value early and avoids a multi-year build with no users.

### Q4.3.2 [Technical] When is streaming worth it over batch?

**Principle:** pay for freshness only where the decision value depends on it.

**Clarifying questions:** Which decision needs fresh data? What is the cost of stale data? What is the build and run cost of streaming?

**Illustrative example:** streaming eligibility changes into a claims front-end check adds about $300,000 a year (build and run). Suppose 5 million claims a year, and fresher eligibility prevents 0.1 percent of them from being denied: 5,000 claims × $60 rework cost = $300,000, which is break-even. If realistic prevention is 0.3 percent: 15,000 × $60 = $900,000, three times the cost, so streaming is worth it. If prevention is 0.05 percent: $150,000, so batch every few hours is better.

**Rule of thumb:** many "real-time" requests are really "within 15 minutes", which micro-batch handles cheaply. Use streaming for fraud-style detection, eligibility and operational alerts; use batch for reporting and training data.

### Q4.3.3 [Experience] Tell us about a data platform you owned. Who were the consumers and how did you prioritize?

*Approach answer with real evidence from Story 4, Story 10 and Story 2.*

I haven't owned an enterprise healthcare data platform. The closest work: for the scientific assistant (Story 4) I defined the data pipeline of document preprocessing, embeddings and retrieval over more than 1,000 documents, with retrieval precision above 95 percent; on the platform (Story 2), I built centralized telemetry pipelines and monitoring used by engineers and support for more than 200 customers, which reduced diagnosis effort by 40 percent; and on the insurer data-engineering work (Story 10), AI assistance helped deliver more than 50 production features across more than 300 data sources. I prioritized by consumer need: who would use the data, for which decision, and what business value it brought. For a Common Data Platform I'd start with two use cases and expand.

### Q4.3.4 [Conceptual] How do you define data quality and make it a product KPI?

Data quality has dimensions: **completeness** (required fields present), **validity** (values conform to formats and rules), **accuracy** (matches reality or a trusted source), **consistency** (same across systems), **uniqueness** (no duplicates) and **timeliness** (arrives when needed). Turn each into a measurable score per dataset and source, for example "98 percent of encounters have a valid payer ID within 24 hours". Show these on a dashboard, set thresholds with consumers, and attach actions to breaches (reject queue, alert to the source owner). Tie quality to outcomes (for example denial rate or model accuracy) so it earns priority.

### Q4.3.5 [Technical] How do you build identity resolution for patients or accounts across systems?

**Clarifying questions:** Which identifiers exist (MRN, insurance ID, name, date of birth, address)? How much data is missing or wrong? What is the cost of a wrong merge versus a missed match?

**Assumptions (illustrative):** 5 million patient records across 5 systems; 0.5 percent of candidate pairs are uncertain.

**Framework: deterministic rules, probabilistic scoring, human review.**
1. *Standardize* names, addresses, dates.
2. *Block* records into candidate groups to avoid comparing all pairs.
3. *Score* pairs with weighted agreement on key fields.
4. *Decide:* automatic match above a high threshold, automatic non-match below a low threshold, review queue in between.
5. *Review queue sizing:* 5,000,000 × 0.5 percent = 25,000 uncertain cases × 2 minutes = 50,000 minutes = about 833 hours, about 4 to 5 staff-months. Planning for this effort is part of the product.
6. *Survivorship:* rules for which source wins per field.
7. *Safeguards:* prefer false non-matches to false merges (a wrong merge can mix medical records), log every merge and allow unmerge.
8. *Measure:* precision and recall on a labeled sample, review backlog.

**Recommendation:** start with deterministic matching on strong identifiers, add probabilistic scoring and a review queue, and monitor match quality.

### Q4.3.6 [Conceptual] What is data governance in practice?

Governance is who can do what with which data, and how quality and risk are managed. In practice: named **owners and stewards** per data domain; **policies** for classification, access, retention and sharing; a **catalog** and **lineage** so people can find and trace data; **quality rules and monitoring**; **access control** with approvals and audit; **privacy and compliance** controls (PHI handling, de-identification); and a **change process** for definitions and schemas. It should be light enough to use: automated checks, simple request flows and clear accountability.

### Q4.3.7 [Experience] Describe a BI or dashboard initiative using Power BI or Tableau. How did you manage definitions?

*Real experience (as you told me), without specifics. You have used Power BI and Tableau, though not in your current role.*

I've used Power BI and Tableau for dashboards and reporting in earlier roles and I'm proficient in both, though I haven't used them hands-on in my current role, so I'd need a few weeks to be back at full speed. My recent dashboard work includes operations dashboards for roadside service performance (Story 14), responsive planning dashboards with advanced filtering (Story 13) and KPI dashboards with SLA tracking (Story 11). For definitions, my approach is a metric dictionary (name, formula, source, owner), certified datasets that dashboards read from, one owner per metric and a governed semantic layer, which applies in either tool.

### Q4.3.8 [Technical] How would you document data flows and mappings for a new integration?

Produce: a **context diagram** (systems, directions, frequency, protocol); a **data flow diagram** from source to consumers; a **field-level mapping spreadsheet** (source field, type, transformation rule, target field, validation, owner); a **business rules** list; a **data contract** (schema, semantics, timeliness, error handling); a **reconciliation plan** (counts and totals checked between systems); sample messages; and a **test plan** with edge cases. Keep these in a version-controlled repository linked to stories. In the platform modernization I managed integration workflows and accelerators where this documentation shortened implementation effort.

### Q4.3.9 [Behavioral] Stakeholders distrust the numbers on your dashboard. What do you do?

*Approach answer.*

First, find out which numbers and why: they may conflict with another source, use a different definition or have shown errors. I would reconcile the dashboard to the system of record for a sample period and show the differences, find root causes (definitions, timing, filters, data defects), fix them and document the definitions on the dashboard. I would show data freshness and lineage, name an owner, and add automated checks with alerts. Then I'd review with the skeptical stakeholders and invite them to challenge it. Trust returns when numbers reconcile, definitions are visible and problems are fixed quickly.

### Q4.3.10 [Conceptual] What does a single source of truth mean in a healthcare data platform and what are its limits?

It means one agreed, governed place or view where a given fact (a patient's account history, a claim's status) is defined and trusted, so teams don't maintain conflicting versions. Its limits: source systems remain the owners of their transactions, so the platform is usually a **trusted view**, not a replacement; conflicting data needs survivorship rules; identity matching is imperfect; timeliness varies by source; and different uses may need different definitions. Be explicit about which system is the system of record per entity, how conflicts are resolved and how fresh the data is. The goal is one set of definitions and one place to ask, with traceability to sources.
