# Student Performance Prediction Analytics 🎓⚡
> **Early Warning & Explainable AI Intervention Platform for Educational Institutions**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?style=flat&logo=react)](https://reactjs.org)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.4+-F7931E.svg?style=flat&logo=scikit-learn)](https://scikit-learn.org)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57.svg?style=flat&logo=sqlite)](https://sqlite.org)

---

## 1. Problem Statement
In traditional educational workflows, student academic distress is often recognized only after formal quarterly or semester exam results are finalized — by which time academic gaps, attendance deficits, and subject disengagement have become severe. Teachers lack early, transparent, multi-factor indicators to intervene proactively before a student drops out or fails.

## 2. Solution & Core Flow
**Student Performance Prediction Analytics (EduPredict AI)** is a full-stack SaaS platform that aggregates attendance records, continuous quiz evaluations, assignment turnaround times, and digital LMS portal interactions to predict at-risk students before minor dips become serious failures.

```
Student Data (GPA, Attendance, LMS, Tests, Assignments)
       ↓
Data Processing & Standardization
       ↓
Machine Learning Classification (RandomForest / GradientBoosting / LogisticRegression)
       ↓
Calibrated Continuous Risk Score (0–100%) & Risk Level (Low / Medium / High)
       ↓
Explainable Insights ("Why is this student at risk?")
       ↓
Teacher Action Dashboard
       ↓
Automated Early Alerts + Targeted Step-by-Step Interventions
```

---

## 3. Key Features

- **📊 Comprehensive Teacher Dashboard**:
  - Aggregated KPI cards: Total Cohort, Low / Medium / High risk distribution, Average Attendance %, Average GPA.
  - Interactive Chart.js visualizers: Risk Doughnut distribution, 5-month progression trends (Nov–Mar), Attendance vs. Performance scatter correlation, and Risk factor prevalence bars.
  - "Students Requiring Attention" high-risk priority queue.

- **🔍 Explainable AI Diagnostics ("Why is this student at risk?")**:
  - Transparent factor attribution benchmarking each student's attendance, test mastery, coursework completion, and LMS logins against safety baselines.
  - No blackbox guesswork — provides exact weights and root-cause explanations.

- **🤖 Machine Learning Model Benchmarking**:
  - Live empirical evaluation comparing **Random Forest**, **Gradient Boosting**, and **Logistic Regression**.
  - Metrics calculated from test holdout: **Accuracy**, **Precision**, **Recall**, and **F1-Score**.
  - Feature Importance rankings based on Gini impurity.
  - One-click live model retraining (`POST /api/train-model`).

- **⚡ Interactive Risk Prediction Simulator**:
  - Test custom or prospective student profiles in real-time.
  - Instant risk score calculation, confidence level, key risk drivers, and 1-click cohort saving.

- **🚨 Early Warning Alerts System**:
  - Filterable notification feed with status tracking (`New` ➔ `Reviewed` ➔ `Resolved`).

- **📋 Personalized Intervention & Action Plans**:
  - Structured pedagogical recommendations tailored to diagnosed weak points with assigned roles and target deadlines.

---

## 4. Technology Stack

- **Frontend**: React 18, Vite, Lucide Icons, Chart.js, React-ChartJS-2, Modern CSS Design System
- **Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic v2
- **Machine Learning**: Scikit-learn, Pandas, NumPy, Joblib
- **Database**: SQLite (SQLAlchemy 2.0 ORM) with automatic seeding of 75 logically consistent student profiles
- **Architecture**: REST API with CORS middleware and reactive dashboard frontend

---

## 5. Folder Structure

```
student-performance-analytics/
├── backend/
│   ├── app/
│   │   ├── database/
│   │   │   ├── session.py        # SQLite engine & session factory
│   │   │   └── __init__.py
│   │   ├── models/               # SQLAlchemy ORM models
│   │   │   ├── student.py        # Student profile & history
│   │   │   ├── alert.py          # Early warning alerts
│   │   │   ├── recommendation.py # Targeted interventions
│   │   │   ├── prediction.py     # Prediction audit logs
│   │   │   └── user.py           # Faculty credentials
│   │   ├── schemas/              # Pydantic validation schemas
│   │   ├── services/
│   │   │   ├── risk_engine.py    # Risk scoring & factor diagnostics
│   │   │   ├── data_service.py   # Seed dataset generator (75 students)
│   │   │   ├── alert_service.py  # Automated alert generation
│   │   │   └── recommendation_engine.py # Rule-based action planner
│   │   ├── ml/
│   │   │   ├── train.py          # Algorithmic benchmark & model saver
│   │   │   └── predictor.py      # ML inference & explainability
│   │   ├── routes/               # FastAPI endpoint routers
│   │   └── main.py               # Application entry point & lifecycle
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/           # Sidebar, Navbar, Badges, Modals
│   │   ├── charts/               # Doughnut, Line, Scatter, Bar charts
│   │   ├── pages/                # Dashboard, Students, Predict, Alerts, etc.
│   │   ├── services/             # API client methods
│   │   ├── styles/               # CSS Design System
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── data/
│   ├── students.csv              # Exported cohort dataset
│   └── student_analytics.db      # SQLite database
├── models/
│   ├── student_risk_model.joblib # Serialized best ML model
│   └── model_metrics.json        # Empirical evaluation metrics
├── scripts/
│   ├── test_backend.py           # Automated end-to-end test suite
│   └── start_servers.bat         # 1-click startup launcher
└── README.md
```

---

## 6. Installation & How to Run

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Backend Setup
```bash
# In project root
py -m pip install -r backend/requirements.txt

# Start FastAPI server on port 8000
py -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```

### Frontend Setup
```bash
# In frontend directory
cd frontend
npm install
npm run dev
```

The React dashboard will be available at: **`http://localhost:3000`**  
The FastAPI interactive documentation is at: **`http://127.0.0.1:8000/docs`**

---

## 7. Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Lead Faculty / Teacher** | `teacher@example.com` | `teacher123` |

*(A 1-click "Auto Fill" button is provided directly on the login screen for seamless demonstration).*

---

## 8. Main API Endpoints

- `POST /api/auth/login` — Authenticate faculty user
- `GET /api/dashboard` — Aggregated KPI statistics, trend series, and risk charts
- `GET /api/students` — Query, search, and filter student directory
- `GET /api/students/{id}` — Detailed student profile with explainability & history
- `POST /api/predict` — Real-time ML risk prediction + explainable insights
- `GET /api/alerts` — Fetch early warning triggers with status filters
- `PATCH /api/alerts/{id}/status` — Update alert state (`New`, `Reviewed`, `Resolved`)
- `GET /api/recommendations` — Fetch personalized intervention actions
- `POST /api/train-model` — Retrain benchmark models and persist best classifier
- `GET /api/model-metrics` — Return empirical benchmarking matrix & feature rankings

---

## 9. ML Approach & Empirical Benchmarks

- **Target Label**: `risk_level` (`Low`, `Medium`, `High`)
- **Features Used**:
  - `previous_gpa` (0.0 – 4.0)
  - `test_score` (0 – 100%)
  - `attendance_percentage` (0 – 100%)
  - `assignment_completion` (0 – 100%)
  - `lms_login_frequency` (logins/month)
  - `class_participation` (0 – 100%)
  - `behavior_score` (0 – 100%)
- **Trained Models**:
  - **Random Forest Classifier** (Selected Best Model) — Accuracy: 86.7%, F1-Score: 0.868
  - **Gradient Boosting Classifier** — Accuracy: 86.7%, F1-Score: 0.868
  - **Logistic Regression (Standardized)** — Accuracy: 80.0%, F1-Score: 0.802

---

## 10. 3–5 Minute Hackathon Presentation Demo Flow

1. **Login Screen**:
   - Open `http://localhost:3000`.
   - Click **"Auto Fill"** for demo credentials (`teacher@example.com`) and click **"Access Analytics Dashboard"**.

2. **Dashboard Overview**:
   - Highlight the 6 KPI metric cards and risk distribution (Low / Medium / High).
   - Point out the **Attendance vs. Performance scatter plot** and 5-month trend line.

3. **Student Drill-Down & Explainable Insights**:
   - In the **"Students Requiring Attention"** table, click **"View Details"** on a high-risk student (e.g. *Rohan Verma*).
   - Show the **"Why is this student at risk?"** section highlighting Attendance deficit (&lt;65%) and Academic test struggles (&lt;50%).
   - Review the step-by-step **Recommended Action Plan** and change status to *"In Progress"*.

4. **Live Interactive ML Prediction**:
   - Click **"Predict Risk"** in the top navbar.
   - Click the preset **"⚡ High Risk Preset"** or enter custom values.
   - Click **"PREDICT PERFORMANCE RISK"**.
   - Show the dynamic risk meter (e.g. 83.4% High Risk), model confidence, key root causes, and click **"Save Student to Database"**.

5. **Early Warning Alerts & Interventions**:
   - Open **Early Alerts** tab to see active alerts and mark an alert as *Reviewed*.
   - Open **Analytics & ML** tab to show live model benchmark scores and feature importances.

---

## 11. Known Limitations & Future Scope
- **Current Prototype**: Uses SQLite and synthetic student cohort data calibrated to real-world educational distributions.
- **Future Scope**: Direct integration with Canvas/Moodle LMS LTI webhooks, automated SMS notification to parents, and multi-year longitudinal grade trajectory forecasting.

---

## 12. Deployment

This section covers how to deploy the **backend** (FastAPI) and **frontend** (React + Vite) to production.

### Environment Variables

#### Backend (set on the server or in a `.env` file — never commit `.env`!)

| Variable | Default | Description |
|---|---|---|
| `HOST` | `0.0.0.0` | Uvicorn bind host |
| `PORT` | `8000` | Uvicorn bind port |
| `ENVIRONMENT` | `production` | Runtime environment label |
| `DATABASE_URL` | `sqlite:///./data/student_analytics.db` | SQLAlchemy database connection string. Use `postgresql://...` for managed databases in production. |
| `CORS_ORIGINS` | `*` | Comma-separated list of allowed frontend origins. **Always set this in production.** Example: `https://your-app.vercel.app,http://localhost:3000` |
| `SECRET_KEY` | *(required in production)* | Secret key for JWT signing and session encryption |
| `DEMO_TEACHER_EMAIL` | `teacher@example.com` | Login email for demo user |
| `DEMO_TEACHER_PASSWORD` | `teacher123` | Login password for demo user |

#### Frontend (set in `.env` or hosting provider dashboard)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | *(empty — uses Vite proxy `/api`)* | Full URL of deployed backend. Example: `https://your-backend.onrender.com` |

---

### Option A — Render (Recommended)

#### Backend on Render (Web Service)
1. Create a new **Web Service** and connect your GitHub repository.
2. Set **Root Directory** to `backend/`.
3. Set **Build Command**: `pip install -r requirements.txt`
4. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables in Render dashboard (see table above).
6. Set `DATABASE_URL` to a managed PostgreSQL URL or keep SQLite for small deployments.

#### Frontend on Render (Static Site)
1. Create a new **Static Site** and connect your GitHub repository.
2. Set **Root Directory** to `frontend/`.
3. Set **Build Command**: `npm install && npm run build`
4. Set **Publish Directory**: `dist`
5. Add environment variable: `VITE_API_BASE_URL=https://your-backend.onrender.com`

---

### Option B — Railway

#### Backend
```bash
# In Railway project, set start command:
cd backend && pip install -r requirements.txt && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```
Set all environment variables in Railway's variable panel.

#### Frontend
Deploy `frontend/` as a static site (Railway Static or Nixpacks). Set `VITE_API_BASE_URL` to the Railway backend URL.

---

### Option C — Vercel (Frontend) + Render/Railway (Backend)

1. Deploy the backend on Render or Railway as above.
2. In the `frontend/` folder:
   ```bash
   npm install && npm run build
   ```
3. Deploy the generated `frontend/dist/` folder to Vercel.
4. In Vercel project settings, add environment variable:
   - `VITE_API_BASE_URL` = `https://your-backend.onrender.com`

---

### Option D — Docker / VPS

```dockerfile
# Backend Dockerfile (place in backend/)
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Frontend build
cd frontend
npm install
npm run build
# Serve dist/ with Nginx or any static file host
```

---

### Production Start Commands

| Component | Command |
|---|---|
| **Backend** | `uvicorn app.main:app --host 0.0.0.0 --port 8000` |
| **Frontend build** | `cd frontend && npm run build` |
| **Frontend preview** | `cd frontend && npm run preview` |

---

### GitHub Readiness Checklist

- [x] `.gitignore` excludes `node_modules/`, `venv/`, `.env`, `*.db`, `__pycache__/`
- [x] No hardcoded secrets, API keys, or passwords in source code
- [x] `.env.example` files provided for both backend and frontend
- [x] `VITE_API_BASE_URL` configures frontend API endpoint
- [x] `CORS_ORIGINS` configures backend allowed origins
- [x] `DATABASE_URL` supports both SQLite and PostgreSQL
- [x] ML model auto-trains on first startup if not present
- [x] `requirements.txt` is up to date
- [x] `npm run build` produces a clean production bundle

> **The project is ready for GitHub and cloud deployment.**

