# Plane Setup

**Status: DONE.** Workspace seeded and verified idempotent.

## What it's for

Plane plays the role of the real software product being demonstrated (the "Flowboard" product in the discovery-call narrative). The agent captures real screens from this workspace for the personalized walkthrough video — it's not a mockup or a generic screenshot.

## Setup steps

1. Sign up at [app.plane.so](https://app.plane.so) (Plane Cloud — no self-hosting needed, see `CLAUDE_BUILD_SPEC.md` for why).
2. Create a workspace. Slug used here: `northstar-demo`.
3. Generate an API token: **Workspace Settings → API Tokens → Create token.**
4. Grab the workspace slug from the URL (`https://app.plane.so/<slug>/...`).

## Credentials (in `.env.local`)

```
PLANE_BASE_URL=https://api.plane.so
PLANE_API_KEY=<token>
PLANE_WORKSPACE_SLUG=northstar-demo
PLANE_WORKSPACE_ID=<internal workspace uuid, discovered via API, see below>
```

## API reference facts (verified live, not just docs)

- Base URL: `https://api.plane.so`
- Auth header: `X-API-Key: <token>` (not Bearer)
- Workspace-scoped paths: `/api/v1/workspaces/{workspace_slug}/...`
- Project-scoped resources nest under `/workspaces/{slug}/projects/{project_id}/...` — labels, states, work-items, cycles, pages all live here.
- Creating a project requires `name` + a unique `identifier` (e.g. `CREQ`, `PLAT`, `MOBL`).
- **Gotcha:** new projects default to `cycle_view: false` via the API (unlike the UI creation flow). If you don't pass `cycle_view: true` at project-creation time, any later attempt to create a cycle in that project fails with `"Cycles are not enabled for this project"`. Fixed by either passing `cycle_view: true` on create, or `PATCH`-ing the project afterward.
- **Gotcha:** cycles are **project-scoped** — a single cycle cannot contain issues from two different projects. Our original seed plan tried to put issues from "Customer Requests" and "Platform" into one cycle; fixed by moving the whole cycle + both its issues into "Customer Requests" only.
- Creating a cycle: `POST /projects/{id}/cycles/` needs `name`, `project_id` (yes, redundant with the URL, but required in the body too), `start_date`, `end_date` (`YYYY-MM-DD`).
- Adding issues to a cycle: `POST /projects/{id}/cycles/{cycle_id}/cycle-issues/` with `{"issues": [issue_id, ...]}`.
- Work item priority is a plain lowercase string (`"high"`, `"medium"`, `"low"`, `"none"`) — no lookup needed.
- Work item `state` is a UUID — fetch `/projects/{id}/states/` and use the one with `"default": true` (Plane auto-creates Backlog/Todo/In Progress/Done/Cancelled per new project).
- Pages: `POST /projects/{id}/pages/` takes `name` + `description_html` (HTML string, not markdown).

## What got created

Run via `node --env-file=.env.local scripts/seed-plane.mjs` (idempotent, safe to re-run — matches by name before creating anything):

- 3 projects: Customer Requests (CREQ), Platform (PLAT), Mobile (MOBL)
- 3 labels: Enterprise, Customer, Feature Request
- 6 issues with correct priority/label
- 1 cycle "Q4 Sprint 3" (in Customer Requests) containing 2 issues
- 3 pages with placeholder content

## Known cleanup item (not automated — do it in the UI)

Plane auto-generates its own onboarding project on workspace creation, confusingly also named "Northstar Demo Environment" (full of Plane's own placeholder emoji/cover-image content). It is **not** part of our seed data. Archive or delete it before recording the demo so it doesn't show up as a stray 4th project. I didn't delete it via API since that's a live, irreversible action on your workspace — say the word if you want me to do it instead of you clicking through the UI.
