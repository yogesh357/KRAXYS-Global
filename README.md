# Atlas Industrial Services — Operations MVP

A focused MVP for transforming scattered, manually-captured service requests into a **visible, prioritized, assigned, and trackable work queue** for a commercial equipment maintenance company.

---

## Product Problem

Atlas Industrial Services (35 staff) currently manages all service requests through:

- **Email**, **WhatsApp**, **Phone**
- A coordinator manually copies requests into a spreadsheet
- Jobs are assigned verbally with no structured tracking

**Resulting pain points:**
- Urgent requests from customers go unnoticed in an unorganized inbox
- Customers repeatedly call for status updates — coordinators have no quick answer
- The Operations Manager cannot see overdue work or technician utilization at a glance
- No audit trail: "who assigned what, and when?"

---

## MVP Solution

The smallest coherent software solution that improves this workflow:

> **Turn manually captured service requests into prioritized, assigned, scheduled, and trackable work.**

The coordinator manually enters requests received through existing channels (no integration required). The system:

- Applies deterministic **priority triage** based on message content
- Flags **overdue** requests based on fixed SLA thresholds
- Detects **possible duplicate** requests deterministically
- Enables **one-click customer status updates** (copy-to-clipboard)
- Gives the Operations Manager a real-time **workload & exception overview**
- Gives technicians a clean **My Jobs** view with Start/Resolve controls

---

## Roles

### Coordinator — Alex Morgan
Primary question: *"What do I need to process right now?"*

- Creates new service requests manually (from email, WhatsApp, phone)
- Triages: sets priority, flags clarification needs, detects duplicates
- Assigns technicians and schedules on-site visits
- Updates request status throughout the lifecycle
- Uses the **Copy Customer Update** button to answer repeated status calls

### Technician — T1, T2, T3
Primary action: *"What are my jobs for today?"*

- Views assigned and active jobs
- Marks jobs as **In Progress** (on-site arrival) → **Resolved** (job complete)
- Can flag a job as **Waiting for Part** if component needs ordering
- Views site address, customer contact, equipment ID, and problem notes

### Operations Manager — Samantha Wright
Primary question: *"Is the operation under control?"*

- Real-time overview: Urgent, Unassigned, Overdue, Waiting Parts
- Technician workload matrix (T1, T2, T3 — active jobs, capacity)
- Exception escalation queue: SLA breaches, unassigned urgent tickets, stalled jobs
- Can inspect any request and reassign technicians where needed

### Customer (External Actor — No Login)
- Continues contacting Atlas via **Email / WhatsApp / Phone**
- The coordinator reads their request and enters it into the system
- The coordinator uses **Copy Customer Update** to answer status queries instantly
- Customers are recorded as named accounts (C01–C07), not application users

---

## Demo Dataset

| ID   | Customer                | Status              | Priority | Technician | Expected Behavior                     |
|------|-------------------------|---------------------|----------|------------|---------------------------------------|
| R101 | Apex Cold Storage       | NEW                 | URGENT   | None       | Overdue — unassigned 16h+             |
| R102 | Blue Star Logistics     | ASSIGNED            | HIGH     | T1         | Visit not yet scheduled               |
| R103 | Crestline Manufacturing | NEW                 | NORMAL   | None       | Routine — 24h window                  |
| R104 | Apex Cold Storage       | NEW                 | URGENT   | None       | Flagged as possible duplicate of R101 |
| R105 | Delta Processing        | NEEDS_CLARIFICATION | NORMAL   | None       | Missing equipment ID + urgency        |
| R106 | Echo Pharmaceuticals    | WAITING_PART        | HIGH     | T2         | Overdue — waiting parts 43h+          |
| R107 | Falcon Foods            | IN_PROGRESS         | HIGH     | T3         | Ready to mark resolved                |
| R108 | Global Warehouse Co.    | NEEDS_CLARIFICATION | HIGH     | None       | Pressure warning — details needed     |

---

## Assumptions (Demo Baseline)

> **These are demonstration assumptions, not official Atlas service agreements.**

### Demo Clock
```
DEMO_NOW = 2026-10-01T09:00:00 UTC
```
All overdue calculations, elapsed times, and SLA checks are measured against this fixed timestamp. The application behavior does not change depending on the actual date an evaluator runs it.

### Priority Rules
| Priority | Trigger Condition                                          |
|----------|------------------------------------------------------------|
| URGENT   | Cold storage fault, stored goods at risk, product damage   |
| HIGH     | Equipment stopped, pump/pressure fault, operational break  |
| NORMAL   | Routine inspection, scheduled maintenance                  |

### Overdue Rules (Demo SLA)
| Priority | SLA Threshold                                              |
|----------|------------------------------------------------------------|
| URGENT   | Must be assigned AND scheduled within **2 hours**          |
| HIGH     | Must be assigned within **4 hours**                        |
| NORMAL   | Must be assigned within **24 hours**                       |
| Any      | WAITING_PART > **24 hours** = escalation flag              |
| Any      | Scheduled visit time passed (still ASSIGNED) = overdue     |

### Duplicate Detection
Deterministic rule (no AI):
```
Same customer
+ Request received within 48 hours
+ Follow-up keyword ("follow", "yesterday", "again") OR 2+ matching tokens
= Flagged as possible duplicate
```

### Technician Availability
- T1 (Marcus Vance): Refrigeration specialist
- T2 (Elena Rostova): Heavy machinery & hydraulics
- T3 (David Chen): Electrical controls & pressure systems
- All 3 start the demo with 1 active job each

### Manual Request Intake
The MVP does **not** integrate with email, WhatsApp, or phone systems. The coordinator manually reads messages from those channels and enters them into the system. The "Copy Customer Update" feature allows coordinators to quickly respond to status inquiries without leaving the desk application.

### Authentication
> Production deployment would use proper authentication and RBAC. The assessment MVP uses a **lightweight role-selection dropdown** in the navbar to demonstrate coordinator, technician, and manager workflows. Clicking a role instantly changes the dashboard, permissions, and visible data.

---

## Out of Scope (Intentionally Excluded)

| Feature                        | Reason                                      |
|--------------------------------|---------------------------------------------|
| WhatsApp / Email / Phone integration | Comm-channel integrations out of MVP scope |
| Customer portal / login        | Customers are external actors only          |
| Payments & invoicing           | Not part of service dispatch workflow       |
| Inventory management           | Parts tracking is a separate domain         |
| GPS / maps / location tracking | Over-engineered for this MVP size           |
| Advanced scheduling / calendar | Simple visit time field is sufficient       |
| Production authentication/JWT  | Role selector used for demo clarity         |
| Notifications infrastructure   | Copy-to-clipboard handles immediate need    |
| AI / LLM features              | Deterministic rules are auditable & fast    |
| Microservices architecture     | Single Express backend is right-sized       |

---

## Technical Architecture

```
Browser (Next.js 16, React 19, Tailwind CSS v4)
   |
   | HTTP/JSON  (localhost:3000 → localhost:8080)
   ↓
Express.js API (TypeScript, Zod validation)
   |
   ↓
Drizzle ORM
   |
   ↓
PostgreSQL (local: atlas_industrial database)
```

### Backend Structure
```
backend/src/
  db/
    schema.ts           — Drizzle ORM table definitions
    index.ts            — PostgreSQL pool configuration
  services/
    request.service.ts  — Core business logic (CRUD, overdue, duplicate)
    technician.service.ts
    dashboard.service.ts
  controllers/          — Express route handlers
  routes/               — Route declarations
  validators/           — Zod input schemas
  utils/
    domain.ts           — DEMO_NOW, overdue logic, duplicate detection, priority heuristics
```

### Frontend Structure
```
frontend/app/
  components/
    Navbar.tsx              — Role switcher, brand, Reset Seed button
    CoordinatorView.tsx     — Summary stats, Needs Attention board, request table
    TechnicianView.tsx      — My Jobs with Start/Resolve controls
    ManagerView.tsx         — Operational cockpit with workload matrix & exceptions
    RequestDetailDrawer.tsx — Side panel with full request detail, timeline, customer update
    Modals.tsx              — Assign, Schedule, Clarify, Duplicate, Resolve, New Request
    Badges.tsx              — Status, Priority, Channel badges
    CustomerUpdateBox.tsx   — Copy-to-clipboard customer message component
  lib/
    api.ts                  — Typed fetch client for all backend endpoints
  types/
    index.ts                — Shared TypeScript interfaces
  page.tsx                  — Main application shell with state management
```

---

## API Endpoints

| Method | Endpoint                        | Description                              |
|--------|---------------------------------|------------------------------------------|
| GET    | `/api/health`                   | Health check                             |
| GET    | `/api/requests`                 | List requests (filter/search support)    |
| POST   | `/api/requests`                 | Create new service request               |
| GET    | `/api/requests/:id`             | Get request detail with activities      |
| PATCH  | `/api/requests/:id`             | Update request attributes                |
| POST   | `/api/requests/:id/assign`      | Assign technician (+ optional schedule)  |
| POST   | `/api/requests/:id/schedule`    | Set/update visit time                    |
| POST   | `/api/requests/:id/status`      | Transition request status                |
| POST   | `/api/requests/:id/duplicate`   | Mark as duplicate of another request     |
| POST   | `/api/requests/:id/clarify`     | Flag NEEDS_CLARIFICATION with notes      |
| GET    | `/api/technicians`              | List all technicians with workload       |
| GET    | `/api/technicians/:id/jobs`     | Get all jobs for a specific technician   |
| GET    | `/api/dashboard/coordinator`    | Coordinator dashboard aggregated data    |
| GET    | `/api/dashboard/manager`        | Operations manager dashboard data        |
| GET    | `/api/customers`                | List all customers                       |
| POST   | `/api/seed/reset`               | Reset database to initial demo dataset   |

---

## Setup & Running

### Prerequisites
- Node.js 20+
- PostgreSQL running locally

### Database Setup

```bash
# Create the PostgreSQL database
psql -U postgres -c "CREATE DATABASE atlas_industrial;"
```

### Backend

```bash
cd backend

# Install dependencies
npm install

# Seed the database (creates tables + inserts demo data R101-R108)
npm run db:seed

# Start development server (port 8080)
npm run dev
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server (port 3000)
npm run dev
```

Open: **http://localhost:3000**

### Environment Variables

Backend `.env`:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/atlas_industrial
PORT=8080
JWT_ACCESS_SECRET=jwt_access_secret_key
JWT_REFRESH_SECRET=jwt_refresh_secret_key
FRONTEND_ORIGIN=http://localhost:3000
```

---

## Demo Walkthrough (5 minutes)

### Step 1 — Open Coordinator Dashboard
Visit http://localhost:3000
- See **2 Urgent**, **4 Unassigned**, **2 Overdue**, **2 Needs Clarification**
- Immediate action board shows R101 (URGENT Unassigned), R102 (Visit not scheduled), R104 (Possible duplicate), R105 (Needs clarification)

### Step 2 — Triage R101 (Cold-room Urgent)
- Click **R101** → Detail drawer opens
- See: URGENT · Unassigned · Overdue 16h · Customer: Apex Cold Storage
- Click **Assign Technician** → Select Marcus Vance (T1) · Set visit time → Confirm
- Dashboard counts update: Unassigned drops, Overdue resolves for R101

### Step 3 — Handle R104 (Possible Duplicate)
- Click **R104** → See amber "Possible Duplicate of R101" banner
- Click **Mark Duplicate** → Confirm with R101 as the original
- R104 moves to DUPLICATE status, removed from active queue

### Step 4 — Review R105 (Needs Clarification)
- Click **R105** → See NEEDS_CLARIFICATION status
- Clarification notes explain: missing equipment ID, symptoms, business impact

### Step 5 — Switch to Operations Manager
- Role dropdown → **Samantha Wright (Operations Manager)**
- See health score, technician workload (T1: 1 job, T2: 1 job, T3: 1 job)
- Exceptions queue shows overdue/unassigned requests for manager intervention

### Step 6 — Switch to Technician T1
- Role dropdown → **Marcus Vance (T1)**
- See R101 and R102 as assigned jobs
- Click **Start Job** on R101 → Status transitions ASSIGNED → IN_PROGRESS
- Click **Mark Resolved** → Enter resolution notes → Confirm

### Step 7 — Return to Coordinator
- Verify R101 shows RESOLVED · Active count drops · Technician freed

---

## Request Lifecycle

```
NEW
 ├──→ NEEDS_CLARIFICATION (missing info)
 │         └──→ NEW (after clarification received)
 ├──→ ASSIGNED (technician dispatched)
 │         ├──→ IN_PROGRESS (technician on site)
 │         │         ├──→ WAITING_PART (parts ordered)
 │         │         │         └──→ IN_PROGRESS (parts arrived)
 │         │         └──→ RESOLVED ✓
 │         └──→ (reassigned → still ASSIGNED)
 └──→ DUPLICATE (consolidated into another ticket)
```
