## A2.4 Machine learning and data science

### Q2.4.1 [Conceptual] How do you decide whether a problem needs machine learning?

**Framework: use-case fit test (decision, data, baseline, value).**
1. **Decision:** what decision or action will the prediction change, and who takes it?
2. **Data:** do we have enough relevant, labeled or observable history, and the right to use it?
3. **Baseline:** would simple rules, a lookup or a heuristic do almost as well? Always build the simple baseline first.
4. **Pattern:** is there a learnable, stable pattern that humans can't easily write down as rules?
5. **Value and cost:** is the improvement over baseline large enough to pay for building, running and monitoring a model?
6. **Risk:** can errors be tolerated or caught by review?

If rules solve it, use rules. If the pattern is too complex for rules and the decision is worth enough, use ML. I also require a plan for monitoring and retraining before I commit.

### Q2.4.2 [Technical] Which metrics would you use for a model that prioritizes claims for audit, and why?

**Clarifying questions:** What is the review capacity? What counts as a positive (validated overpayment upheld after dispute)? How rare are positives? What is the cost of a false positive (provider friction, reviewer time)?

**Assumptions (illustrative):** 1,000,000 claims in the pool; 2 percent truly recoverable (20,000); reviewers can handle 10,000 reviews a month; average net recovery of $120 per validated finding.

**Framework: rank-based metrics tied to capacity.**
- *Baseline (random review):* 10,000 × 2 percent = 200 hits, worth 200 × $120 = $24,000.
- *Model with precision at top 10,000 of 18 percent:* 10,000 × 18 percent = 1,800 hits, worth $216,000. Lift = 18 percent / 2 percent = 9 times. Recall at K = 1,800 / 20,000 = 9 percent.
- *Sanity check:* precision at K matters more than overall accuracy because only the top-ranked claims get reviewed, and overall accuracy would be about 98 percent even for a model that flags nothing.

**Metric set:** precision at K, lift versus random, recall at K, recovered dollars per reviewer hour, upheld rate after dispute (overturn rate), false-positive burden on providers, calibration (do scores mean what they say), and fairness checks across provider types. **Recommendation:** optimize recovered dollars per reviewer hour subject to guardrails on overturn rate and provider dispute rate.

### Q2.4.3 [Experience] Describe how you partnered with data scientists. How did you handle disagreements?

*Real story with approach: Story 1 and Story 3 (partnership documented); disagreement is an approach answer.*

On the solver, I partnered with the data science team to evaluate AI-assisted parameter tuning that improved convergence and reduced manual configuration, and to test an AI explanation layer in pilot evaluations, where interpretation effort dropped by about 50 percent. My task was to define what success looked like for users, not for the model. I wrote the problem in user terms (planners can understand and act on results), agreed measures like effort reduction, and made sure the data scientists had realistic data and access to planners. When we disagreed, which is normal, I tried to settle it with evidence: define the test, run it, look at results together. My general rule is that data scientists own the methods and I own the problem, the users and the success criteria, and we meet on the metrics.

### Q2.4.4 [Conceptual] What is the cost of false positives versus false negatives in healthcare operations?

It depends on the process, so I start by costing each error type.
- **Payment integrity audit:** a false positive wastes reviewer time and creates provider friction and disputes; a false negative is a missed overpayment. If review capacity is limited, false positives crowd out true findings.
- **Fraud detection:** false positives can inconvenience legitimate providers or delay payment; false negatives allow loss.
- **Clinical risk models:** a false negative can mean a patient in need isn't contacted; a false positive can mean unnecessary outreach cost.
- **Coding compliance:** a false negative can leave an unsupported code in place and create audit exposure.

I assign a dollar or time cost to each error type, with compliance and relationship effects noted, and choose the threshold that minimizes expected cost, then validate it with operations leaders. Thresholds are revisited as capacity and priorities change.

### Q2.4.5 [Technical] What is MLOps and which parts must a product manager care about?

MLOps is the set of practices to build, deploy, monitor and maintain machine learning models reliably: data pipelines, feature management, experiment tracking, model versioning, deployment (CI/CD for models), monitoring for drift and performance, and retraining. A PM should care about: **reproducibility** (can we recreate this model), **deployment cadence** (how fast can improvements ship), **monitoring** (will we know when quality drops), **retraining triggers and cost**, **latency and scaling requirements**, **auditability** (which model version made a decision), and **ownership** (who is on call). I'd put monitoring and retraining costs in the business case and require a rollback path.

### Q2.4.6 [Conceptual] How do you test a model for bias across populations?

1. Define which groups matter for the use case and what data is lawfully available to evaluate them.
2. Check data representativeness: are all groups present in training and test data in meaningful numbers?
3. Compute performance metrics (error rates, calibration) by group, and compare them using agreed fairness definitions, understanding they can conflict.
4. Investigate gaps: data quality, labeling bias, proxies for sensitive attributes.
5. Mitigate: rebalance data, adjust thresholds, add features, or limit use to where performance is adequate; document trade-offs.
6. Monitor after launch, since populations and behavior shift.

For healthcare, I'd involve clinical and compliance experts and consider whether the model's action could affect access to care. I'd put results in the model card and review them at launch and periodically.

### Q2.4.7 [Experience] Tell us about a model that performed well offline but failed in production.

*Approach answer. No documented instance.*

I don't have a documented case of that exact failure in my records, so I'll describe how I would diagnose and prevent it. Offline-to-production gaps usually come from data shift (production inputs differ from the test set), workflow mismatch (users do not act on the output as assumed), latency or integration limits, or label leakage in training. My response is: compare production inputs and outputs to the test set, sample failures with users, check whether the output reaches the right person at the right time, and fix the biggest cause first. To prevent it, I run shadow mode before launch and include real users in evaluation. My GenAI projects used expert validation before launch for this reason; the scientific assistant was approved by the client's scientists, and the pharma platform ran repeated user acceptance testing with reviewers. If you have a true example, replace this one.

### Q2.4.8 [Technical] How would you source and manage expert-labeled data (coders, nurses)?

**Clarifying questions:** Which task and label definitions? How many labels? What accuracy is needed? Who can access the data and under what privacy rules?

**Assumptions (illustrative):** 3,000 cases for an evaluation set, 6 minutes per case, 2 independent labelers per case, 15 percent need adjudication at 10 minutes each, labeler cost $40 per hour.

**Framework: guidelines, sampling, agreement, adjudication.**
- *Effort:* 3,000 × 6 minutes = 18,000 minutes = 300 hours per labeler; two labelers = 600 hours. Adjudication: 15 percent × 3,000 = 450 cases × 10 minutes = 4,500 minutes = 75 hours. Total about 675 hours, or about $27,000 at $40 per hour.
- *Process:* write labeling guidelines with examples; pilot on 100 cases; measure inter-rater agreement and refine; stratify the sample across plans, code families and difficulty; use a secure labeling tool in a controlled environment; adjudicate disagreements with a senior reviewer; track labeler quality; refresh the set periodically.
- *Sanity check:* the cost is small relative to the cost of launching an unvalidated model, so expert labeling is worth funding first.

**Recommendation:** treat the labeled set as a product asset with an owner, version and refresh schedule.

### Q2.4.9 [Behavioral] How do you communicate model uncertainty to operations leaders?

I use plain language and decisions, not statistics. I'd say "for claims scored in the top band, about 18 out of 100 will turn out to be real findings; for the next band, about 8 out of 100" and show what that means in reviewer hours and dollars. I'd offer a simple rule for action by band, show how performance varies by segment, say what I'm not sure about, and show how we'll monitor. I avoid false precision, share examples of good and bad predictions, and agree with leaders on the threshold that fits their capacity. I update them regularly with real results so trust builds on evidence.

### Q2.4.10 [Experience] Describe how you evaluated emerging AI capabilities and decided what to adopt.

*Real story: Story 12 and Story 10.*

At my current company I designed a portfolio of internal AI products (bug documentation, work-item enrichment, root-cause analysis, document generation) after identifying the workflows with the most manual effort. For each, I defined the baseline, built a focused version, and measured the change: manual bug documentation effort fell 90 percent, root-cause analysis went from days to minutes, and documentation from days to one or two hours. For the insurer work (Story 10), I assessed GitHub Copilot across the delivery lifecycle and adopted it with coding standards after seeing sprint efficiency up 25 to 30 percent. My adoption rule: time-boxed pilot on a real workflow, a baseline, a quality check, and a go or no-go decision based on measured results, not demos.

## A2.5 AI infrastructure and platforms

### Q2.5.1 [Conceptual] How is an enterprise AI runtime platform a product, and who are its customers?

It's a product because it has users with needs, a roadmap, service levels, onboarding, support and a cost model. Its customers are internal engineering teams building AI applications and agents, plus the security, governance and finance functions that depend on it. Their job to be done is "get an AI workload into production safely and quickly without becoming infrastructure experts". I'd define the value in their terms: time to first workload, time to first agent, reliability, cost transparency, and compliance by default. Key product decisions are the service catalogue, tiers, self-service experience, documentation and pricing or showback. I'd measure adoption, satisfaction and utilization. The product boundary matters too: it provides runtime and agent execution services, while enterprise model approval and policy stay with governance teams.

### Q2.5.2 [Technical] Explain how GPU capacity should be managed across many teams.

**Clarifying questions:** Which workloads (real-time inference, batch, fine-tuning)? Demand per team and growth? Latency targets? Self-hosted models or managed APIs? Budget and procurement lead times?

**Assumptions (illustrative):** self-hosted 70-billion-parameter-class model serving internal applications; 2 million requests a day; peak hour carries 10 percent of daily traffic; average request 2,000 input and 500 output tokens; a GPU in a well-batched, quantized setup produces about 300 output tokens a second (planning figure); GPU all-in cost $2.50 an hour.

**Framework: demand, supply, utilization, allocation.**
- *Peak demand:* 2,000,000 × 10 percent = 200,000 requests in the peak hour = 55.6 per second. Output tokens needed: 55.6 × 500 = 27,800 per second.
- *GPUs needed at peak:* 27,800 / 300 = 92.7. Add 30 percent headroom for spikes and failures: 92.7 × 1.3 = 120.5, which rounds up to 128 GPUs (16 nodes of 8).
- *Average utilization:* an average hour carries 1/24 = 4.2 percent of daily traffic versus 10 percent at peak, a ratio of 2.4. Average need is about 93 / 2.4 = 39 GPUs, so provisioned capacity averages about 39 / 128 = 30 percent utilization. *Sanity check:* low average utilization is the real cost problem.
- *Cost if fully provisioned:* 128 × 8,760 hours × $2.50 = about $2.8 million a year.

**Management approach:** quotas and priority classes per team; a shared pool with autoscaling; reserve baseline capacity and burst to cloud; run batch and fine-tuning jobs off-peak; right-size models (smaller models for simple tasks); use quantization and batching; showback or chargeback reports; and a quarterly demand forecast with teams.

**Recommendation:** provision for steady load plus a modest buffer, burst to cloud for peaks, and track utilization and cost per thousand requests as core platform KPIs.

### Q2.5.3 [Technical] What do you need to decide when offering model serving and inference as a service?

- **Model catalogue:** which approved models, sizes and versions; who adds them.
- **Service tiers:** latency and throughput guarantees (for example interactive tier with p95 under a target, batch tier with relaxed latency), mapped to price.
- **SLOs and error budgets:** availability, latency, error rate per tier.
- **Scaling and capacity:** autoscaling rules, minimum replicas, quotas.
- **Security and isolation:** tenant isolation, network controls, data handling, logging with PHI controls.
- **Observability and cost:** per-tenant usage, tokens, cost and quality telemetry.
- **Versioning and change:** deprecation policy, canary releases.
- **Interfaces:** consistent APIs across models and clouds.
- **Support model:** onboarding, documentation, incident response.

I'd start with two tiers and a small catalogue, publish SLOs, and expand based on demand.

### Q2.5.4 [Conceptual] How would you abstract differences between private cloud, Azure, AWS and GCP for consumers?

Offer consumers a **consistent interface** and hide the infrastructure: a common deployment spec (containers on Kubernetes or OpenShift), a standard model-serving API, infrastructure as code templates, common identity and policy, shared observability, and a service catalogue where users choose a capability (for example "interactive inference, tier 1") and a data classification, not a cloud. The platform places the workload according to policy (data residency, cost, GPU availability) and handles differences underneath. Costs of abstraction are lowest-common-denominator features and extra platform work, so I'd abstract the common 80 percent and allow documented escape hatches for cloud-specific services where they add clear value.

### Q2.5.5 [Technical] What are your criteria for comparing managed AI platforms such as Azure AI Foundry, Bedrock, Vertex AI and Databricks?

**Framework: weighted criteria matrix.**

| Criterion | Questions to ask |
|---|---|
| Models | Which models and versions, and how fast are new ones available? |
| Agents and tools | Agent building, tool connectivity, orchestration, evaluation tooling |
| Data integration | Fit with existing data platform and governance |
| Security and compliance | Private networking, encryption, HIPAA support, audit |
| Governance | Model approval, content filters, monitoring hooks |
| Cost | Pricing model, committed use, unit economics |
| Portability | Lock-in, open standards, ease of switching |
| Operations | SLAs, quotas, regional availability, support |
| Team skills | Existing expertise and ecosystem |

Weight the criteria with stakeholders, score each platform with proofs of concept on real workloads, and recommend. For an enterprise with hybrid needs I'd standardize on a small number of platforms and keep a model gateway so applications don't depend on one provider.

### Q2.5.6 [Experience] Describe a platform you launched. What was your time-to-first-success metric and how did you improve it?

*Real story with caveat: Story 2 (platform modernization). Time-to-first-success was not a documented metric.*

On the enterprise platform (Story 2), I led the product side of modernizing APIs and developer infrastructure to cloud-native services for more than 200 customers. My task was to make it scalable and easier to adopt. I built reusable integration accelerators, designed learning programs and training content for more than 3,000 global users, and automated release validation and deployment so release preparation went from days to hours. Concurrent users grew from 40 to more than 1,000 and API-related production issues fell 90 percent. I didn't track a formally named time-to-first-success, but accelerators and training were aimed at that, and for an AI runtime I'd define it explicitly: time from request for access to first successful workload in production, targeted at days instead of weeks, and I'd improve it with templates, self-service onboarding and automated approvals.

### Q2.5.7 [Behavioral] Teams complain the platform is too restrictive. How do you balance guardrails and freedom?

*Approach answer.*

I'd listen to which restriction hurts and why, and look at the data: which requests are blocked, how often, and what the approval time is. Then I'd separate guardrails that protect against real risk (security, data, cost) from friction that is only habit. **Principle: paved roads, not walls.** Offer a golden path that is fast and safe by default, automate approvals for low-risk requests, provide a clear exceptions process with an owner and an SLA, and publish the reasons for each control. Where a control is justified, I'd explain it; where it isn't, I'd change it. I'd measure developer satisfaction and time to approval, and review controls quarterly.

### Q2.5.8 [Technical] What would you put in a service catalogue entry for an agent runtime?

- **Name and purpose:** what it does and who it's for.
- **Capabilities:** supported frameworks, models, tool connectors, memory options.
- **How to start:** onboarding steps, templates, sample code, expected time to first agent.
- **Service tiers and SLOs:** availability, latency, concurrency, support hours.
- **Limits and quotas:** requests, tokens, tool calls, run time.
- **Security and compliance:** data classifications allowed, identity model, logging, approvals required.
- **Governance integration:** model access rules, evaluation requirements, human-oversight options.
- **Pricing or showback:** unit costs and how usage is measured.
- **Observability:** traces, dashboards, alerts available.
- **Owner and support:** contacts, escalation path, roadmap and deprecation policy.

### Q2.5.9 [Conceptual] What is FinOps and how does it apply to AI workloads?

FinOps is the practice of managing cloud and infrastructure spend with shared accountability between engineering, finance and product. It rests on visibility (tagging and reporting), optimization (right-sizing, commitments, scheduling) and operations (budgets, alerts, regular reviews). For AI workloads it applies strongly because costs are large and variable: GPU hours, tokens, storage and evaluation. Practices: tag every workload by team and use case; track unit costs (cost per thousand requests, per resolved task); set budgets and anomaly alerts; right-size models and use routing; schedule batch jobs off-peak; and show teams their costs through showback. For a platform product, FinOps data goes into the pricing model and the business case.

### Q2.5.10 [Conceptual] Where does your platform's responsibility end and enterprise governance begin?

The platform provides **runtime and operational capabilities**: executing agents and models, scaling, observability, tool connectivity, and the hooks to enforce policy. Enterprise governance owns **policy and approvals**: which models are approved, Responsible AI standards, risk tiers, and data access policies. The platform integrates with those decisions (for example, only approved models appear in the catalogue; policy checks run at deployment) but does not duplicate or override them. I'd document this in a responsibility matrix (RACI), define integration points and SLAs between teams, and review it regularly so gaps and overlaps are caught early. Consuming teams own their business logic and outcomes.

## A2.6 AI-enabled productivity tools and practices

### Q2.6.1 [Experience] How do you use AI in your own PM workflow today? Give a specific example with a result.

*Real story: Story 12 (AI Product Management Assistant and document generator).*

I designed an internal AI productivity assistant that supports PRD creation, user-story generation, roadmap drafting, release notes, customer communication and product documentation. My task was to cut the time spent on first drafts so I and my team could spend more time with customers and on decisions. I also built a functional design document generator that produces full design documents, work-item features and wiki pages with stakeholder approval workflows, and documentation effort fell from several days to one or two hours. The rule I follow: AI drafts, I decide. I check drafts against sources, engineers review technical content, and nothing is shared that I haven't read closely. I also only use approved tools with approved data.

### Q2.6.2 [Conceptual] What data must never go into a non-approved AI tool, and how do you enforce it?

PHI and other personal data, customer confidential information, unreleased financial or strategy information, credentials and secrets, source code that is not approved for external tools, and anything covered by a contract or NDA restrictions. **Enforcement:** an approved tool list with data classifications per tool; technical controls (data loss prevention, network controls, enterprise accounts with data protections); training with clear examples; a simple rule ("if you wouldn't email it externally, don't paste it"); and monitoring with a no-blame reporting path. I model the behavior myself and include the rule in team onboarding.

### Q2.6.3 [Experience] Describe how you validate AI-generated user stories or acceptance criteria.

*Real story with approach: Story 12, Story 10.*

With my internal PM assistant and the design document generator (Story 12), the AI produces first drafts. My validation steps: check each story against the source requirement and the user problem; confirm acceptance criteria are testable and include edge cases, error handling and non-functional needs; check consistency with the architecture and existing rules; have an engineer and a tester review; and track rework, meaning how many stories change after review. On the insurer project (Story 10), AI-assisted unit tests and business validation were part of a quality process with coding standards. I measure usefulness by the share of drafts accepted with minor edits and by defects traced to requirements.

### Q2.6.4 [Behavioral] A teammate shares an AI-written summary that contains an error. How do you handle it?

*Approach answer.*

I'd correct it quickly and quietly, in a way that protects the teammate: message them privately with the specific error and the correct source, and ask them to reissue it if it has gone out widely. If it affected a decision, I'd flag that to the decision-maker. Then I'd fix the process, not blame the person: agree on a review step for AI-generated content, such as source links for every key claim, a quick check of numbers against the system of record, and a named reviewer. I'd share the lesson with the team as a general reminder. AI is a fast drafter, and accountability stays with the person who sends it.

### Q2.6.5 [Technical] How would you set up quality checks for AI-assisted recurring reports?

**Framework: source, sample, sign-off, log.**
1. **Source traceability:** every figure and theme links back to the underlying data or review.
2. **Automated checks:** totals reconcile to the source, date ranges are right, no missing segments, and numbers fall within expected ranges.
3. **Sampling:** a human checks a random sample of summaries and themes each cycle (for example 10 percent), with a higher rate for new report types.
4. **Sign-off:** a named owner reviews before publication.
5. **Error log:** track errors, causes and fixes; set a target error rate.
6. **Change control:** any change to prompts or data sources triggers a re-test.
7. **Documentation:** a short process description so others can run and audit it.

This mirrors what the voice-of-customer reporting role needs: documented processes and quality checks so AI-assisted outputs are accurate, traceable and appropriate for stakeholders.

### Q2.6.6 [Experience] Tell us about a process you automated to free up time for higher-value work.

*Real story: Story 11 (registration automation) and Story 12.*

In the online store registration case (Story 11), registration took about 24 hours for existing customers and 48 for new ones, with manual work across Sales, master data and the service desk. I automated account identification, verification and mapping with approval workflows and analytics. Existing-customer registration dropped to under a minute and new-customer onboarding to about 30 minutes, across about 12,000 annual registrations. Teams moved from manual lookups to handling exceptions. In Story 12, AI tools cut manual bug-documentation effort by 90 percent and document creation from days to one or two hours. The projected savings of about 20,000 person-days in Story 11 is a projection.

### Q2.6.7 [Conceptual] How can Copilot-style tools change the role of a product manager?

They shift time from producing documents to making decisions and working with people. First drafts of PRDs, stories, release notes, meeting summaries and analysis get faster, so a PM can spend more time on discovery, customers, strategy and alignment. The risk is shallow work: polished documents with weak thinking, over-reliance, and errors that go unchecked. The PM's differentiators become judgment, problem framing, prioritization, stakeholder trust and domain knowledge. I expect teams to expect faster cycles and more evidence. My own practice is to use AI for drafts and analysis, keep accountability for correctness, and reinvest saved time in customer conversations.

### Q2.6.8 [Behavioral] How do you coach a team to use AI tools responsibly?

*Approach answer with evidence from Story 10.*

I set clear, short guidelines: approved tools only, data rules, always verify, and disclose AI help where it matters. I run hands-on sessions with real examples of good prompts, common mistakes and review habits. I build quality checks into the workflow (peer review, tests, source links), and I measure and share results so the team sees the benefits and the limits. On the insurer data-engineering work, we introduced coding standards for AI-assisted development, which kept quality consistent while sprint efficiency rose 25 to 30 percent. I encourage people to share what worked and what failed, and I treat mistakes as learning.

### Q2.6.9 [Experience] How do you measure productivity gains from AI tools credibly?

*Real story: Story 10.*

On the insurer data-engineering work, we measured against a baseline: estimated delivery effort fell from 4,091 to 3,082 hours, more than 1,000 hours saved, with sprint efficiency up 25 to 30 percent, developer productivity up about 25 percent, and 50-plus production features delivered across more than 300 data sources. I'm careful to say the hours figure is a reduction in estimated effort, not timesheets. My method: define the baseline before the change, compare like-for-like work, track both speed and quality (defects, rework), include the cost of the tool and of review time, and watch for gains that do not translate into delivered output. I avoid vanity metrics like lines of code or number of prompts.

### Q2.6.10 [Conceptual] How do you keep the roadmap tool the system of record while using AI drafting?

AI drafts, humans decide, and the tool records decisions. Practically: AI-generated text enters the roadmap tool only after a person reviews and edits it; the tool's fields (goal, initiative, feature, status, owner, dates) are the authority, and drafts live elsewhere until approved; changes are logged with the owner; and I avoid copy-pasting AI summaries over decision records. I keep unique IDs linking the roadmap tool to the delivery tool for traceability, and review hygiene weekly. If AI features inside the tool are used, I treat their output as suggestions with the same review step.
