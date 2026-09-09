Smart Farmer Procurement Management System — Project Brief
Hackathon MVP | 7-day deadline | 2-person team
---
1. Problem & Solution
Problem: Farmers visiting a government procurement centre to sell crops have no visibility into queue position, wait time, or whether it's even worth visiting that day. They wait in long queues blind, or make repeated trips just to check status.
Solution: A web app where a farmer registers their crop for procurement, receives a digital token, and can remotely track their queue position, estimated wait time, and status — instead of physically waiting or repeatedly visiting.
Scope: Single procurement centre only (not multi-centre).
---
2. Tech Stack
Layer	Choice	Why
Backend	Node.js + Express	Simple, beginner-friendly, one language across stack
Frontend	Plain HTML + CSS + JavaScript (no React/UI library)	Avoids build tooling overhead for beginners; faster to debug in 7 days
Database	SQLite via `better-sqlite3`	Zero setup, file-based, synchronous API is easier for beginners than async drivers
Password hashing	`bcrypt`	Industry-standard, simple to use
Sessions/Auth	`express-session` + secure cookie	Simplest way to persist staff login across requests
Real-time mechanism	Polling (5–10s interval) — not WebSockets	Simpler to build/debug; acceptable given "near real-time" is enough for this use case
Dev setup	Express serves both API and static frontend (single server)	One process, one deployment target, no CORS complexity
Version control	GitHub, single `main` branch	Simple enough for 2 people, no branching overhead needed
Deployment	Single Node.js + Express app (e.g. Render/Railway), with persistent SQLite storage confirmed at deploy time	One deployable unit
---
3. Functional Requirements
Farmer side:
Register with: name, phone number, preferred date, preferred slot, crop type, quantity (kg/quintal).
Receive a unique daily sequential token (resets to 1 each day; uniqueness is `date + token_number`, not global).
View: token number, queue position, farmers ahead, estimated wait time.
Track status via phone number + token number + date (not just token number — token numbers repeat across days).
Cancel own booking — only allowed while status is `WAITING`. Cancelled token numbers are never reused or renumbered.
If not served within 10 minutes of being called, status becomes `MISSED`; farmer is told to book again.
When `farmers_ahead = 1`, farmer sees "You are next."
Staff side:
Log in with staff name + password (single shared/seeded staff account for MVP).
View current queue (waiting/called farmers for the day).
Call Next — advances lowest-numbered `WAITING` token to `CALLED`, starts the 10-minute timer (`called_at` timestamp).
Mark a called farmer as Served, Rejected, or Missed (manual override available).
Any status change triggers automatic queue/ETA recalculation for everyone else — done dynamically on next request, not stored.
Queue & ETA logic:
`Estimated Wait = Farmers Ahead × 5 minutes` (5 min/farmer is fixed, not dynamic, for MVP).
"Farmers ahead" = earlier tokens (same date) still in `WAITING` or `CALLED` status. `SERVED`, `REJECTED`, `MISSED`, `CANCELLED` don't count.
10-minute missed detection is server-clock based, checked lazily at the start of relevant requests (status poll, queue load, call-next) — no background job/cron needed for MVP.
---
4. Non-Functional Requirements
Performance: Status updates reflect within ~10s of a staff action (via polling). Pages load in ~3s under normal demo conditions.
Scale: Designed for ~100 tokens/day — no need for production-scale traffic handling.
Security: Farmer status lookup requires phone + token + date (prevents guessing another farmer's status via token alone). Staff actions require an authenticated session. Staff password stored hashed (bcrypt), never in plaintext.
Usability: Simple, large-button UI; minimal typing; usable on low-end phones and slow connections.
Availability: SQLite file must persist across server restarts — no data loss.
Constraints: 7-day deadline, 2 beginner-level developers, single centre, web-based (responsive, not native app).
---
5. Scope Boundaries
Must-have: everything listed in Functional Requirements above.
Nice-to-have (cut first if behind schedule): UI polish/animations, booking history, editing bookings after submission, admin analytics/reports, SMS/push notifications.
Explicitly out of scope: multiple centres, real government API integration, payments, native mobile app, offline mode, production-grade auth, multiple staff accounts/roles, WebSockets, multi-language support.
---
6. Database Schema (2 tables)
`bookings`
Column	Type	Notes
id	INTEGER PK AUTOINCREMENT	
name	TEXT	
phone	TEXT	
date	TEXT	`YYYY-MM-DD`
slot	TEXT	
crop_type	TEXT	
quantity	REAL	
token_number	INTEGER	resets daily; unique with `date`
status	TEXT	`WAITING`/`CALLED`/`SERVED`/`REJECTED`/`MISSED`/`CANCELLED`
called_at	TEXT	NULL until Call Next pressed
created_at	TEXT	
updated_at	TEXT	
UNIQUE constraint: `(date, token_number)`
`staff`
Column	Type
id	INTEGER PK AUTOINCREMENT
name	TEXT
password_hash	TEXT (bcrypt)
No foreign keys between tables. Queue position/ETA are calculated on request, never stored.
---
7. API Endpoints
Method	Route	Access	Purpose
POST	`/api/bookings`	Public	Register + generate token
GET	`/api/bookings/status`	Public	Track status (polling)
POST	`/api/bookings/cancel`	Public	Cancel own booking
POST	`/api/staff/login`	Public	Staff login
POST	`/api/staff/logout`	Staff	Staff logout
GET	`/api/staff/queue`	Staff	Get current queue
POST	`/api/staff/queue/call-next`	Staff	Advance queue
POST	`/api/staff/bookings/:id/served`	Staff	Mark served
POST	`/api/staff/bookings/:id/rejected`	Staff	Mark rejected
POST	`/api/staff/bookings/:id/missed`	Staff	Manual missed override
Full request/response contracts, status codes, and validation rules are finalized — ask if you need the detailed version.
---
This brief reflects all decisions approved through Phase 2 (Architecture & Tech Stack). We are now in Phase 3 (Environment Setup).
