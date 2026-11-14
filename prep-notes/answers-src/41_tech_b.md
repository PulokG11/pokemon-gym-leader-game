## A4.4 Infrastructure and platform engineering

### Q4.4.1 [Conceptual] Explain Kubernetes to a business audience and why OpenShift is used in enterprises.

Think of Kubernetes as an automated operations manager for software. Applications are packaged in containers, like standard shipping containers, so they run the same everywhere. Kubernetes decides which machines run them, restarts them if they fail, adds copies when demand rises and rolls out updates without downtime. That gives faster releases, better reliability and efficient use of hardware.

OpenShift is Red Hat's enterprise version of Kubernetes. Enterprises choose it because it adds built-in security controls, a supported distribution, developer tooling, consistent operation across private data centers and public clouds, and vendor support. For regulated organizations, that combination of control and consistency across hybrid environments is attractive.

### Q4.4.2 [Technical] How do GPU workloads change platform capacity planning?

**Clarifying questions:** Which workloads (inference, batch, fine-tuning)? Growth rate? Procurement lead time? Can we burst to cloud?

**Assumptions (illustrative):** current need 40 GPUs; demand grows 10 percent per month; procurement and installation lead time is 4 months; 20 percent buffer.

**Framework: forecast demand over the lead time, then add buffer.**
- *Demand at month +4:* 40 × 1.10⁴ = 40 × 1.4641 = 58.6 GPUs.
- *With 20 percent buffer:* 58.6 × 1.2 = 70.3, so order to reach about 70 GPUs, an addition of about 30.
- *Sanity check:* GPUs are scarce and lead times are long, so ordering for today's demand means being short when the hardware arrives.

**What changes compared with CPU capacity:** higher cost per unit, scarcity and long lead times, workloads that need whole GPUs or careful sharing, sensitivity to scheduling and fragmentation, and utilization that swings between peak and idle. **Management:** forecast with teams quarterly, reserve baseline capacity, burst to cloud for peaks, set quotas and priority classes, and track utilization and queue times.

### Q4.4.3 [Conceptual] What is GitOps and why does it suit regulated environments?

GitOps manages infrastructure and application deployments by storing the desired state in Git and having an automated agent (for example Argo CD or Flux) make the live system match it. Changes happen through pull requests, which are reviewed, approved and logged. Benefits for regulated environments: a complete audit trail (who changed what, when, who approved), repeatable and consistent environments, easy rollback by reverting a commit, drift detection, and separation of duties through approval rules. It turns change control from manual paperwork into a built-in part of delivery.

### Q4.4.4 [Technical] What telemetry would you require before launching an internal platform service?

- **Metrics:** request rate, error rate, latency distributions (p50, p95, p99), saturation (CPU, memory, GPU utilization, queue depth), and business metrics such as active tenants and cost per unit.
- **Logs:** structured logs with request IDs, no PHI, retained per policy.
- **Traces:** distributed tracing across components (for example with OpenTelemetry).
- **SLIs and SLOs:** defined and visible per tier, with error budget tracking.
- **Alerts:** actionable alerts tied to runbooks, routed to an on-call rota.
- **Audit logs:** who did what, for security review.
- **Per-tenant usage and cost:** for showback.
- **Dashboards:** operational view for engineers and a service health view for customers.
- **Synthetic checks:** probes that test the service from the user's perspective.

I'd make this part of the launch checklist.

### Q4.4.5 [Experience] Describe how you improved developer experience on a platform.

*Real story: Story 2.*

On the enterprise platform, developers and implementation teams lost time on troubleshooting, manual releases and inconsistent integrations. My task was to improve productivity and reliability for the people building on and supporting the platform. I introduced platform automation, observability dashboards and intelligent monitoring that sped up troubleshooting; centralized monitoring cut issue diagnosis and debugging effort by 40 percent; CI/CD automation reduced release preparation from multiple days to a few hours; reusable integration accelerators reduced implementation effort and improved consistency; and training content supported more than 3,000 global users. I measured the changes against baseline effort and incident data. I did not define a formal developer satisfaction score, which is something I'd add for a new platform.

### Q4.4.6 [Conceptual] What is FinOps and how would you apply it to platform pricing?

FinOps is shared accountability for cloud and infrastructure spend through visibility, optimization and governance. For platform pricing: measure unit costs (for example per GPU hour, per thousand requests), tag all usage by team and use case, start with **showback** (teams see their usage and cost), then move to **chargeback** or internal pricing. Price tiers by service level (reserved capacity costs more than best-effort), include a buffer for idle capacity, and publish a rate card. Provide budgets, alerts and optimization advice. The pricing signal itself encourages efficient use, such as smaller models and off-peak batch jobs.

### Q4.4.7 [Behavioral] An outage hits your platform. How do you lead communication and follow-up?

*Approach answer with evidence from Story 2.*

**During the incident:** confirm the incident commander, open a single communication channel, post a first update within a set time (what we know, impact, next update time), then regular updates even if there is no change. Speak plainly, avoid guessing at root cause, and give customers a workaround if one exists. **After:** confirm resolution, send a summary, and hold a blameless post-incident review within a few days with a timeline, root cause, contributing factors and action items with owners and dates. Report progress on actions and track recurrence. On the platform work I led, centralized monitoring and continuous monitoring enabled faster incident response, and downtime fell 30 percent.

### Q4.4.8 [Technical] How do you set SLOs for multi-tenant services?

**Framework: choose SLIs users care about, set targets from history and need, and tier by customer.**
- *SLIs:* availability (successful requests / total), latency (p95 under a target), error rate, and for data products freshness.
- *Targets:* start from measured performance and user needs; for example 99.9 percent availability and p95 latency under 500 ms for the interactive tier.
- *Error budget:* 99.9 percent over 30 days allows 0.1 percent of 43,200 minutes = 43.2 minutes of downtime. When the budget is spent, pause risky releases and focus on reliability.
- *Multi-tenant specifics:* measure SLIs per tenant as well as globally to spot noisy neighbors; enforce quotas and rate limits so one tenant can't exhaust shared capacity; offer tiers (premium tenants get stricter SLOs and isolation) and publish them.
- *Review:* quarterly with customers and engineering.

### Q4.4.9 [Experience] Tell us about a time infrastructure constraints forced a roadmap change.

*Real story: Story 1 and Story 2.*

On the solver, infrastructure cost and large model sizes were limits on how many customers and how complex a model we could support. My task was to improve performance and cost without slowing customer value. I changed priorities to include tenant-level resource management and solver architecture work, which cut infrastructure costs by 35 percent, improved scalability by 20 to 30 percent and reduced runtime by 65 percent. On the wider platform, scale limits of about 40 concurrent users forced a reprioritization toward cloud-native services, leading to more than 1,000 concurrent users and about $900,000 a year in infrastructure savings. In both cases I used customer evidence to justify moving the work ahead of some feature requests.

### Q4.4.10 [Conceptual] What is platform engineering and how does it differ from traditional operations?

Traditional operations runs and supports systems, often reacting to requests and incidents. Platform engineering builds an **internal product** (a self-service platform with paved roads) so development teams can build, deploy and run software themselves, safely and consistently. It treats developers as customers, measures developer experience and adoption, automates repeatable tasks, and bakes in security, compliance and observability. The focus moves from tickets to products, from gatekeeping to enabling, and from individual fixes to reusable capabilities.

## A4.5 DevOps, quality and delivery engineering

### Q4.5.1 [Conceptual] Why do DORA metrics matter to a product leader?

They connect engineering practice to business agility and risk. **Deployment frequency** and **lead time for changes** show how fast you can deliver and learn; **change failure rate** and **time to restore service** show how safe and resilient delivery is. High-performing teams tend to be both fast and stable, which challenges the idea that speed costs quality. For a product leader, they help set realistic roadmaps, identify process bottlenecks (for example long approval queues), justify investment in automation, and measure improvement. In Story 11, MVP delivery, CI/CD and feature toggles cut development cycles from 2 to 4 weeks to 1 to 2 weeks and time to market from 7 weeks to under 3.

### Q4.5.2 [Technical] Describe an ideal CI/CD pipeline for a regulated product.

**Stages:** (1) commit with code review and branch protection; (2) automated build; (3) unit tests and static analysis; (4) security scans (dependencies, secrets, container images); (5) integration and contract tests; (6) deploy to a test environment with synthetic or de-identified data; (7) performance and regression tests; (8) compliance evidence capture (test results, approvals, versions) stored automatically; (9) approval gate for production by named roles; (10) staged deployment (canary or phased) with feature flags; (11) automated smoke tests and monitoring checks; (12) rollback automation. **Principles:** everything as code, immutable artifacts, separation of duties, traceability from commit to release, and fast feedback. The pipeline should produce the audit evidence as a by-product.

### Q4.5.3 [Experience] How have you improved release quality or reduced change failure rate?

*Real story: Story 11 and Story 2.*

In the online store work, releases were slow and regression effort high. My task was to improve quality and speed together. I introduced MVP-based delivery, CI/CD, feature toggles and standardized engineering practices and raised automated test coverage from 50 percent to over 85 percent. First-time-pass rate rose from 93 to 96 percent and regression effort fell from about 70 hours to under five. On the enterprise platform I automated release validation, regression testing and deployment, cutting release preparation from multiple days to a few hours, and API-related production issues fell 90 percent. I measure change failure by first-time-pass rate and production issues per release.

### Q4.5.4 [Technical] What test strategy fits a rules-heavy claims system?

**Framework: test pyramid adapted for rules.**
- *Unit tests* for each rule and calculation, with examples from policy documents.
- *Decision-table tests* for combinations of conditions, generated systematically.
- *Regression suite* of historical claims with known outcomes (golden sets), run on every change.
- *Simulation and impact analysis:* replay recent real or de-identified claims against a new rule version to see how many outcomes change and why before release.
- *Integration tests* for intake, pricing and write-back.
- *Performance tests* at expected peak and headroom.
- *Compliance tests* for audit trail and explanations.
- *Production monitoring:* hit rates and overturn rates by rule to catch drift.

Automate as much as possible, since rules change frequently.

### Q4.5.5 [Conceptual] How do you use feature flags and canary releases?

Feature flags separate deploying code from releasing a feature, so you can turn it on for specific users and off quickly. Canary releases send a small share of traffic to the new version and compare its metrics with the old one before expanding. Together they reduce risk and enable experiments. Practices: flags with owners and expiry dates, kill switches for risky features, automated health checks that stop a rollout on bad metrics, and clean-up of old flags. For AI features, I tie flags to model and prompt versions.

### Q4.5.6 [Behavioral] QA and engineering disagree on release readiness. What do you do?

*Approach answer.*

I'd go back to the agreed release criteria and see which are unmet, then look at the evidence rather than opinions: open defects by severity, test coverage, risk to users. I'd facilitate a short conversation so each side states the risk and what would make them comfortable. Options: fix the blocker, release with a limited rollout and monitoring, or delay. I'd make a recommendation based on customer impact and reversibility, get the accountable stakeholders to decide, and document it. Afterward, I'd check whether the criteria need to be clearer so the same debate doesn't recur.

### Q4.5.7 [Technical] How do you handle test data when real data is PHI?

Prefer **synthetic data** that mimics the structure and edge cases of real data without any real person's information. If real data is needed, use **de-identified data** (using an approved HIPAA method) in a controlled environment with access limits and logging, or a limited data set under agreements. Mask or tokenize identifiers consistently so relationships are preserved. Keep production PHI out of lower environments, delete test data after use, and have privacy review the approach. Maintain a library of reusable test scenarios, including edge cases such as late-arriving data and duplicates.

### Q4.5.8 [Experience] Tell us about shifting testing left in a team you led.

*Real story: Story 11.*

On the online store work, testing happened late and regression effort was heavy. My task was to move quality earlier. I introduced standardized engineering practices, increased automated test coverage from 50 percent to over 85 percent, adopted CI/CD with feature toggles and MVP-based delivery, and worked with QA to design functional validation strategies. First-time-pass rate rose from 93 to 96 percent, regression effort fell from about 70 hours to under five, and development cycles shortened from 2 to 4 weeks to 1 to 2 weeks. I also wrote acceptance criteria and test scenarios with stories so tests were planned before development.

### Q4.5.9 [Conceptual] What is contract testing and when is it valuable?

Contract testing checks that the interface between a service that provides an API and the services that consume it matches an agreed contract, without needing to run everything together. Consumers publish the expectations they rely on; the provider verifies it still meets them on each change. It is valuable when many teams or external parties depend on an API, when end-to-end tests are slow and flaky, and when you want to release services independently. It catches breaking changes early and supports API versioning discipline.

### Q4.5.10 [Experience] How have you included integration testing and automation in acceptance criteria?

*Real story: Story 2 and Story 11.*

On the platform integration modernization, I authored product specifications and acceptance criteria that included functional validation strategies with QA, and automated release validation, regression testing and deployment through CI/CD; migrated integration workflows had to pass regression suites before release. On the online store work, acceptance criteria and test scenarios were written with stories, and automated test coverage rose from 50 percent to over 85 percent. A typical criterion: "Given an integration workflow migrated to the new framework, when the regression suite runs, then results match the previous version for the agreed data set, and the pipeline deploys without manual steps."

## A4.6 Security, privacy and compliance engineering

### Q4.6.1 [Technical] How do you make products secure by design when you are not a security specialist?

**Framework: STRIDE threat modeling plus security acceptance criteria.**
1. At discovery, ask security to run a **threat modeling** session on the design. STRIDE covers spoofing, tampering, repudiation, information disclosure, denial of service and elevation of privilege.
2. Classify the data (PHI, confidential) and define who can access it.
3. Turn findings into **requirements and acceptance criteria**: authentication, authorization, encryption, input validation, logging, rate limits, secrets handling.
4. Include security checks in the pipeline (dependency and secret scanning, penetration test before major launches).
5. Treat security defects with severity-based SLAs.
6. Review incidents and findings to improve.

My role is to bring security in early, fund the work in the plan and make trade-offs visible.

### Q4.6.2 [Technical] What are the HIPAA de-identification methods and when would you use each?

HIPAA recognizes two. **Safe Harbor** removes 18 categories of identifiers (such as names, geographic detail smaller than a state with limited exceptions, dates other than year, contact numbers, record numbers) and requires no actual knowledge that remaining information could identify someone. It is simple and rule-based but can strip useful detail such as dates. **Expert Determination** has a qualified statistical expert determine and document that the risk of re-identification is very small, which can preserve more utility (for example, dates or finer geography) under controls. Use Safe Harbor when the use case can live without those details and you want simplicity; use Expert Determination when analytic value depends on richer data. In both cases keep governance: access controls, purpose limits and re-identification prohibitions.

### Q4.6.3 [Conceptual] What is zero trust and how does it affect service design?

Zero trust means no user, device or service is trusted by default, even inside the network. Principles: **verify explicitly** (strong identity and context for every request), **use least privilege** (minimal, time-bound access) and **assume breach** (segment, monitor, limit blast radius). For service design: authenticate services to each other (mutual TLS, workload identities), authorize every call, avoid broad network trust, encrypt everywhere, log and monitor continuously, and design for containment. For agents that call tools, each agent needs its own identity and narrowly scoped permissions.

### Q4.6.4 [Technical] How should agents authenticate and what permissions should they have?

Each agent should have its own **service identity** (not a shared admin account), issued by the enterprise identity provider, with credentials stored in a secrets manager and rotated. Permissions follow **least privilege**: read-only to start, scoped to specific tools and data fields, time-bound where possible. When acting for a user, use delegated authorization so the agent can only do what that user may do. Separate permissions by risk level (read, draft, write, financial). Require explicit approval for high-risk actions. Log all calls with identity and purpose. Test for over-permissioning with red-team scenarios, and provide a kill switch.

### Q4.6.5 [Experience] Tell us about a security finding that affected a release. What did you do?

*Approach answer. No documented instance.*

I don't have a specific finding documented to quote accurately. How I handle one: understand the severity and exploitability with the security team, decide whether it blocks release (critical and high usually do), and look for the fastest safe fix or compensating control. I'd communicate the impact on the date to stakeholders with options, and add a regression test so the issue can't return. After release, I'd review how it got through and what earlier check would have caught it. In my releases, I built validation and regression testing into automated pipelines to catch issues sooner. (If you have a real case, use this structure.)

### Q4.6.6 [Conceptual] How would you build resilience into a product after the industry's major cyber incidents?

Map critical dependencies and single points of failure; define RTO and RPO per tier and test recovery regularly; use redundancy across zones and regions where justified; keep immutable, offline backups; segment networks and limit privileges to contain breaches; maintain incident response runbooks and practice them; plan fallbacks for critical flows (alternative routes if a clearinghouse or vendor is down); monitor continuously; and review third-party risk. Treat resilience as a feature with owners, metrics (recovery time, drill results) and roadmap items. The 2024 Change Healthcare incident showed the industry-wide impact of a central point of failure.

### Q4.6.7 [Behavioral] Security demands controls that slow delivery. How do you handle it?

*Approach answer with evidence from Story 11.*

I'd look for the risk behind the control and ask how we can meet it with less friction, usually by automating. Options: automate security checks in the pipeline, use pre-approved patterns and templates so teams don't need case-by-case review, apply controls by risk tier, and schedule reviews early. I'd quantify the delay and the risk so the trade-off is explicit, and escalate only if we can't agree. In my experience with CI/CD and automated testing (Story 11 and Story 2), automation made stricter quality gates possible while cutting regression effort from about 70 hours to under five and release preparation from days to hours.

### Q4.6.8 [Technical] What audit logging do you require for a platform handling PHI?

Log **who** (user or service identity), **what** (action, resource, record identifiers or hashes), **when** (timestamp), **where** (source system or IP), **why** (purpose or request context where available) and **outcome** (success or failure). Include access reads, changes, exports, permission changes, authentication events and administrative actions. Protect logs: write-once or tamper-evident storage, restricted access, encryption, clock synchronization, retention aligned with policy (HIPAA requires documentation retention for six years in many cases; follow your compliance team), and regular review and alerting for unusual access. Avoid putting PHI itself into logs beyond what is necessary.

### Q4.6.9 [Experience] How have you managed vendor or third-party risk in a product?

*Approach answer with real evidence from Story 5 and Story 4.*

I haven't run a formal vendor risk program, but I have built products on third-party services, such as Azure OpenAI and vector databases in Story 5 and a hosted language model in Story 4. In those projects I worked within the client's approved services, built guardrails and validation around model outputs, and included reviewers and SME sign-off. For a healthcare setting, I'd add: security and privacy review of each vendor, business associate agreements where PHI is involved, data flow diagrams showing what leaves our boundary, contractual commitments on data use and retention, exit plans, and ongoing monitoring of vendor performance and incidents.

### Q4.6.10 [Conceptual] What does policy as code mean for compliance?

Policy as code expresses rules (who can deploy what, which configurations are allowed, which data can be stored where) in machine-readable form, enforced automatically in pipelines and runtime (for example admission controls in Kubernetes, infrastructure checks before deployment). Benefits: consistent enforcement, immediate feedback to developers, version-controlled and reviewable policies, automatic evidence for audits, and less manual gatekeeping. It works best when policies are clear and tested, with an exception process for legitimate edge cases.
