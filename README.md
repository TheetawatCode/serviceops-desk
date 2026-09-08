# ServiceOps Desk

ServiceOps Desk is a portfolio-scale service-operations application for coordinating internal service jobs. It demonstrates polished frontend work, practical role-based workflows, and credible full-stack fundamentals without pretending to be an enterprise platform.

## Design direction

**Operational Clarity** is a white-first, professional B2B interface built around clear ownership, status, and SLA priority. It combines structured Cal.com-style working surfaces, Vercel-like restraint, calm Coinbase-inspired data hierarchy, and extremely subtle Stripe-like depth. Opaque, high-contrast reading surfaces remain the default; cobalt marks interaction, semantic colors are reserved for labeled status/SLA states, and glass is limited to the top utility bar and one dashboard highlight. See [the full design direction](docs/design-direction.md).

## 1. User problem and target users

Service teams often track requests across chat, spreadsheets, and verbal updates. Staff cannot easily see what is happening, technicians lack a clear queue, and managers struggle to spot overdue work.

The MVP serves three users:

- **Staff members** who submit service jobs and follow their progress.
- **Technicians** who work assigned jobs and record status updates.
- **Managers** who triage and assign jobs, monitor SLA risk, and review team workload.

The primary portfolio audience is hiring teams for Junior Frontend Developer and frontend-focused Full-stack Developer roles in Thailand.

## 2. MVP scope and non-goals

### In scope

- Seeded demo users and realistic service-job data.
- A demo role switcher so every workflow can be evaluated without account setup.
- Create, view, filter, assign, and update service jobs according to role.
- Priority, status, assignee, due time, and SLA state.
- An operational dashboard with useful summaries and workload visibility.
- Responsive, keyboard-accessible UI with clear loading, empty, error, and validation states.
- PostgreSQL persistence through Prisma, plus automated tests for critical behavior.

### Explicit non-goals

- Production authentication, registration, password recovery, or user administration.
- Email, SMS, payments, file uploads, chat, or third-party integrations.
- Multi-tenant organizations, granular custom permissions, or configurable workflows.
- Real-time collaboration, background job processing, audit-grade compliance, or advanced analytics.
- Native mobile applications or offline support.

## 3. Roles and permissions

| Capability | Staff | Technician | Manager |
| --- | :---: | :---: | :---: |
| View dashboard and jobs | Own jobs | Assigned jobs | All jobs |
| Create a job | Yes | No | Yes |
| Edit job details | Own draft/open jobs | No | Any open job |
| Assign or reassign jobs | No | No | Yes |
| Change operational status | No | Assigned jobs | Any job |
| Add internal work notes | No | Assigned jobs | Any job |
| View team workload | No | No | Yes |

Authorization must be enforced on the server as well as reflected in the UI. The role switcher represents seeded demo identities; it is not presented as secure production authentication.

## 4. Core workflow

1. A staff member creates a service job with a title, description, category, and priority.
2. A manager reviews the unassigned queue, confirms priority and SLA due time, then assigns a technician.
3. The technician moves the job from **Open** to **In Progress**, adds work notes, and marks it **Resolved**.
4. The manager reviews the result and marks the job **Closed**, or returns it to **In Progress**.
5. Dashboard metrics and SLA indicators update from the stored job data throughout the workflow.

## 5. Routes

| Route | Purpose |
| --- | --- |
| `/dashboard` | Role-aware summary cards, SLA risk, recent jobs, and manager workload view. |
| `/jobs` | Searchable and filterable job queue with status, priority, SLA, and assignee. |
| `/jobs/new` | Accessible job-creation form for Staff and Managers. |
| `/jobs/[id]` | Job details, assignment, status actions, and chronological work notes. |
| `/team` | Manager-only technician workload and active-job summary. |

The root route redirects to `/dashboard`.

## 6. Proposed Prisma data model

### Enums

- `Role`: `STAFF`, `TECHNICIAN`, `MANAGER`
- `JobStatus`: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`
- `Priority`: `LOW`, `MEDIUM`, `HIGH`, `URGENT`
- `JobCategory`: `HARDWARE`, `SOFTWARE`, `ACCESS`, `FACILITIES`, `OTHER`
- `ActivityType`: `CREATED`, `ASSIGNED`, `STATUS_CHANGED`, `NOTE_ADDED`

### `User`

- `id`, `name`, `email` (unique), `role`, `avatarUrl?`, `createdAt`, `updatedAt`
- Relations: submitted jobs, assigned jobs, and authored activities.

### `ServiceJob`

- `id`, human-readable `reference` (unique), `title`, `description`, `category`, `priority`, `status`
- `requesterId`, `assigneeId?`, `slaDueAt`, `resolvedAt?`, `closedAt?`
- `createdAt`, `updatedAt`
- Indexes on status, assignee, requester, and SLA due time.

SLA state (`ON_TRACK`, `AT_RISK`, or `BREACHED`) should be derived from status and `slaDueAt`, not stored as duplicate state.

### `JobActivity`

- `id`, `jobId`, `authorId`, `type`, `note?`, `fromValue?`, `toValue?`, `createdAt`
- Provides a simple timeline for assignments, status changes, and work notes.

## 7. Milestone plan

### Week 1 — Foundation and UI shell

- Scaffold Next.js, TypeScript, Tailwind CSS, linting, and test tooling.
- Define Prisma schema, Docker PostgreSQL setup, migrations, and realistic seed data.
- Build the responsive application shell and demo role switcher.
- Implement the jobs list and job detail read views with loading, empty, and error states.

### Week 2 — Complete the workflow

- Add validated job creation.
- Add manager assignment and role-aware actions.
- Add technician status updates and work notes.
- Enforce permissions in server-side mutations and cover core rules with unit/integration tests.

### Week 3 — Dashboard, quality, and delivery

- Build dashboard summaries, SLA indicators, filters, and team workload view.
- Refine responsive behavior, accessibility, visual hierarchy, and interaction feedback.
- Add Playwright coverage for the core Staff → Manager → Technician flow.
- Prepare deterministic demo data, deployment configuration, screenshots, and portfolio documentation.

## 8. MVP acceptance criteria

- A reviewer can switch among three seeded roles and immediately understand the permissions of each.
- Staff can create a valid job and view only jobs they submitted.
- Managers can view all jobs, assign a technician, change priority, and close or reopen work.
- Technicians can view assigned jobs, add a note, and move them through allowed statuses.
- Unauthorized server-side mutations are rejected even if the UI is bypassed.
- Job list search and filters work for status, priority, assignee, and SLA condition.
- The dashboard accurately derives open, in-progress, resolved, at-risk, and breached counts from persisted data.
- The main workflow works at mobile, tablet, and desktop widths with no horizontal overflow.
- All interactive controls are keyboard operable, focus is visible, forms have associated labels and useful errors, and color is not the only status cue.
- Seed/reset instructions produce a consistent demo, Vitest covers core business rules and UI states, and Playwright verifies at least the critical cross-role workflow.
- The app runs locally with Docker PostgreSQL and deploys successfully to Vercel with a hosted PostgreSQL database.

## Milestone status

Milestone 1 is approved and limited to the foundation, deterministic demo data, application shell, role switcher, and read-only job views. Mutations, dashboard calculations, production authentication, and Playwright remain deferred.

The demo identity foundation is server-managed: the switcher submits one of three fixed seeded user IDs, the server validates that record in PostgreSQL, and the selection is stored in a signed, `HttpOnly` cookie. Server-rendered job queries resolve that identity and apply role scope before returning data. This is intentionally a portfolio demo mechanism, not production authentication.

## Local development

Prerequisites: Node.js 24, pnpm 12, and Docker Desktop.

```bash
cp .env.example .env
# Replace DEMO_COOKIE_SECRET with a local random value of at least 32 characters.
pnpm install
docker compose up -d
pnpm db:migrate --name init
pnpm db:seed
pnpm dev
```

Open `http://localhost:3000/jobs`. The seed is idempotent: rerunning it updates the same fixed demo records without deleting unrelated data.
