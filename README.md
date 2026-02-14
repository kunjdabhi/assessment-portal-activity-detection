# Assessment Portal with IP & Activity Detection

An online assessment platform that monitors student activity during exams — detecting IP address changes, tab switches, copy/paste actions, fullscreen exits, and more. All events are logged immutably to MongoDB for admin review.


---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- ipinfo.io API token (free tier available)

### 1. Clone & Install

```bash
git clone <repo-url>
cd "IP Detection"

# Install frontend dependencies
cd IPDetection
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Configure Environment Variables

- Copy the `.env` examples above into `IPDetection/.env` and `backend/.env`
- Fill in your MongoDB URI and ipinfo.io token

### 3. Run Development Servers

Open two terminals:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd IPDetection
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

---

## How to Use

### Student Assessment Flow

1. Open the app → Enter your **full name** → Click **Start Testing**
2. The app enters **fullscreen mode** and starts the timer
3. Answer the assessment questions using Next/Previous navigation
4. Click **Submit** on the last question to complete the assessment

### What Gets Monitored

| Event                   | Trigger                                |
|-------------------------|----------------------------------------|
| `IP_CAPTURED_INITIALLY` | When the assessment starts             |
| `IP_CHECK_PERFORMED`    | Every 10 seconds (configurable)        |
| `IP_CHANGE_DETECTED`    | When the student's IP address changes  |
| `IP_CHANGE_CLASSIFIED`  | Classifies change as BENIGN/SUSPICIOUS |
| `FULLSCREEN_ENTERED`    | Student enters fullscreen              |
| `FULLSCREEN_EXITED`     | Student exits fullscreen               |
| `TAB_VISIBILITY_CHANGED`| Student switches tabs                  |
| `WINDOW_BLUR`           | Student clicks outside the browser     |
| `WINDOW_FOCUS`          | Student returns to the browser         |
| `COPY_DETECTED`         | Student copies text                    |
| `PASTE_DETECTED`        | Student pastes text                    |
| `TIMER_COMPLETED`       | Assessment timer expires               |
| `ATTEMPT_COMPLETED`     | Student submits the assessment         |

### IP Change Classification

When an IP change is detected, it is classified using [ipinfo.io](https://ipinfo.io):

- **BENIGN** — Same ISP and same city (e.g., normal ISP IP rotation)
- **SUSPICIOUS** — Different ISP or different city (possible VPN/proxy usage)

A real-time **notification banner** appears on the student's screen when an IP change is detected.

---

## Admin Dashboard

Access: `/admin` route (e.g., `http://localhost:5173/admin` or `https://your-app.netlify.app/admin`)

### Features
- View **all assessment attempts** with timestamps
- See **event counts** and **suspicious event counts** per attempt
- Click on any attempt to view the **full event timeline**
- Identify students with IP changes, tab switches, and other suspicious activity

### API Endpoints

| Method | Endpoint                                  | Description              |
|--------|-------------------------------------------|--------------------------|
| GET    | `/api/admin/attempts`                     | List all attempts        |
| GET    | `/api/admin/attempts/:attemptId/events`   | Get events for an attempt|
| POST   | `/api/ip`                                 | Register new attempt     |
| POST   | `/api/check-ip`                           | Check for IP change      |
| POST   | `/api/events`                             | Submit event logs        |
| POST   | `/api/complete-attempt`                   | Mark attempt complete    |

---

## Data Integrity

Event logs are **immutable** — once created, they cannot be updated or deleted. This is enforced at the database level using Mongoose middleware, ensuring a tamper-proof audit trail.

---

## Key Design Decisions

- **CustomEvent-based notifications** — IP change detection in the backend triggers a `CustomEvent` on the frontend for real-time UI notification
- **Session persistence** — Assessment state is saved to `localStorage` for recovery on page refresh or accidental close
- **Offline event queuing** — Events are queued locally when offline and synced when connectivity is restored
- **Separated service layer** — Controllers handle HTTP only; all DB logic lives in service files
