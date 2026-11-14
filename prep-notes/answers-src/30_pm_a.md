# A3. Product Management: Answers

## A3.1 Strategy, vision and roadmap

### Q3.1.1 [Conceptual] What makes a product strategy good rather than just a list of features?

**Framework: Rumelt's strategy kernel (diagnosis, guiding policy, coherent actions).**
- A **diagnosis** names the real problem or opportunity, not a wish. ("Claims reviewers can't see why a claim was flagged, so disputes and rework erase savings" is a diagnosis; "build a dashboard" is not.)
- A **guiding policy** is the choice about how to deal with it, which also says what you will not do. ("Make every finding explainable and evidence-backed before expanding detection volume.")
- **Coherent actions** are the initiatives that reinforce each other and fit capacity.

A good strategy also has measurable outcomes, a clear customer and a reason you can win. A feature list fails the test if you can swap items without changing anything else, if it has no trade-offs, or if it can't be tied to a metric. On the solver I tied roadmap choices to three outcomes (speed, accuracy, trust), which is why runtime fell 65 percent, sourcing accuracy rose 40 percent and debugging effort fell 60 percent in the same product.

### Q3.1.2 [Experience] Walk us through a multi-year strategy you defined. How did you win leadership alignment?

*Real story: Story 1 (solver) with Story 15 for alignment practices.*

I own the strategy and roadmap for a solver product that grew above $5 million in ARR. The situation was a balance between customers asking for larger models and policy-faithful optimization, and the platform needing modernization. My task was to set a direction and investment priorities across customer requests, platform work and longer-term bets. I framed three outcomes (faster, more accurate, more trustworthy), built quarterly and annual roadmaps aligned with customer needs, market opportunity, engineering capacity and commercial goals, and presented to executive reviews with customer evidence from voice-of-customer work. Results: optimization runtime down 65 percent, scalability up 20 to 30 percent, sourcing accuracy up 40 percent, infrastructure cost down 35 percent. For alignment I use the same pattern each time: a short document with the diagnosis, options and trade-offs, pre-meetings with key stakeholders, and a decision log. In earlier consulting work I facilitated executive workshops that aligned multi-year digital transformation roadmaps.

### Q3.1.3 [Technical] How would you build a roadmap for a payment integrity platform serving several lines of business?

**Clarifying questions:** Who are the clients and users? What are today's biggest leakages and complaints? Which regulatory dates apply? What is the current architecture and team capacity? How is success measured and by whom?

**Assumptions:** a mature rules-based product with pre-pay and post-pay modules; commercial, Medicare Advantage and Medicaid lines; 2 to 3 engineering squads; pressure to add AI and real-time capability; goal of higher realized savings with lower provider friction.

**Framework: strategy kernel + three horizons + WSJF for sequencing.**
- *Diagnosis:* savings identified are being eroded by disputes and rework; rule changes are slow; clients need configuration without custom builds.
- *Guiding policy:* make every finding explainable, move checks earlier (pre-pay), and run one configurable platform across lines of business.
- *Roadmap (horizons):*

| Horizon | Theme | Examples | Outcome metric |
|---|---|---|---|
| Now (0 to 6 months) | Foundation and trust | Evidence and explanation on every finding; rule simulation and rollback; overturn-rate dashboard | Overturn rate, provider disputes |
| Next (6 to 12 months) | Earlier and smarter | Pre-pay expansion; ML-based prioritization of reviews; configuration layers by line of business | Realized yield, yield per reviewer hour |
| Later (12 to 24 months) | Autonomous assist | AI-assisted evidence assembly; real-time provider exchange; client self-service rule authoring | Cycle time, automation rate, time to onboard a client |

- *Prioritization:* regulatory dates first (fixed-date items); then WSJF across the rest; reserve about 20 percent for platform health.

**Recommendation:** start with explainability and rule management because they raise realized savings and are prerequisites for AI. Publish a roadmap with outcomes per horizon and review it quarterly with finance and compliance.

### Q3.1.4 [Conceptual] How do you balance platform stability, new capabilities and incremental workflow improvements?

I use a **capacity allocation** model agreed with leadership instead of re-arguing each quarter. A starting split (adjusted by context) might be about 40 percent new capabilities, 30 percent workflow improvements and customer requests, 20 percent platform stability and technical debt, and 10 percent exploration. Compliance and committed client work come off the top. Each bucket has its own success metric: capabilities (adoption and revenue), workflow (cycle time and satisfaction), stability (downtime, incidents, deploy frequency). I revisit the split when data says so: if incidents rise, stability gets more. On the enterprise platform, investing in stability and cloud-native migration brought downtime down 30 percent and let us scale from 40 to more than 1,000 concurrent users, which made new capabilities possible.

### Q3.1.5 [Behavioral] Leadership asks you to change the roadmap mid-quarter. How do you respond?

*Approach answer.*

I treat it as a trade-off conversation, not a yes or no. First, I'd understand the reason and urgency. Then I'd show the impact: what moves out, what slips, what commitments are at risk, and what the change gains. I'd bring two or three options with a recommendation, for example swap in the new item and defer a lower-value one, or deliver a smaller first slice. Once leadership decides, I'd update the roadmap and decision log, tell affected teams and customers clearly, and re-baseline the plan. If changes happen often, I'd raise the pattern and suggest a protected capacity for urgent work. Changing direction is fine when the cost is visible.

### Q3.1.6 [Experience] Tell us about a bet you made that did not pay off. What did you learn?

*Approach answer. No documented failed bet.*

I don't have a documented failed bet in my notes that I can state with accurate detail, and I don't want to invent one. The closest honest example is a target I set that I have not yet shown: for the engineering copilot ADO Assist I set a goal of cutting mean time to activate an issue from 5.5 days to 1.5 days, and I report it as a target until it is measured. The learning I apply is to agree the baseline and measurement method before building, run a small pilot first, and be explicit about what is a target and what is a result. (If you have a true miss, tell it using this pattern: the bet, the signal that it wasn't working, when you stopped, the cost, and what you changed.)

### Q3.1.7 [Conceptual] How do you create a roadmap that is transparent without over-committing?

Use **time horizons and confidence levels**. Near-term items (this quarter) are commitments with dates; mid-term items (next two quarters) are planned with target windows; long-term items are themes with outcomes and hypotheses, not dates. Show the problem and outcome for each item, not just features. Mark confidence (committed, planned, exploring) and update the roadmap on a regular cadence with a changelog. Share assumptions and dependencies openly. When customers ask for dates on uncertain items, give a range and what it depends on. This keeps trust high because changes are explained, not hidden.

### Q3.1.8 [Experience] How have you managed a portfolio and killed or merged low-value work?

*Approach answer with real evidence from the portfolio at your current company.*

I manage strategy across five product portfolios at o9 (solver, supply chain solver, supplier relationship management, platform UI and AI products) serving 200-plus enterprise customers. My task is to allocate effort across them against customer value, commercial goals and platform needs. I review each product on adoption, outcome metrics, revenue influence and maintenance cost, and I use customer feedback to decide where to invest. I don't have a documented example of formally retiring a product, so I'll describe how I'd do it: set criteria in advance (low usage, high cost, strategic mismatch), check data and customer impact, offer a migration path, communicate a timeline, and track the savings. For merging, I'd look for duplicate capabilities across products and consolidate into the shared platform.

### Q3.1.9 [Conceptual] How would you align a US-India product organization on one strategy?

**Framework: shared why, clear decision rights, steady rhythm.**
- *Shared why:* one written strategy with goals and metrics that both locations help create, not receive.
- *Decision rights:* a clear map of who decides what (for example, US product leadership owns portfolio strategy; India product owns the roadmap for defined platform areas) so teams don't wait or duplicate.
- *Rhythm:* an overlap window for decisions; written updates and decision logs for everything else; shared quarterly planning with both teams in the room (or on a call at a workable time); one backlog and one set of metrics.
- *Culture:* rotate meeting times for fairness, invest in relationships (visits or virtual team events), and recognize India team wins.

I've worked with global customers and distributed teams from Bangalore, and I rely on clear documentation and recurring forums.

### Q3.1.10 [Behavioral] Describe how you foster innovation while delivering committed work.

*Approach answer with real evidence from Story 12.*

I protect a small, visible share of capacity for exploration (for example 10 percent), keep it time-boxed with clear questions to answer, and treat results as learning even when the answer is no. I choose bets from real pain, such as manual effort or recurring complaints. At my company I designed internal AI tools for bug documentation, root-cause analysis and document generation, which came from observing where teams spent time; bug documentation effort fell 90 percent and design documents went from days to one or two hours. I use stage gates (idea, prototype, pilot, scale) so ideas earn investment through evidence, and I keep committed work on its schedule by not borrowing from it silently.

## A3.2 Requirements and backlog

### Q3.2.1 [Technical] Take a complex capability, such as a rules engine for claim edits, and show how you would decompose it into epics and stories.

**Clarifying questions:** Pre-pay or post-pay? Who authors rules? Which lines of business first? What latency and audit needs? **Assumption:** pre-pay edits, internal rule authors first, commercial line first.

**Framework: decompose by user workflow, then slice vertically.**

| Epic | Value | Sample stories |
|---|---|---|
| Evaluate a claim against edits | Catch errors before payment | Evaluate one edit type end to end; return outcome with reason code; handle batch input |
| Explain a finding | Reduce disputes | Show triggered rule, claim lines and policy citation; generate a plain-language reason |
| Author and test a rule | Faster policy change | Create a rule from a template; simulate against 90 days of claims; show impact before release |
| Release and roll back | Safe change | Approve and schedule a rule; roll back to prior version; keep a change log |
| Configure by line of business and client | Reuse | Enable or disable rules per client; set thresholds; inherit from defaults |
| Monitor | Quality | Dashboard of hit rate, upheld rate, overturn rate by rule |
| Enablers | Foundation | Rule repository and versioning; audit log; performance test harness |

**Sample story with acceptance criteria:** "As a claims analyst, I want to see which rule flagged a claim and why, so that I can decide quickly." *Given* a claim flagged by a duplicate-billing edit, *when* I open the finding, *then* I see the rule name, the two matching claim lines, the policy citation and a one-sentence reason, *and* the page loads in under two seconds for 95 percent of requests, *and* access is logged.

**Recommendation:** ship the first vertical slice (one edit type, evaluate, explain, log) in the first sprints, because it proves architecture and gives users something to react to.

### Q3.2.2 [Conceptual] What belongs in a PRD for a regulated platform?

Problem and background; users and use cases; goals and success metrics; scope and explicit non-goals; functional requirements; non-functional requirements (performance, availability, security, privacy, auditability); regulatory and compliance requirements with sources and dates; data requirements and flows (including PHI handling); dependencies and integrations; risks and mitigations; rollout plan and operational readiness; open questions; and approvals and change history. For regulated products I add traceability to the regulation or policy behind each requirement and a section on evidence needed for audits. I keep it concise and linked to the backlog.

### Q3.2.3 [Experience] How do you ensure the backlog is ready before PI or sprint planning?

*Real story with approach: Story 15 and your delivery leadership.*

At my previous employer, ambiguity in requirements varied across engagements, so I standardized PRDs, user story frameworks and acceptance criteria and improved delivery predictability through stronger backlog prioritization and dependency management. At my current company I lead sprint planning, backlog prioritization and release planning across concurrent initiatives. My routine: hold refinement sessions with engineering one to two sprints ahead; use a definition of ready (clear outcome, acceptance criteria, estimate, dependencies identified, design and data available); track a ready ratio; and surface blockers early. For PI planning I would add dependency mapping across teams and a pre-planning review of features with architects. I have not run formal SAFe PI planning, but the same readiness discipline applies.

### Q3.2.4 [Technical] How do you write good acceptance criteria and non-functional requirements?

Good acceptance criteria are testable, specific and tied to user outcomes. I use Given/When/Then for behavior and add rules for edge cases, error handling, permissions and audit. Non-functional requirements need numbers and a method of measurement. **Example for a claim evaluation service:** p95 latency under 300 milliseconds at 50 requests a second; 99.9 percent monthly availability; all decisions logged with rule version and retained for seven years (or as policy requires); PHI encrypted in transit and at rest; no unauthenticated access; recovery within four hours with no more than 15 minutes of data loss. I review criteria with engineers, testers and compliance, and I turn each NFR into a test or monitor before release.

### Q3.2.5 [Conceptual] What is the role of enablers and technical debt items in the backlog?

Enablers (architecture, infrastructure, data model, tooling) unlock future value; technical debt items reduce risk and slow-downs. They compete poorly against features unless their value is visible. I write each enabler with the outcome it unlocks and the cost of not doing it (for example, "enables multi-tenant rule configuration; without it each client needs a code change"), attach a metric (deploy time, incident count, onboarding time), and reserve a fixed share of capacity. I keep a debt register with severity and business impact, and I review it with engineering leaders each quarter.

### Q3.2.6 [Experience] Tell us about a time unclear requirements caused rework. What changed afterward?

*Real story: Story 13 (UX modernization).*

On the enterprise planning platform UI, work on dashboards, navigation and workspaces risked rework without clear user evidence. My task was to modernize the experience while keeping engineering rework low. I ran more than 50 discovery sessions with planners, consultants and enterprise users, then wrote user stories, workflow diagrams, wireframes and acceptance criteria so engineers and users agreed on the target before build. That reduced engineering rework and improved release quality, and planner productivity rose 30 percent. I don't have a documented specific rework incident to quote with exact numbers, so the honest framing is: this is the practice I installed to prevent it, and I can describe it in detail.

### Q3.2.7 [Behavioral] Engineers say your stories are too vague. How do you respond?

*Approach answer with evidence from Story 13 and Story 15.*

I'd take it seriously and ask for specifics: which stories, what was missing? Then I'd fix the immediate gaps by sitting with the engineers to refine them together. Next I'd fix the cause: agree a definition of ready, use a story template with acceptance criteria and examples, add wireframes or flows where they help, and invite engineers to refinement earlier. I'd ask them to review stories before sprint planning and track clarification questions during sprints as a measure. In my experience, writing user stories, flows, wireframes and acceptance criteria reduced engineering rework, and I standardized PRD and story practices for my teams, so I treat this feedback as a gift.

### Q3.2.8 [Technical] How do you maintain traceability from initiative to feature to story to release?

Use a hierarchy in tools with unique IDs and links: goal → initiative → feature → epic → story → test → release. Keep strategy and roadmap in the roadmap tool (for example Aha!) and delivery in the engineering tool (Rally, Jira or Azure DevOps), connected by integration or an agreed ID convention. Require every story to link to a feature and every feature to an initiative. Add compliance references where regulation drives a requirement. Build reports: stories per initiative, status by release, and coverage of requirements by tests. Review hygiene weekly. This supports audit, impact analysis and executive reporting.

### Q3.2.9 [Conceptual] What does a rigorous Definition of Done include beyond functional completeness?

Code reviewed and merged; automated tests passing at agreed coverage; non-functional checks met (performance, security scans, accessibility where relevant); acceptance criteria verified by product; documentation and release notes updated; monitoring, alerts and runbooks in place; feature flag and rollback plan ready; compliance and audit evidence captured; data migration or configuration complete; and operational support trained. I add "metrics instrumented" so we can measure outcomes. In Story 11, raising automated test coverage from 50 percent to over 85 percent and cutting regression effort from about 70 hours to under five made a stricter definition of done practical.

### Q3.2.10 [Experience] How do you translate business rules from operations into engineering artifacts?

*Real story: Story 1 and Story 3.*

On the solver, planners had business policies that the optimizer didn't model, such as proportional sourcing. My task was to translate those policies into configurable constraints. I worked with customers to understand each policy in concrete cases, wrote the rule in plain language with examples, converted it into a configurable constraint with parameters, and validated results with the customers. Sourcing optimization accuracy rose 40 percent. In the same area, infeasibility diagnosis translated technical conflicts back into business terms, cutting debugging effort 60 percent. My method: collect real cases, write decision tables, get operations to confirm, give engineers examples and edge cases, and test with real data.

## A3.3 Prioritization and decision-making

### Q3.3.1 [Conceptual] Which prioritization frameworks do you use and when do they mislead?

- **RICE** (reach, impact, confidence, effort) for comparing features within a product.
- **WSJF** (cost of delay divided by job size) for sequencing across teams and for portfolio work.
- **Kano** to separate must-haves, performance features and delighters.
- **Value versus effort** for quick triage.
- **Cost of delay** for deadlines and compliance.
- **MoSCoW** for scope negotiation.

They mislead when inputs are guesses presented as precision, when they ignore dependencies and strategy, when they favor easy quantifiable items over important but hard ones, and when teams game scores. I use frameworks to structure the conversation and expose assumptions, then apply judgment, and I record why a decision departed from the score.

### Q3.3.2 [Experience] Describe your hardest prioritization decision. What did you choose and why?

*Real story with approach: Story 1.*

On the solver, customers asked for larger models and policy-faithful optimization while the platform needed modernization and long-term investments competed for the same capacity. My task was to set priorities that balanced all three. I laid out the options against customer value, commercial impact and risk, took customer evidence into executive reviews, and chose to invest in modernization and configurable optimization logic together. The outcome was runtime down 65 percent, scalability up 20 to 30 percent, sourcing accuracy up 40 percent and infrastructure cost down 35 percent. The hard part was saying not now to some individual requests. I'd add the specific requests and the people who disagreed from your own memory when you tell it.

### Q3.3.3 [Technical] How do you build a business case for a multi-year platform investment?

**Clarifying questions:** What problem and which users? Time horizon? What baseline costs and benefits can we measure? What are the options (build, buy, partner, do nothing)? What is the hurdle rate and who decides?

**Assumptions (illustrative):** a payment integrity platform upgrade; build cost $5.0M in year 0; run cost $2.0M a year; benefits ramp: $3.0M in year 1 and $6.0M a year in years 2 to 5; discount rate 10 percent; five-year horizon.

**Framework: options, benefits, costs, risks, decision.**
- *Net cash flow:* Y0 −$5.0M; Y1 $3.0M − $2.0M = +$1.0M; Y2 to Y5 $6.0M − $2.0M = +$4.0M each year.
- *Present values at 10 percent:* Y1 1.0 / 1.10 = 0.909; Y2 4.0 / 1.21 = 3.306; Y3 4.0 / 1.331 = 3.005; Y4 4.0 / 1.4641 = 2.732; Y5 4.0 / 1.6105 = 2.484. Sum = 12.436.
- *NPV:* 12.436 − 5.0 = about **$7.4M**.
- *Payback:* cumulative cash is −5.0 after year 0, −4.0 after year 1, 0.0 after year 2. Payback is at the end of year 2.
- *Sensitivity (benefits 30 percent lower):* Y1 benefit 2.1 − 2.0 = +0.1; Y2 to Y5 4.2 − 2.0 = +2.2 each. PV = 0.1 / 1.10 + 2.2 × (0.8264 + 0.7513 + 0.6830 + 0.6209) = 0.091 + 2.2 × 2.8816 = 0.091 + 6.340 = 6.431. NPV = 6.431 − 5.0 = about **$1.4M**, still positive.
- *Sanity check:* the case holds even with lower benefits, so the key question is whether the benefit estimates (yield uplift, reviewer time saved) are credible, which I'd validate with a pilot.

**Recommendation:** approve a staged investment: fund the first phase tied to measurable yield and cycle-time milestones, with a stage gate before the next phase. Include non-financial benefits (compliance, client retention) and the cost of doing nothing.

### Q3.3.4 [Behavioral] Two senior stakeholders demand conflicting priorities. What do you do?

*Approach answer with evidence from Story 15.*

I'd first understand each stakeholder's underlying goal and constraint instead of the stated request. Then I'd make the trade-off visible with a short document: the goals, options, effort, expected outcomes, risks and my recommendation, using agreed criteria (customer value, revenue, risk, effort). I'd meet each separately to test the recommendation, then convene them together if needed, with a neutral sponsor to decide when we can't agree. I'd record the decision and communicate it to both. In my earlier role I resolved competing stakeholder priorities using structured prioritization frameworks so that engineering investments matched customer needs and strategic objectives. The principle is to decide on shared criteria, not on who argues loudest.

### Q3.3.5 [Conceptual] How do you decide with incomplete information?

I sort decisions by reversibility. For **reversible** choices (two-way doors), decide quickly with the best available information and learn. For **hard to reverse** choices, invest in more evidence, run a small experiment or pilot, and get a second view. I write down assumptions and what would change my mind, set a decision date, and define a leading indicator to check early. When time is short, I choose the option that preserves flexibility. I also separate risk from uncertainty: risk can be estimated; uncertainty is reduced by learning, so I design the cheapest experiment that reduces it.

### Q3.3.6 [Experience] Tell us about a time data contradicted your intuition.

*Approach answer.*

I don't have a documented example whose detail I can state accurately. My practice is to write my hypothesis and success metric before looking at data, so I can see when I'm wrong. For instance, in experiments on consumer commerce products I used analytics and A/B testing to prioritize roadmap items, and when results didn't match expectations I changed priorities. If you have a specific instance, describe the hypothesis, what the data showed, what you changed and the result.

### Q3.3.7 [Conceptual] How do you treat regulatory deadlines versus value-based prioritization?

Regulatory deadlines with penalties or legal obligations are **fixed-date constraints**: they enter the plan first, scoped to the minimum compliant solution, and work backwards from the date with buffers for testing and approvals. Everything else is prioritized by value using cost of delay or WSJF. I try to find shared value, since compliance work (for example FHIR APIs for prior authorization) can enable automation and better experience, and I avoid gold-plating. I track regulatory items on a separate calendar, review them quarterly with compliance and reserve capacity so late changes do not collapse the roadmap.

### Q3.3.8 [Experience] How have you used win/loss analysis to shape a roadmap?

*Approach answer with real evidence from VoC work.*

I don't have a documented formal win/loss program, but I have run structured customer feedback programs that feed the roadmap. At my current company I ran voice-of-customer work with Fortune 500 customers across industries and turned pain points into prioritized initiatives, which improved customer satisfaction by 40 percent, and VoC on the platform reduced API-related production issues by 90 percent. A win/loss approach I'd use: interview buyers and users of recent wins and losses within 30 days, ask what they compared and why they chose, code reasons into themes (capability, performance, price, trust, integration), quantify frequency and value, and bring the top themes into roadmap reviews with owners.

### Q3.3.9 [Behavioral] Describe saying no to an important stakeholder.

*Approach answer with evidence from Story 1.*

I say no with respect, a reason tied to a shared goal, and an alternative. For example, when roadmap capacity was limited on the solver, some individual requests had to wait so modernization and configurable optimization logic could be delivered; those investments produced the 65 percent runtime reduction and 40 percent sourcing accuracy gain. I would explain the trade-off with data, offer a configurable option or a later release, and keep the stakeholder informed about progress. The relationship usually survives when the person feels heard and sees a path. Add the specific stakeholder and request from your own experience.

### Q3.3.10 [Technical] How do you quantify trade-offs between customer value, engineering effort and security risk?

**Framework: weighted scoring with risk as a gate.**
1. Score customer value (1 to 10, based on reach and importance), engineering effort (person-weeks), and security risk reduction or exposure (1 to 10).
2. Treat **critical security risks as gates**, not points: items that close high-severity vulnerabilities go first regardless of score.
3. For the rest compute a priority score: (value × weight A + risk reduction × weight B) / effort.

**Illustrative example:** Feature X: value 8, risk reduction 1, effort 8 weeks. Fix Y: value 3, risk reduction 9, effort 3 weeks. Weights: A = 0.6, B = 0.4. Score X = (8 × 0.6 + 1 × 0.4) / 8 = 5.2 / 8 = 0.65. Score Y = (3 × 0.6 + 9 × 0.4) / 3 = 5.4 / 3 = 1.8. Y ranks higher. I'd then sanity check with engineering and security leaders and record assumptions. If a security finding is critical, it jumps the queue regardless of score.

## A3.4 Discovery, customer insight and market intelligence

### Q3.4.1 [Experience] How do you run continuous discovery for internal operational users?

*Real story: Story 13.*

On the enterprise planning platform, planners and consultants relied on dashboards, workspaces and navigation that limited productivity. My task was to modernize the experience with evidence. I ran more than 50 discovery sessions with planners, consultants and enterprise users, kept a regular cadence of conversations, and wrote user stories, workflow diagrams and wireframes from what I observed. Planner productivity rose 30 percent, rework dropped and adoption improved. For internal operational users my routine is: a standing weekly or biweekly slot with a rotating group of users, shadowing real work with real cases, testing prototypes before building, and tracking insights in a shared repository linked to roadmap items.

### Q3.4.2 [Conceptual] How do you combine qualitative and quantitative feedback into themes?

Triangulate. Use quantitative data (usage, funnels, tickets, ratings) to find where and how big; use qualitative data (interviews, reviews, verbatims) to understand why. Code qualitative feedback into themes, count frequency by segment, link each theme to metrics (for example support volume or drop-off), and rank by impact and strength of evidence. A theme is strong when it appears across independent sources. I present themes with a representative quote, a number and a recommended action, and I check back with users on whether the fix worked.

### Q3.4.3 [Experience] Describe a Voice of the Customer program you ran or improved.

*Real story: VoC programs at your current company.*

At o9, I conducted voice-of-customer programs with Fortune 500 organizations across retail, manufacturing, consumer goods, automotive, healthcare and transportation, and converted customer pain points into prioritized roadmap initiatives. The programs helped raise customer satisfaction by 40 percent. On the platform side, VoC initiatives influenced platform investments and helped reduce API-related production issues by 90 percent through improved resilience. My process: collect through workshops, interviews and support data; synthesize into themes; share a monthly summary with product, engineering and customer success; link themes to roadmap items; and close the loop with customers on what changed.

### Q3.4.4 [Technical] How would you use AI to summarize customer feedback while keeping it trustworthy?

**Framework: source, sample, sign-off (same as AI-assisted reporting).**
- *Pipeline:* collect feedback from surveys, reviews and tickets; clean and de-duplicate; use an LLM to classify sentiment and theme and to summarize each theme with example quotes.
- *Trust controls:* every theme links to the underlying comments; numbers are computed from the data, not generated by the model; a human reviews a random sample each cycle (for example 10 percent) and compares with the AI labels; track label accuracy against a human-coded set; flag low-confidence items for review; log versions.
- *Outputs:* theme counts and trends, emerging issues, a short narrative reviewed by a person before publication.
- *Recommendation:* publish an accuracy figure for the classification with each report and improve prompts over time.

### Q3.4.5 [Conceptual] What is jobs-to-be-done and how has it shaped your work?

Jobs-to-be-done frames a product around the progress a user is trying to make in a situation, rather than demographics or features. A job statement looks like: "When I'm reviewing a flagged claim, I want to see the evidence quickly so that I can decide with confidence." It helps find real competitors (including spreadsheets and manual workarounds), uncovers unmet needs and prevents feature-listing. In my work, I used it while talking to planners: the job wasn't "view an optimization result" but "decide what to do about my supply plan today, and explain why". That led to infeasibility diagnosis and explanations, which cut debugging effort by 60 percent.

### Q3.4.6 [Experience] Tell us about a competitor move that changed your plans.

*Approach answer.*

I don't have a documented example I can quote exactly. How I handle competitor moves: confirm the facts, understand which customers care and why, assess whether it threatens our position or only shifts attention, and decide whether to match, differentiate or ignore. I look at win/loss and customer feedback before reacting, and avoid copying features without a customer need. In my work across industries I've used market analysis alongside customer evidence to prioritize roadmap investments. If you have a real case, give the move, the evidence, your decision and the result.

### Q3.4.7 [Conceptual] How do you detect early signals of defects or friction and route them?

Set up a **signal pipeline**: collect from telemetry, support tickets, reviews, surveys and sales feedback; define thresholds that trigger attention (for example a spike in error rate, a recurring complaint, a drop in ratings after a release); assign owners by area; and set response times. Each signal is routed with context (evidence, affected users, trend) to the right product, engineering or operations owner, tracked to resolution and reported. On my platform I set up continuous centralized monitoring and telemetry that caught execution failures early, which reduced issue diagnosis effort by 40 percent and API-related production issues by 90 percent.

### Q3.4.8 [Behavioral] Customers ask for a feature that conflicts with your strategy. What do you do?

*Approach answer with evidence from Story 6.*

I'd dig into the underlying need by asking what outcome they want, and what they do today. Often the need can be met by something that fits the strategy: a configuration option, a template or an integration. If it truly conflicts, I'd explain the reasoning, show the alternative and, if it's important enough, evaluate it as a custom engagement with its true cost. I'd tell the customer clearly and early. In the supply planning product, I built configurable parameters and an industry template instead of one-off builds, which cut onboarding time by 75 percent and served many customers at once.

### Q3.4.9 [Experience] How have you benchmarked and improved a business process before building technology?

*Real story: Story 11.*

For the online store registration journey, I started by documenting the baseline: about 24 hours for existing customers and 48 hours for new ones, with manual dependencies on Sales, master data and the service desk, across about 12,000 registrations a year, and development cycles of 2 to 4 weeks. With that baseline, I identified what could be automated and productized account identification, verification and mapping with approval workflows. Registration fell to under a minute for existing customers and about 30 minutes for new ones, and the delivery cycle improved from 2 to 4 weeks to 1 to 2. Baselines made the improvement provable. The projected savings of about 20,000 person-days is a projection.

### Q3.4.10 [Conceptual] How would you assess market direction for payment integrity and RCM?

**Framework: market forces (PESTEL highlights + Porter's five forces + customer needs).**
- *Regulation:* shorter decision timeframes and FHIR APIs for prior authorization (verify dates), transparency requirements, scrutiny of AI in utilization decisions and of vertical integration.
- *Technology:* AI-assisted coding and documentation, real-time claims exchange, agentic automation, data platform consolidation.
- *Customers:* payers want lower administrative cost and fewer disputes; providers want faster, more predictable payment; both want transparency.
- *Competition:* large integrated players, specialist vendors, EHR vendors expanding into revenue cycle, and new AI-native entrants; Optum was named a leader in a 2026 revenue cycle platform analyst assessment (company-reported).
- *Economics:* pressure on margins pushes toward automation and outsourcing.

**Recommendation:** the direction is toward earlier, explainable, AI-assisted checks with shared payer-provider data, so I'd position the product on real-time accuracy, transparency and configurability, and watch regulatory and trust developments closely.
