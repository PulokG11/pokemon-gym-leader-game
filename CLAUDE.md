# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workspace layout

This directory is a mono-workspace for several independent projects:

| Folder | What it is |
|---|---|
| `meridian/` | AI-native RCM prototype — the most fully built project here |
| `beer-game/`, `cake-game/`, `coffee-shop-game/` | Early-stage game stubs (`src/`, `assets/`, `docs/`) |
| `graphify-out/` | Knowledge graph output from `/graphify` runs |

Each sub-project has its own git repo. Work inside the sub-project folder.

---

## Meridian

Prototype URL: https://pulokg11.github.io/Meridian-AI/  
Supabase project ref: `hsmasegexwidctofujcc` (region: ap-south-1)

### Running locally

```bash
# No build step. Open in a browser directly:
start meridian/index.html
start meridian/process-maps.html
```

Google Fonts are loaded from the network; the layout degrades gracefully without them.

### Backend (Supabase CLI)

```bash
# Apply all pending migrations to the hosted project
supabase db push --project-ref hsmasegexwidctofujcc

# Run the pgTAP test suite (runs against the local stack)
supabase test db

# Serve the Edge Function locally
supabase functions serve api --project-ref hsmasegexwidctofujcc

# Deploy the Edge Function
supabase functions deploy api --project-ref hsmasegexwidctofujcc
```

Run a single pgTAP test file:
```bash
supabase test db --file backend/tests/006_cmd_claims.sql
```

### Deployment

Pushing to `main` redeploys both `index.html` and `process-maps.html` via GitHub Actions (`.github/workflows/pages.yml`) to GitHub Pages. No manual step needed.

### Versioning and rollback

Every release is a git tag. Rollback pattern:

```bash
git checkout v8.2.0 -- meridian/index.html
git commit -m "rollback: index.html to v8.2.0"
```

Tag the commit before shipping any release. See `meridian/CHANGELOG.md` for what each tag changed and its rollback instruction.

---

## Meridian architecture

### Frontend: single-file prototype

`index.html` is one large self-contained file (~all CSS, all JS, inline SVG). It contains all five portals (provider, patient, payer, clearinghouse, platform) as independent view trees. The file has no bundler or transpiler — vanilla JS and CSS only.

`process-maps.html` is a companion single-file containing swimlane diagrams. Keep it in sync with any workflow changes in `index.html`.

### Backend: command-pattern over Postgres

The backend exposes a single Edge Function (`backend/supabase/functions/api/index.ts`) that acts as a thin proxy:

```
POST /functions/v1/api/<dotted.command>
  → SELECT * FROM cmd_<command_with_underscores>(args)
```

The function forwards the caller's JWT (never the service role) so RLS and `app.ctx()` apply as the real user. Every call requires an `Idempotency-Key` header.

Error codes (`MR0xx`) map to HTTP status: MR001→409, MR002→422, MR003→403, MR004→404, MR005→400.

### Database migrations

Migrations live in `backend/supabase/migrations/` and are numbered sequentially (`001_`, `002_`, …). Each has a paired `.down.sql` for rollback. Naming convention: `NNN_area.sql` / `NNN_area.down.sql`, with lettered suffixes (`005a_`, `005b_`) for in-sequence fixes.

### pgTAP test suite

Tests in `backend/tests/` are pgTAP SQL files numbered to mirror the migration they cover (e.g. `006_cmd_claims.sql` tests migration `006_cmd_claims.sql`). `b`-suffix files (`006b_cmd_claims_fixes.sql`) cover follow-on fixes to that same migration.

### Seeding

`backend/seed/010_reference.sql` loads reference data. `backend/seed/020_cases.sql` loads the 15 synthetic cases. `backend/seed/011_test_users.generated.sql` is auto-generated — do not edit by hand.

### Reference documents

`_v2` documents (e.g. `Meridian_TADD.docx`, `*_v2.docx/.xlsx`) are annotated against the live build; the originals without the suffix are kept as-is for historical reference. When a requirement or table row is marked "implemented," verify against the actual `api.cmd_*` command functions and live schema rather than the original design docs.

---

## Memory rules

- Tag and add a changelog entry before changing any published deliverable (`index.html`, `process-maps.html`).
- Keep `process-maps.html` in sync with workflow changes in `index.html`.
- Copy deliverables into the sub-project's folder inside `Claude Directory`, not just the scratchpad.
