# AyushSetu: National Academia - Industry Integration & Placement Platform

**Ministry of Ayush, Government of India**  
*National Central Platform for Competency Mapping, Evidence-Based Verification, Bilateral Industry Collaborations, and Direct Placements.*

---

## 📌 Executive Summary

Traditional higher education and corporate recruitment in the Ayush, pharmaceutical, and biotechnology sectors have historically operated in disconnected silos. Academic institutions struggle to keep syllabi updated with rapidly evolving laboratory and regulatory standards; recruiters spend months screening self-declared resumes without objective proof of practical competency; and national governing bodies lack macro-level observability into regional skill gaps.

**AyushSetu** is an enterprise-grade digital ecosystem designed to bridge academia, industry, and the Ministry into a unified, high-velocity collaboration engine.

```
                    ┌────────────────────────────────────────────────────────┐
                    │      AYUSHSETU CENTRAL COLLABORATION PLATFORM          │
                    │               (Ministry of Ayush)                      │
                    └────────────────────────────────────────────────────────┘
                                    │               │
        ┌───────────────────────────┴───────┐   ┌───┴────────────────────────────┐
        ▼                                   ▼   ▼                                ▼
┌─────────────────────┐       ┌──────────────────────┐  ┌────────────────┐ ┌────────────────┐
│   Student Portal    │       │  Industry Recruiter  │  │ Academia / TPO │ │ Ministry Admin │
├─────────────────────┤       ├──────────────────────┤  ├────────────────┤ ├────────────────┤
│ • AI Skill Radar    │       │ • Job & Internship   │  │ • Curriculum   │ │ • Macro Skill  │
│ • Gap & Roadmap     │       │   Rubrics Posting    │  │   Gap Analysis │ │   Supply-Demand│
│ • 1-Click Apply     │       │ • ATS Kanban Board   │  │ • AI Syllabus  │ │ • Predictive   │
│ • W3C Verifiable    │       │ • Candidate Search   │  │   Upgrade Prop.│ │   Deficit Radar│
│   Credentials       │       │ • Joint R&D Grants   │  │ • MoU Manager  │ │ • State Trends │
└─────────────────────┘       └──────────────────────┘  └────────────────┘ └────────────────┘
```

---

## 🏆 Winning Differentiators & Standout Features

1. **W3C-Standard Cryptographically Verifiable Skill Credentials**:
   - Every domain assessment passed or faculty endorsement generates an immutable credential with a SHA-256 cryptographic hash, issuing authority signature, and a public verification link with dynamic QR code.
2. **AI Curriculum Auto-Remediation Generator (Syllabus-to-Market Auto-Mapper)**:
   - Evaluates academic syllabi against 500+ active pharmaceutical job postings (Dabur, Himalaya, Patanjali) and auto-generates a ready-to-table **Academic Council Syllabus Upgrade Proposal** in 1 click.
3. **12–24 Month Macro Talent Deficit Forecaster**:
   - Predictive trend modeling that anticipates industry talent shortages up to 24 months in advance, alerting universities to ramp up seats before critical market deficits emerge.
4. **Live In-App Database Studio**:
   - Integrated visual control panel allowing evaluators and recruiters to add students, post opportunities, register MoUs, or inspect raw database metrics live from the browser without reloading.
5. **Steve Jobs Minimalist Dark Aesthetic**:
   - Apple-grade visual hierarchy: Slate-950 background, crisp SF Pro typography, frosted glass depth (`backdrop-filter: blur(16px)`), and soothing cosmic-pastel accents (`linear-gradient(135deg, #6366f1, #a855f7, #ec4899)`).

---

## 💾 How to Enter Data into the Database

AyushSetu provides **four flexible, production-grade methods** to insert and manage data in the SQLite database (`portal.db`):

### Method 1: In-App UI Modals (Visual & Instant)
- **Recruiter Role**: Click the **"+ Post New Opportunity"** button on the recruiter dashboard to open the structured job posting modal (Title, Company, Stipend, Required Skill Rubrics, Location). Submitting updates the database immediately and recalibrates student match scores in real time.
- **Institution / TPO Role**: Click **"+ Register MoU"** to add bilateral industry agreements with deliverable tracking and renewal dates.
- **Student Role**: Click **"+ Add Custom Skill"** to add newly acquired technical proficiencies to their portfolio.

### Method 2: Live In-App Database Studio
- Click the **"DB Studio"** button in the top navigation bar or footer.
- The modal allows you to:
  1. Inspect live row counts across all tables (Users, Students, Recruiters, Jobs, Applications, MoUs, Credentials).
  2. Add new student profiles with CGPA and initial skills.
  3. Post new internships/placements.
  4. Register new bilateral MoUs.
  5. 1-Click reset/re-seed the database back to clean baseline state.

### Method 3: Command-Line Utility (`data_manager.py`)
Run the interactive CLI utility directly from your terminal:

```bash
# 1. View live record metrics
python data_manager.py stats

# 2. Add a new student
python data_manager.py add-student "Vikas Mehra" "vikas@aiia.gov.in" "AIIA Delhi" "B.Pharm (Ayurveda)" 9.1 "HPLC Analysis,GLP,Extraction"

# 3. Post a new job/internship
python data_manager.py add-job 4 "Dabur India" "Bio-Formulation Intern" "Internship" "Delhi-NCR" "₹32,000/mo" "HPLC Analysis,GLP"

# 4. Register a bilateral MoU
python data_manager.py add-mou "AIIA Delhi" "Dabur R&D" "Phytopharm Research Alliance" "Formulation & QC" "15 Fellowships"

# 5. Run ad-hoc SQL queries
python data_manager.py query "SELECT id, name, role, organization FROM users LIMIT 5;"

# 6. Re-seed database with baseline data
python data_manager.py seed
```

### Method 4: REST API Endpoints (cURL / Postman / Python)
- `POST /api/students`: Create new student profile.
- `POST /api/jobs`: Post new job or internship opportunity.
- `POST /api/mous`: Register institutional MoU.
- `POST /api/skills/add`: Add competency to student portfolio.
- `POST /api/apply`: Submit student application with match score.
- `POST /api/database/seed`: Reset and re-seed database.

---

## 🚀 Quick Start & Installation

### Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Modern Web Browser (Chrome, Safari, Edge, Firefox)

### 1. Open Directory
```bash
cd C:\Users\ASUS\.gemini\antigravity\scratch\sih26044-collab-portal
```

### 2. Launch Server
```bash
python run.py
```
Open your browser and navigate to:
```
http://127.0.0.1:5000
```

### 3. Run Automated Test Verification Suite
```bash
python test_portal.py
```
All 20 test cases will execute and verify frontend assets, zero SIH branding, database entry, and APIs.

---

## 🎬 Evaluation & Demo Guide for Reviewers

| Step | Action in Demo | What You See |
| :--- | :--- | :--- |
| **1. Multi-Role Sign In** | Click **"Sign In"** in top navbar. Click **"1-Click Demo Login"** on Student. | Smoothly authenticates as **Priya Sharma (B.Pharm Ayurveda, AIIA)** with active session pill. |
| **2. Hero Interactive Dial** | Toggle between *Ayurvedic Formulation*, *Clinical Trials*, and *QC*. | Watch the real-time SVG circular gauge smoothly recalibrate and render matched vs gap competencies. |
| **3. AI Skill Gap & Bridges** | Scroll to **Console** $\to$ Select *Ayurvedic Formulation Scientist*. | View live 88% Match score, verified competencies, and curated **AI Upskilling Bridges** (NPTEL/SWAYAM/PCIM&H). |
| **4. Cryptographic Badge** | Click **"Take Assessment"** on HPLC Analysis $\to$ Submit Quiz. | Scores 100% $\to$ Awards a **W3C Verifiable Credential** with SHA-256 hash and scannable QR verification link. |
| **5. 1-Click Match & Apply** | In Matched Openings, click **"1-Click Apply"** on Dabur Phytochemistry Intern. | Instantly submits portfolio with live match score. |
| **6. Recruiter ATS Kanban** | Click **"Switch Persona"** $\to$ Select **Recruiter: Dr. Rajesh Verma (Dabur)**. | View the **ATS Kanban board**. Advance candidate from *Applied* to *Shortlisted* to *Interview* with 1 click. |
| **7. Live Data Entry** | Click **"+ Post New Opportunity"** or open **"DB Studio"**. Post a job. | Job is live in SQLite DB; switch back to student and watch it appear in their matched feeds! |
| **8. AI Syllabus Proposal** | Switch to **Institution / TPO** $\to$ Click **"★ Generate Syllabus Proposal"**. | Auto-generates a formal Academic Council Dossier with module credit allocations and projected placement lifts (+24%). |
| **9. Ministry Barometer** | Switch to **Ministry Admin: Shri V. K. Saxena**. | View national macro metrics, regional state clusters, and the **12–24 Month Macro Talent Deficit Forecaster**. |
