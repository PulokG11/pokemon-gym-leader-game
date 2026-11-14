# Part C. Practice Questions and Quick Reference

## C1. Practice questions by category

### Healthcare domain
- Walk me through a claim from submission to payment. Where does payment integrity act, and what would you automate?
  - Anchor: B1.3 claims lifecycle and B1.4 pre-pay vs post-pay.
- How would you define and measure "audit yield", and what could make it misleading?
  - Anchor: savings identified vs realised, overturn rate, provider abrasion.
- What does CMS-0057 change for payers and for the product roadmap?
  - Anchor: decision timeframes, public reporting, FHIR APIs by 1 January 2027 (verify dates).
- How would you build a longitudinal account record from several EHRs?
  - Anchor: ingestion, identity matching, canonical model, auditability.

### AI, Gen AI, agentic AI, ML
- How would you decide whether a use case needs an agent, a workflow or a model?
  - Anchor: variability of path, tool use, cost and reliability; hybrid designs.
- Design an evaluation plan for a benefit-inquiry agent.
  - Anchor: golden set, groundedness, escalation rate, segment accuracy, regression suite, online monitoring.
- How do you phase autonomy for prior authorization automation without automating denials?
  - Anchor: autonomy ladder; accelerate approvals; clinician review of adverse decisions.
- How do you show the value of an AI programme to finance?
  - Anchor: baselines, holdouts, savings realised, payback period.

### Product management
- Describe a platform you made multi-client. How did you balance configuration against customisation?
- Tell me about a roadmap trade-off between compliance deadlines and new capability.
- How do you structure a business case for a multi-year platform investment?
- How do you coach a product manager who struggles with prioritisation?

### Technical expertise
- Explain the trade-offs of splitting a monolith into microservices for a claims workflow.
- When is streaming worth the extra complexity compared with batch?
- What would you require from engineering before approving a GPU-based service for general availability?
- How do you make technical debt visible and fundable?

## C2. Glossary of acronyms

| Term | Meaning |
|---|---|
| A/R | Accounts receivable |
| ABM | Ancillary Benefits Management (as used in JD6) |
| ADT | Admission, discharge, transfer (HL7 message type) |
| BI | Business intelligence |
| CARC / RARC | Claim adjustment reason code / remittance advice remark code |
| CDI | Clinical documentation improvement |
| CDP | Common Data Platform (JD4) |
| CMS | Centers for Medicare and Medicaid Services |
| CPT / HCPCS | Procedure code sets |
| DORA | DevOps Research and Assessment metrics |
| DRG | Diagnosis-related group |
| EHR | Electronic health record |
| FHIR | Fast Healthcare Interoperability Resources |
| FWA | Fraud, waste and abuse |
| HCC / RAF | Hierarchical condition category / risk adjustment factor |
| HIM | Health information management |
| HIPAA | Health Insurance Portability and Accountability Act |
| HITL | Human in the loop |
| HL7 | Health Level Seven (standards organisation and message standard) |
| ICD-10 | International Classification of Diseases, 10th revision |
| LLM | Large language model |
| MA | Medicare Advantage |
| MCP | Model Context Protocol |
| MLOps | Machine learning operations |
| NCCI | National Correct Coding Initiative |
| NFR | Non-functional requirement |
| PAP | Payer Agentic Platform (JD3) |
| PBM | Pharmacy benefit manager |
| PHI | Protected health information |
| PI | Payment integrity; also Program Increment in SAFe (context decides) |
| PRD | Product requirements document |
| RAG | Retrieval Augmented Generation |
| RCM | Revenue cycle management |
| RTO / RPO | Recovery time objective / recovery point objective |
| SLI / SLO / SLA | Service level indicator / objective / agreement |
| UM | Utilisation management |
| VoC | Voice of the Customer |
| WSJF | Weighted shortest job first |

## C3. Sources used for the research brief

- UnitedHealth Group Q2 2026 earnings release (SEC Form 8-K): https://www.sec.gov/Archives/edgar/data/0000731766/000073176626000191/uhgearnings_q22026vpower.htm
- UnitedHealth Q3 2026 earnings call transcript (Motley Fool, 13 October 2026): https://www.fool.com/earnings/call-transcripts/2026/10/13/unitedhealth-unh-q3-2026-earnings-call-transcript/
- The National CIO Review, UnitedHealth Group expands agentic AI: https://nationalcioreview.com/articles-insights/cio-field-notes/unitedhealth-group-expands-agentic-ai-across-healthcare-operations/
- Healthcare Innovation, UnitedHealth's next big business line (AI tools and services): https://www.hcinnovationgroup.com/analytics-ai/artifical-intelligence-machine-learning/news/55373764/unitedhealths-next-big-business-line-it-could-be-ai-tools-and-services
- Optum, Integrity One announcement (7 May 2025): https://www.optum.com/en/newsroom/health-tech/optum-leads-revenue-cycle-management-innovation-new-ai-powered-solution.html
- Healthcare Dive, Optum Real: https://www.healthcaredive.com/news/optum-real-ai-speed-claims-review-united-health/803448/
- HIT Consultant, Optum AI prior authorization (Digital Auth Complete, InterQual Auth Accelerator): https://hitconsultant.net/2026/02/05/rcm-optum-launches-ai-prior-authorization-humata-interqual/
- Fierce Healthcare, Value Connect: https://www.fiercehealthcare.com/health-tech/optum-unveils-value-connect-ai-powered-tool-support-value-based-care
- UnitedHealth Group, Optum Rx transparent pharmacy care model (11 May 2026): https://www.unitedhealthgroup.com/newsroom/2026/2026-05-11-optum-rx-introduces-industry-first-transparent-pharmacy-care-model.html
- PYMNTS, UnitedHealth AI coverage (2026): https://www.pymnts.com/healthcare/2026/unitedhealths-ai-is-rebuilding-the-payment-layer-of-american-healthcare/
- Optum India overview and news: https://www.optum.in/content/optum-in/en_in/about/news
- CMS-0057-F summaries (vendor and compliance sources; confirm against CMS): https://innovaccer.com/resources/blogs/cms-0057-prior-authorization-rule-requirements-deadlines-apis-and-operational-impact
- Anthropic, Claude Partner Network (context for the partner programme): https://www.anthropic.com/news/claude-partner-network
- Your own JD set: Optum - All SPM & Lead PM JDs merged.pdf (JD1–JD10 as defined in the keyword analysis document).
