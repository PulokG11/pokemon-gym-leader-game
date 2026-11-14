# A2. AI / Gen AI / Agentic AI / ML: Answers

## A2.1 Generative AI and LLMs

### Q2.1.1 [Conceptual] Explain how an LLM works to a non-technical executive, including why it can be wrong.

An LLM is a very large pattern-completion system. It was trained on a huge amount of text to predict the next word, and by doing that billions of times it learned grammar, facts, reasoning patterns and writing styles. When you ask a question, it doesn't look up an answer in a database. It generates the most likely sensible continuation, one piece at a time.

That is why it can be wrong. It is optimizing for plausible, not verified. If it doesn't have the right information, or the question is outside what it learned, it can produce a fluent answer that is false. That is called hallucination. It also doesn't know what it doesn't know, and it can be sensitive to how a question is worded.

The business answer is not to avoid it but to design around it: give the model the right documents to answer from (retrieval), require it to cite them, check outputs with rules and review, and keep humans accountable for high-stakes decisions. In my scientific assistant project, that combination delivered retrieval precision above 95 percent across more than 1,000 documents, and the client's scientists approved it.

### Q2.1.2 [Conceptual] When would you choose prompting, retrieval or fine-tuning?

**Framework: start simple, add complexity only when evaluation shows a gap.**
- **Prompting** (instructions, examples, structured output) is the fastest and cheapest. Use it first for tone, format and general tasks.
- **Retrieval (RAG)** is for knowledge that is private, specific or changes often, such as policies, benefits or product documents. It keeps answers grounded in current sources and allows citations and access control.
- **Fine-tuning** is for consistent style, specialized format or narrow behaviors that prompting cannot reach, or to use a smaller model cheaply at scale. It does not add reliable up-to-date facts.

Decision rule: if the failure is "doesn't know our facts", add retrieval; if it's "knows but behaves inconsistently", improve the prompt, then consider fine-tuning; if cost or latency is the issue at volume, consider a smaller fine-tuned model. I decide using a test set, not opinion.

### Q2.1.3 [Technical] Describe a RAG architecture and the main places quality is lost.

**Layered pipeline:**
1. **Ingestion:** collect documents, clean, split into chunks, attach metadata (document, version, plan year, line of business, effective dates, permissions).
2. **Indexing:** create embeddings and store in a vector index, often with a keyword index for hybrid search.
3. **Query understanding:** rewrite or expand the question, apply filters (for example plan and date).
4. **Retrieval and reranking:** fetch candidates, rerank for relevance.
5. **Generation:** prompt the model with the retrieved passages, instruct it to answer only from them and cite.
6. **Validation:** check that claims are supported, apply policy and format rules.
7. **Feedback and monitoring.**

**Where quality is lost:** poor parsing of tables and PDFs; chunks that split meaning; missing metadata filters so the wrong plan year is retrieved; retrieval that misses relevant passages; context overload; the model ignoring or misreading sources; stale content; and permissions leaks. I evaluate retrieval separately (is the right passage in the top results) from generation (is the answer correct and supported). In my scientific assistant, preprocessing, reranking and response validation were deliberate design elements.

### Q2.1.4 [Technical] How do you reduce hallucinations in a policy-answering assistant?

**Clarifying questions:** Who are the users and what are the consequences of an error? Which policies and how often do they change? Must answers cite the source?

**Assumption:** internal staff asking about medical and reimbursement policy; errors have compliance impact.

**Approach (defense in depth):**
1. **Ground** answers in a versioned policy corpus with metadata filters (policy, effective date, line of business).
2. **Require citations** to specific sections; no citation, no answer.
3. **Constrain** the model to answer only from retrieved text and to say "not found" when evidence is missing.
4. **Validate:** a second check that each claim is supported by the cited text; flag conflicts between policies.
5. **Evaluate** on a labeled question set with policy experts, tracking groundedness, citation accuracy and abstention behavior.
6. **Human review** for high-risk answer types and a thumbs-down feedback loop to fix content or retrieval.
7. **Governance:** content owners, update workflow and version control.

**Recommendation:** launch with citations visible and an expert review sample, and measure unsupported-claim rate weekly. My scientific assistant used guardrails, multi-prompt validation and expert validation, and the client's scientists formally approved it.

### Q2.1.5 [Experience] Tell us about a generative AI feature you shipped. What did you measure and what failed?

*Real story: Story 4 (scientific GenAI assistant).*

For a scientific-instruments client, customers had complex product questions and answers lived in static technical documents, so getting one could take hours. My task was to deliver a production GenAI assistant accurate enough for the client's own scientists to approve. I designed a retrieval-based architecture with a vector database, embeddings, document preprocessing, reranking and response validation, added responsible-AI guardrails and multi-prompt validation, and worked with the scientists to validate accuracy. We measured query resolution time, which fell about 60 times from hours to seconds, and average retrieval precision, which was above 95 percent across more than 1,000 documents. The client's scientists formally approved the assistant before it went live. I don't have a dramatic failure to report from that project. What I'd change today is the model: we used GPT-3.5, and I'd revisit that choice with current models, but the retrieval, validation and expert sign-off approach holds.

### Q2.1.6 [Conceptual] How do you choose between a large and small model for a task?

I match model capability to task difficulty and cost. A simple classification, extraction or routing task often works well on a small, fast, cheap model. Complex reasoning, long-context synthesis or open-ended writing may need a larger model. The decision uses an evaluation set: run candidates on real examples, compare accuracy, latency and cost per task, and pick the cheapest model that meets the quality bar. In production, use **routing**: a small model handles easy requests and escalates uncertain ones to a larger model. Also consider data residency, privacy requirements and vendor support. I revisit the choice regularly because models improve and prices fall.

### Q2.1.7 [Technical] What are the cost drivers of an LLM feature and how do you control them?

**Clarifying questions:** Volume per day? Latency tolerance? Required quality? Can answers be cached? Are there privacy limits on hosted models?

**Assumptions (illustrative, not Optum or vendor prices):** 50,000 calls a day (1.5 million a month); each call has 3,000 input tokens (system prompt 500, retrieved passages 2,000, question 500) and 400 output tokens; a mid-tier model at $3 per million input tokens and $15 per million output tokens; a small model at one tenth of those prices.

**Framework: unit economics per task.**
- *Baseline cost per call:* input 3,000 × $3 / 1,000,000 = $0.009; output 400 × $15 / 1,000,000 = $0.006; total $0.015. Monthly: 1.5 million × $0.015 = $22,500.
- *Lever 1, routing:* send 60 percent of calls to the small model: small cost per call = 3,000 × $0.30 / 1,000,000 + 400 × $1.50 / 1,000,000 = $0.0009 + $0.0006 = $0.0015. Blended = 0.4 × $0.015 + 0.6 × $0.0015 = $0.0069. Monthly: $10,350, a 54 percent reduction.
- *Lever 2, trim context to 2,000 input tokens:* large model: $0.006 + $0.006 = $0.012; small model: $0.0006 + $0.0006 = $0.0012. Blended = 0.4 × $0.012 + 0.6 × $0.0012 = $0.00552. Monthly: $8,280, about 63 percent below baseline.
- *Other levers:* caching static prompt prefixes and repeated questions, limiting output length, batching non-urgent work, and removing unnecessary calls.
- *Sanity check:* model cost here is small relative to people costs. The real cost can be engineering, evaluation, review and support, so I'd include those in the business case.

**Recommendation:** track cost per resolved task and set a budget alongside quality targets. Optimize routing and context first, as they give the largest savings with the least risk.

### Q2.1.8 [Conceptual] Where is generative AI a poor fit in healthcare operations?

It's a poor fit where the answer must be exactly right and can be computed: benefit math, claim pricing, eligibility lookups and accumulators should come from deterministic systems, with the LLM only explaining or retrieving. It is also a poor fit for autonomous high-stakes decisions without review, such as denying care or payment, and for tasks where you cannot verify outputs or lack data to evaluate them. It is risky where PHI would be sent to unapproved services, and where explainability requirements are strict and the model's reasoning cannot be audited. The pattern I use: LLMs for language tasks (summarizing, drafting, extracting, explaining) and rules or traditional models for calculation and decisions, with humans accountable for adverse outcomes.

### Q2.1.9 [Behavioral] A senior stakeholder wants an AI chatbot immediately because competitors have one. What do you do?

*Approach answer with real evidence from Story 5.*

**Framework: use-case fit test (task, data, risk, value).** I'd thank them for the urgency and turn it into a clear problem: which users, which questions, what outcome? Then I'd test fit: is the task language-heavy, do we have approved data to answer from, what is the risk of an error, and what is the value if it works? I'd propose a time-boxed pilot: 4 to 6 weeks, a narrow set of questions, grounded in approved sources with citations, measured against a baseline, with a go or no-go gate. That gives the stakeholder something visible fast and protects the organization from a risky launch. On the pharma content platform I used a 16-week MVP with reviewers inside the workflow, which delivered measurable results and avoided rework. Speed is achievable when scope and guardrails are clear.

### Q2.1.10 [Experience] Describe how you introduced AI-assisted work to a team skeptical of it.

*Approach answer with real evidence from Story 10 and Story 12. Your records do not describe the skeptics.*

On the insurer data-engineering work (Story 10), my task was to make GitHub Copilot a real part of the team's workflow without lowering quality. I took a lifecycle view across requirements, discovery, mapping, engineering, testing and business validation, introduced coding standards for AI-assisted work, and measured the effect. Sprint efficiency rose 25 to 30 percent and developer productivity rose about 25 percent; estimated delivery effort fell from 4,091 hours to 3,082. My general approach with skeptics is to start with a small pilot, let them set the quality checks, share early numbers and keep the decision reversible. I also built internal AI tools (Story 12), such as a bug documentation assistant that cut manual effort by 90 percent, which gave the team tangible, low-risk examples. If you have a specific skeptic, add who they were and what changed.

## A2.2 Agentic AI

### Q2.2.1 [Conceptual] What is the difference between a chatbot, a workflow and an agent? When do you use each?

- A **chatbot** answers questions in conversation, usually from a model and some retrieved content, with little ability to act.
- A **workflow** is a fixed sequence of steps (some may call a model) where the path is decided by the designer. It is predictable, testable and cheap.
- An **agent** is a model that decides which steps and tools to use to reach a goal, loops until done, and can handle variable paths.

**Decision rule:** if the path is known and repeatable, use a workflow; if users only need answers, use a chatbot with retrieval; if the task is multi-step, varies by case, and requires choosing among tools, use an agent. Many good systems are hybrids: a workflow skeleton with agentic steps where variability is real. Agents cost more, are harder to test and need stronger controls, so I use them only where the flexibility earns its keep.

### Q2.2.2 [Technical] How would you design a shared Payer Agentic Platform so each new agent launches faster than the last?

**Clarifying questions:** Which agents first? Who are the users? Which systems must agents call? What autonomy and compliance constraints apply? Scale and latency? Which teams will build agents on the platform?

**Assumptions (illustrative):** four agents at launch (benefit, pricing, policy, prior authorization), 20,000 internal users, 10 agent interactions per user per day.

**Framework: R-C-A-D-T.**
- *Requirements:* a shared way to build, test, deploy, run, govern and observe agents; reusable components; security and audit.
- *Capacity estimate:* 20,000 users × 10 = 200,000 interactions a day. Assume 10 percent in the peak hour = 20,000 an hour, about 5.6 a second. Assume each interaction makes 3 model calls: about 17 model calls a second at peak. *Sanity check:* a moderate load; the main constraints are cost, latency and tool reliability, not raw volume.
- *APIs and data:* an agent definition format (instructions, tools, policies, evaluation set); a tool registry with schemas, owners and permissions; a retrieval service with metadata filters; a session and memory store with PHI controls.
- *Design components:* orchestration runtime; model gateway (routing, rate limits, cost tracking, vendor abstraction); retrieval service; tool connectors to benefits, pricing, policy and case systems; guardrails and policy engine; evaluation harness with regression suites; observability (traces, cost, quality); identity and audit.
- *Trade-offs:* a shared platform speeds later agents but needs upfront investment and a strong product owner; opinionated defaults improve safety but limit flexibility; building versus using cloud agent services.

**Platform success metrics:** time to first agent, time to launch the Nth agent (should fall), reuse rate of components, evaluation pass rate, cost per resolved task.

**Recommendation:** build the platform around the first two agents, extract reusable pieces as they appear, and fix the evaluation harness and tool registry before scaling the number of agents.

### Q2.2.3 [Conceptual] What is an autonomy ladder and how do you decide when to promote an agent?

An autonomy ladder defines how much an agent may do without a person:
1. **Suggest:** the agent proposes, the person decides and acts.
2. **Draft:** the agent prepares the action, the person approves.
3. **Act with sampling:** the agent acts on low-risk cases; humans audit a sample.
4. **Act broadly:** the agent acts on most cases and escalates exceptions.

**Promotion criteria:** measured accuracy on a representative test set and in live shadow mode; error cost by case type; stable performance over a set period; reviewer override rate below a threshold; audit sampling results clean; compliance approval; a rollback path. Promote by case segment, not wholesale: for example allow auto-approval for criteria-clear authorizations while keeping adverse decisions at the "draft" level. Demote if quality drifts.

### Q2.2.4 [Technical] How do tool connectivity standards such as MCP change platform design?

The Model Context Protocol (MCP) is an open standard for connecting models and agents to tools and data sources through a consistent interface. For platform design it means: tools are built once as standard servers and reused by many agents and models, which cuts integration work; it separates tool ownership from agent logic, so system owners publish and secure their own tools; and it makes it easier to swap models or frameworks. It also raises governance needs: every tool needs an owner, a permission model, version control, rate limits and audit logs, and the platform needs a registry and approval process so agents only connect to approved tools. Prompt injection through tool outputs is a real risk, so outputs should be treated as untrusted. My recommendation is to adopt standards where they reduce lock-in, but keep a thin internal layer for security and observability.

### Q2.2.5 [Technical] When is a multi-agent design justified, and what are its costs?

**Justified when:** subtasks need different tools, contexts or permissions (for example a retrieval specialist, a pricing specialist and a reviewer); isolation improves security or reliability; parallel work saves time; or a single prompt becomes too large or confused. **Costs:** more model calls (higher cost and latency), more failure modes (handoff errors, loops), harder debugging and evaluation, and more governance. **Decision rule:** start with one agent plus tools; split only if evaluation shows a measurable gain in accuracy, latency or safety that outweighs the added cost. I would test both designs on the same evaluation set and choose using cost per successful task.

### Q2.2.6 [Experience] Tell us about an automation or agent you took from prototype to production. What broke?

*Real story: the defect-triage agent and internal AI suite (Story 12), updated with your attached document.*

Complex production defects at o9 could sit in triage for days. Activation took days because teams manually validated each issue, checked for duplicates and searched historical work items, and resolution averaged about 5.5 days. My task was to design AI products that removed that manual work. I built an agent that automates bug validation, duplicate detection, work-item enrichment and correlation with historical issues, alongside BugSense (diagnostics, logs and screenshots for bug reports), Bug Analyzer (root cause from telemetry and logs) and a functional design document generator. Manual bug documentation effort fell 90 percent, root-cause analysis went from days to minutes, and design documents went from days to one or two hours. Your attached document reports that Mean Time to Activate fell from days to hours and Mean Time to Resolve from 5.5 days to 1.5 days, though your resume lists the 5.5 to 1.5 figure as a target, so confirm which is right before quoting it. On what broke: I don't have a specific production incident documented, and I'd rather not invent one. What I do know is that production AI needs evaluation, guardrails and validation, which is why on the scientific assistant I used response validation and expert sign-off.

### Q2.2.7 [Technical] What should you log and trace for an agent run in a PHI environment?

**Log for each run:** run ID, user and agent identity, timestamps, model and version, prompt template version, retrieved document IDs (not full content where possible), tool calls with parameters and result status, outputs, guardrail decisions, latency, token usage and cost, and the final outcome including human feedback.

**PHI controls:** redact or tokenize PHI in logs; store full traces only in a restricted, encrypted store with short retention; role-based access with audit of who views traces; separate operational metrics (no PHI) from debugging traces (restricted); and a process for deleting data on request. **Why:** traces let you replay failures, measure quality and prove what happened to an auditor. I'd design this with privacy and security before the first launch.

### Q2.2.8 [Conceptual] How do you manage agent lifecycle: versioning, rollout, rollback and retirement?

Treat an agent as a versioned product made of prompt, tools, model, retrieval configuration and policies, all versioned together. **Build** with an evaluation set; **test** with a regression suite on every change; **approve** through risk-based governance; **release** gradually (internal users, then a small percentage, then full) with feature flags; **monitor** quality, cost and incidents with alerts; **roll back** to the prior version quickly if metrics breach thresholds; **update** on a regular cadence; and **retire** agents with low use or poor value, with notice and a migration path. Every version change is logged with its evaluation results. This mirrors how I ran platform releases in Story 2, with automated validation, regression testing and deployment.

### Q2.2.9 [Behavioral] An agent made a wrong recommendation that reached a customer. How do you respond?

*Approach answer.*

**Framework: contain, communicate, correct, prevent.**
1. **Contain:** disable or restrict the agent or the affected path immediately; identify other affected cases.
2. **Communicate:** inform leadership, compliance and the affected customer quickly and plainly; fix the customer's issue first.
3. **Correct:** trace the cause using logs (retrieval miss, bad source, prompt gap, tool error) and fix it.
4. **Prevent:** add the case to the regression suite, adjust thresholds or autonomy level, add a guardrail or review step, and record a post-incident review without blame.
5. **Report:** share lessons and metrics.

I'd also check whether the autonomy level was appropriate, and lower it if not. On my GenAI projects, validation steps and expert review were built in to reduce the chance of this reaching a customer.

### Q2.2.10 [Conceptual] Where do you expect agents to create the most value at Optum in the next two years, and why?

I'd rank by volume, rules-heavy work, measurable outcomes and manageable risk. First, **claims and payment integrity operations**: pre-submission checks, evidence assembly for audits, and complex claim adjudication; Optum has described agentic AI adjudicating complex Medicaid claims in seconds instead of days (company-reported). Second, **prior authorization**: assembling documentation and accelerating approvals, with clinicians reviewing denials. Third, **coding and documentation**: assisted coding and documentation gap detection, as Integrity One does. Fourth, **internal knowledge and service**: benefit, pricing and policy inquiry agents for staff. The common thread is high-volume administrative workflows where the cost of error is manageable and humans keep the final say. I would deprioritize fully autonomous clinical decision-making for now.

## A2.3 AI product lifecycle, evaluation and governance

### Q2.3.1 [Technical] Design an evaluation plan for a benefit-inquiry agent before launch.

**Clarifying questions:** Who asks (members, providers, staff)? Which plans and lines of business? Can the agent act or only answer? What accuracy is acceptable and what is the cost of an error? What systems hold the truth?

**Assumptions:** internal staff users; answers only; commercial and Medicare Advantage plans; source of truth is the benefit configuration system and plan documents; the bar is 95 percent correct on core questions with zero tolerance for fabricated coverage statements.

**Framework: evaluation pyramid (component, end-to-end, online).**
1. **Build the golden set:** real, de-identified questions across plans, benefits, years and edge cases (exclusions, limits, out-of-network, accumulators). Label correct answers with benefit experts.
2. **Estimate the sample size:** to estimate accuracy within plus or minus 3 percentage points at 95 percent confidence, assuming about 90 percent accuracy, n = 1.96² × 0.9 × 0.1 / 0.03² = 3.8416 × 0.09 / 0.0009, about 384 questions per segment. For three segments (commercial, Medicare, edge cases) that is about 1,150 questions.
3. **Component tests:** retrieval hit rate (is the right benefit text or record in the top results), tool-call correctness, citation accuracy.
4. **End-to-end tests:** answer correctness, groundedness (each claim supported by cited sources), correct abstention when data is missing, consistency across paraphrases.
5. **Safety tests:** prompt injection, requests for other members' data, out-of-scope questions.
6. **Segment analysis:** results by plan type, benefit category and question difficulty.
7. **Shadow mode:** run alongside experts for two to four weeks, compare answers.
8. **Online metrics after launch:** thumbs-down rate, escalation rate, expert spot checks, cost per task, latency (p95).
9. **Gates:** launch only if core accuracy meets the bar, there are no fabricated coverage statements in the test set, and abstention works; regression suite runs on every change.

**Recommendation:** launch to a pilot group with expert review of a sample, report accuracy by segment weekly, and expand only after two consecutive weeks within thresholds.

### Q2.3.2 [Conceptual] How does the AI product lifecycle differ from traditional software?

Traditional software behaves deterministically: if the code passes tests, the behavior is known. AI behavior is probabilistic and depends on data, so the lifecycle adds steps: data readiness and rights review, evaluation set design, threshold setting, bias and safety review, human-oversight design, shadow-mode piloting, ongoing monitoring for drift and quality, and retraining or prompt updates. Testing is statistical, not pass or fail. Releases need staged rollout and a rollback plan, and governance is risk-tiered. Costs also change: usage-based inference costs and evaluation labeling become part of the business case. In my GenAI work I treated expert approval and validation as launch gates, as with the scientific assistant approved by the client's scientists.

### Q2.3.3 [Technical] How do you use model-as-judge evaluation responsibly?

Model-as-judge means using one model to score another's outputs against criteria. Used well, it scales evaluation; used badly, it hides errors. **Practices:** write clear scoring rubrics; calibrate against human labels on a sample and report agreement; use a judge from a different model family where possible to reduce self-preference; randomize order for pairwise comparisons to avoid position bias; check for verbosity bias; keep human review for high-risk categories; re-calibrate when models change; and never use the judge as the only gate for safety-critical launch criteria. I'd report the judge's agreement with experts alongside every score.

### Q2.3.4 [Experience] Tell us about a time you set launch thresholds for an AI feature. How did you pick them?

*Real story with approach: Story 4 (scientific GenAI assistant) and Story 5 (pharma content platform).*

For the scientific assistant, the task was to reach accuracy the client's scientists would approve. We used retrieval precision as a core measure and reached an average above 95 percent across more than 1,000 documents, added response validation and multi-prompt checks, and kept validating with scientists until they gave formal approval. On the pharma content platform, the thresholds were tied to review outcomes: iterative user acceptance testing with medical, legal and regulatory reviewers, and quality metrics in the workflow; final testing showed 100 percent positive user feedback and about 70 percent of generated content rated useful. My approach to picking a threshold: start from the cost of an error and the current human baseline, set a minimum bar and a target, test on real examples, and let the domain experts decide what is good enough.

### Q2.3.5 [Conceptual] What is human-in-the-loop done well versus done poorly?

**Done well:** the human sees the evidence behind the AI's suggestion, can act with one or two clicks, has clear authority to override, and their corrections feed back into the system; the review load is sized to the team's capacity; reviewers are measured on quality, not only speed; and the system routes only uncertain or high-risk cases to people. **Done poorly:** the human is a rubber stamp reviewing hundreds of items without context; the interface hides the evidence; overrides are discouraged; or the review step exists only for compliance optics. A known risk is automation bias, where people accept suggestions without checking. I'd measure reviewer agreement and override rates, rotate samples for independent re-review, and design the interface to show reasons and uncertainty.

### Q2.3.6 [Conceptual] How would you build a Responsible AI process for a product team?

**Framework: NIST AI RMF (govern, map, measure, manage).**
- *Govern:* define principles, roles and an approval path by risk tier; name an accountable owner per AI feature.
- *Map:* write an intended-use statement; list data sources and rights; identify affected users and failure modes; classify risk.
- *Measure:* define metrics for accuracy, bias across relevant groups, safety, privacy and transparency; test before launch.
- *Manage:* human oversight design, monitoring, incident response, change control, user disclosure, and periodic review.

**Artifacts:** a model or system card, an evaluation report, a risk assessment, and a launch checklist. **Recommendation:** make it part of the normal delivery process with templates and automation, so teams do not experience it as a separate hurdle. Optum states it has a Responsible AI program across UnitedHealthcare and Optum; I'd align my team's process with it.

### Q2.3.7 [Behavioral] The governance board delays your launch. What do you do?

*Real story: the global pharma GenAI content platform (Story 5), from your attached document.*

On a GenAI content platform for a global pharma company, the tension was between speed and compliance. Generative AI could cut the time and cost of personalized marketing and medical content, but medical, legal and regulatory reviewers rightly worried about unapproved claims. My task was to get the platform live without weakening review. Instead of treating compliance as an end-of-project gate, I made it part of the architecture: generation was anchored to approved content and claims, reviewers sat inside the workflow, and guardrails, quality checks and iterative user acceptance testing ran every cycle. We kept a fast cadence of 16 weeks, eight sprints and three build-and-test cycles. The result was about 75 percent faster end-to-end content creation, 35 to 45 percent lower cost for selected activities, about 70 percent of generated content rated useful, and 100 percent positive feedback in testing. When a governance group delays a launch, I ask for the criteria in writing, prepare an evidence package, and propose a smaller or staged release that addresses the concern.

### Q2.3.8 [Experience] How have you shown the financial value of an AI initiative to finance leaders?

*Real story: Story 5 and Story 10, with an illustrative method.*

On the pharma content platform I built the business case and value framework: end-to-end content creation became about 75 percent faster and cost fell 35 to 45 percent for targeted activities, and the business case estimated about $34 million in annual savings and a wider potential above $220 million, which I always label as estimates. On the insurer data-engineering work, I tied results to hours: estimated delivery effort fell from 4,091 to 3,082 hours, more than 1,000 hours, with sprint efficiency up 25 to 30 percent.

**My method with finance:** agree the baseline, define benefit categories (cost avoided, capacity freed, revenue), separate identified from realized savings, use a control or before-and-after comparison, include run costs (inference, evaluation, support), and report payback. Optum leaders have described a conservative 2:1 return target, with many projects paying back in 12 to 18 months (company-reported), which is the lens finance will use.

### Q2.3.9 [Conceptual] What is your view on "no automated denials" as a product principle?

I think it's a sound principle for a high-stakes, regulated setting, with some nuance. AI that speeds up approvals and gathers evidence reduces burden without taking away clinical judgment, and requiring a clinician to review any adverse decision protects patients, supports compliance and builds trust. The nuance: "no automation of denials" should not become "no automation of anything"; clear-cut administrative denials (for example, ineligible member or missing required fields) are rules-based and different from medical necessity decisions. I'd define categories clearly: automate approvals and administrative checks, keep medical necessity denials with qualified reviewers, and make reasons transparent. I'd also measure whether the principle holds in practice, such as reviewer time per denial, to avoid rubber-stamping.

### Q2.3.10 [Technical] How do you monitor for model drift and when do you trigger retraining or rollback?

**Monitor:** input drift (changes in data distributions, new document types, new codes), output quality (accuracy on a refreshed labeled sample, groundedness, escalation and override rates), user feedback, latency and cost, and fairness metrics by segment. **Triggers (set in advance):** quality metric below the threshold for a set number of days; override rate above a limit; a new policy or code set; vendor model update. **Actions:** investigate; update the retrieval corpus or prompt; retrain or fine-tune if the issue is model behavior; roll back to the last good version if a breach threatens users; and log the decision. Run the regression suite on every change and keep the previous version deployable.
