# B4. Technical Expertise

> Reading guide: for a Lead TPM, the test is whether engineers and architects respect your questions and trade-off calls. Know the vocabulary, the failure modes and the cost drivers; do not pretend to be the deepest engineer in the room.

## B4.1 Architecture and software engineering

> Interview angle: explain architecture choices in terms of outcomes (speed, resilience, cost, compliance).

- **System architecture** — The structure of components, data stores, interfaces and deployment.
  - PM lens: ask for a context diagram, key quality attributes (availability, latency, security) and the main trade-offs; review Architecture Decision Records (ADRs).
- **Microservices** — Small independently deployable services owned by teams.
  - PM lens: benefits: independent scaling and release; costs: operational complexity, distributed failures, data consistency. Avoid splitting prematurely; align services to business capabilities.
- **APIs and API-driven architectures** — Contracts between systems. Styles: REST, gRPC, GraphQL, event-based messages.
  - PM lens: API design is product design: consistent resources, error handling, pagination, idempotency, versioning, authentication (OAuth 2.0), rate limits, documentation.
- **System integrations, integration patterns and frameworks** — Point-to-point, API gateway, enterprise service bus, event streaming, file-based batch.
  - PM lens: choose by latency need, volume, reliability and ownership. Batch still matters in healthcare (files, X12).
- **Enterprise architectures and enterprise applications** — Large systems such as claims platforms, core administration systems, CRM and ERP.
  - PM lens: integration with legacy cores is a major cost; plan anti-corruption layers and phased migration (strangler pattern).
- **Software development lifecycle (SDLC)** — Planning, design, build, test, release, operate.
  - PM lens: know your touchpoints in each stage and what artifacts engineering expects.
- **Distributed systems** — Systems spread across machines: latency, partial failure, eventual consistency, CAP theorem trade-offs (consistency, availability, partition tolerance).
  - PM lens: understand why real-time data across systems can be stale and what the business impact is; define consistency expectations per workflow.
- **Technical trade-offs and technical debt** — Short-term speed against long-term cost.
  - PM lens: keep a visible tech-debt register with business impact; allocate a fixed percentage of capacity; explain debt to executives as interest paid in slower delivery and incidents.
- **Scalable, secure and reusable platform patterns** — Multi-tenancy, event-driven design, configuration-driven rules, shared services.
  - PM lens: multi-tenant design affects data isolation, noisy-neighbour risk and per-client customisation.
- **Non-functional requirements** — Performance, scalability, reliability, security, observability, maintainability.
  - PM lens: write measurable targets, test them in pre-production, include in DoD.
- **Mobile applications and app-store experiences** — Native and cross-platform apps, release cycles, store review, crash analytics, feature flags.
  - PM lens: version fragmentation and staged rollouts matter (JD1).

## B4.2 Cloud platforms

> Interview angle: show cloud fluency without vendor bias; explain hybrid reality in regulated enterprises.

- **Cloud platforms and services (IaaS, PaaS, SaaS, serverless)** — Different abstraction levels: infrastructure, platform, software.
  - PM lens: more managed means faster delivery but less control and potential lock-in.
- **Azure, AWS, GCP** — The three major clouds. JD3 and JD7 reference Azure AI, Google Cloud, AWS Bedrock and Vertex AI.
  - PM lens: know a few service categories on each (compute, storage, managed Kubernetes, data and analytics, AI services, identity) and how they map across providers.
- **Private cloud, public cloud and hybrid environments** — Optum's AI Factory spans all three. Reasons: data residency, cost, existing investments, latency, regulation.
  - PM lens: hybrid adds complexity in identity, networking, deployment consistency and observability. Aim for abstraction (Kubernetes, infrastructure as code, standard APIs) so consumers do not care where the workload runs.
- **Cloud operating concepts** — Landing zones, regions and availability zones, disaster recovery (RTO/RPO), cost management (FinOps), shared responsibility model.
  - PM lens: ask for RTO/RPO targets for each product tier and test them.

## B4.3 Data platforms and analytics

> Interview angle: strongest for RCM CDP, ABM and data-science roles. Explain how raw data becomes trusted, usable information.

- **Data platforms and enterprise data platforms** — Systems that ingest, store, process, govern and serve data.
  - PM lens: define consumers and use cases first; platform features follow the most valuable use cases.
- **Lakehouse and layered architecture (bronze, silver, gold)** — Raw data landed (bronze), cleaned and conformed (silver), curated for use cases (gold).
  - PM lens: gives a natural phasing plan and quality gates.
- **Data ingestion (batch, streaming, change data capture)** — Batch for large periodic loads, streaming for real-time events, CDC for database changes.
  - PM lens: choose by freshness requirement and cost. Many "real-time" asks are really "within 15 minutes".
- **Data labelling, standardisation and normalisation (JD4)** — Cleaning, mapping to common code sets, resolving duplicates.
  - PM lens: invest in terminology mapping (for example payer names, procedure codes) and master data management.
- **Data warehouse concepts** — Dimensional modelling, marts, aggregates, slowly changing dimensions.
  - PM lens: ask how definitions (for example "denial") are standardised and governed.
- **Data flows, data model, data mapping, interfaces (JD6)** — End-to-end lineage of data from source to consumer.
  - PM lens: require data flow diagrams and field-level mapping documents as part of stories.
- **Batch and real-time processing (JD6)** — Two processing modes with different engineering and operations costs.
  - PM lens: define business value of low latency before funding streaming.
- **Data integration and data governance** — Combining sources under policies: ownership, quality, lineage, catalogue, access control, retention.
  - PM lens: data quality metrics (completeness, accuracy, timeliness) become product KPIs.
- **Single source of truth / unifying disparate sources (JD4)** — One agreed, trusted representation of an entity (patient, account, claim).
  - PM lens: address identity resolution, conflict rules and survivorship; accept that "single source" often means "single trusted view".
- **Data analytics platforms** — Environments for analysis and BI.
  - PM lens: align self-service analytics with governance.
- **Databricks** — Unified analytics and AI platform based on the lakehouse pattern (Spark, Delta, notebooks, ML and AI services).
  - PM lens: know the main value: scalable processing and ML in one environment; cost governance matters.
- **Power BI and Tableau** — Business intelligence tools for dashboards and reports. Named in JD1 and JD4.
  - PM lens: choose by user base and licensing; ensure semantic layer and governed datasets.
- **Excel** — Still the analyst default; be able to build and validate a quick model.
- **Qualtrics, AppFollow and scorecard tools (JD1)** — Qualtrics for surveys and experience management; AppFollow for app-store review monitoring; GoAppGo and Abyss are internal or specialised scorecard inputs named in JD1 (details not public).
  - PM lens: show how you merge these into a single insight view.

## B4.4 Infrastructure and platform engineering

> Interview angle: key for JD7-type roles. Show you understand the building blocks and the cost levers.

- **Kubernetes and container platforms** — Containers package apps; Kubernetes schedules and manages them (pods, deployments, services, namespaces, autoscaling).
  - PM lens: multi-tenancy, quotas, upgrades and policy enforcement define the developer experience.
- **Red Hat OpenShift** — Enterprise Kubernetes platform with built-in security and developer tooling.
  - PM lens: common in regulated enterprises; supports hybrid consistency.
- **NVIDIA GPU platforms and GPU compute architectures** — Accelerators for AI. Key topics: GPU memory, interconnects, scheduling, sharing.
  - PM lens: capacity is scarce; plan demand forecasts, reservations and prioritisation.
- **GitOps** — Managing infrastructure and deployments declaratively from Git; automated reconciliation (for example Argo CD or Flux).
  - PM lens: gives auditability and consistent environments; good for regulated change control.
- **Platform engineering and platform automation** — Building internal developer platforms with self-service and "golden paths".
  - PM lens: measure developer productivity and satisfaction; reduce cognitive load.
- **Observability and telemetry** — Metrics, logs, traces; alerting; dashboards; OpenTelemetry as a common standard.
  - PM lens: observability is a product feature; include it in requirements.
- **Capacity management, reliability and cost effectiveness** — Forecast demand, ensure headroom, optimise spend.
  - PM lens: cost per unit of work is a metric alongside reliability.
- **FinOps** — Practice of managing cloud spending with cross-functional accountability.
  - PM lens: tagging, showback/chargeback, budgets and anomaly alerts; include unit economics for AI workloads.

## B4.5 DevOps, quality and delivery engineering

> Interview angle: show you value engineering effectiveness and quality as product outcomes.

- **DevOps practices and CI/CD pipelines** — Continuous integration and delivery, automated builds, tests and deployments.
  - PM lens: ask about pipeline stages, gates and deployment frequency; use DORA metrics to discuss improvement.
- **Integration testing and test automation** — Test pyramid: many unit tests, fewer integration tests, few end-to-end tests. Contract testing for APIs.
  - PM lens: invest in automation for regression-heavy domains (rules engines, claims logic).
- **Test planning** — Coverage strategy, data, environments.
  - PM lens: test data for healthcare must be de-identified or synthetic.
- **Implementation validation and release readiness (JD6)** — Verifying acceptance criteria and environment readiness.
  - PM lens: joint sign-off with QA and operations.
- **Feature flags, canary and phased releases** — Reduce release risk and enable experiments.
  - PM lens: especially useful for AI features and client-by-client rollout.

## B4.6 Security, privacy and compliance engineering

> Interview angle: demonstrate secure-by-design product thinking.

- **Security, privacy and regulatory compliance** — Identity and access management, encryption in transit and at rest, secrets management, network segmentation, audit logging, vulnerability management.
  - PM lens: add security acceptance criteria and threat modelling to epics; coordinate with security architects early.
- **PHI protection and de-identification** — HIPAA outlines two de-identification methods (Safe Harbor and Expert Determination).
  - PM lens: for analytics and model development, plan de-identified or limited datasets and clear approvals.
- **Platform security and governance** — Policy as code, approved images, vulnerability scanning, least privilege for tools and agents.
  - PM lens: agents need their own identities and scoped permissions, with every action logged.
- **Compliance risk mitigation (JD9)** — Controls that reduce regulatory and contractual risk.
  - PM lens: include compliance owners in refinement and keep evidence automated.
- **Zero trust and identity** — Verify explicitly, least privilege, assume breach.
  - PM lens: shapes how services authenticate and how agents call tools.
- **Resilience and incident response** — Redundancy, failover, runbooks and post-incident reviews.
  - PM lens: the Change Healthcare incident (2024) is the industry reference case for concentration risk; be ready to discuss resilience as a product requirement.
