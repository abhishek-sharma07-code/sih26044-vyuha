# Ayush-Setu: Academia - Industry Collaboration & Skill Mapping Portal
### 🏆 Smart India Hackathon (SIH26044) Working Prototype
**Organization:** Ministry of Ayush, Government of India  
**Category:** Software | **Theme:** Smart Automation  
**Problem Statement ID:** SIH26044  
**Title:** *Portal for Academia - Industry collaboration for Skill Mapping, Internships and Placement*

---

## 📌 Executive Summary

Traditional higher education and industry hiring currently operate in disconnected silos. Students study theoretical syllabi without knowing what competencies companies truly require; industry recruiters spend months screening generic resumes with unverified claims; universities lack real-time market data to adapt curricula; and government ministries lack centralized visibility into regional skill supply vs. demand.

**Ayush-Setu (SIH26044)** is an integrated, full-stack digital platform designed specifically to bridge academia, industry, and the Ministry into a unified smart ecosystem.

```
                    ┌────────────────────────────────────────────────────────┐
                    │      AYUSH-SETU CENTRAL COLLABORATION PLATFORM         │
                    │               (SIH Problem ID: 26044)                  │
                    └────────────────────────────────────────────────────────┘
                                    │               │
        ┌───────────────────────────┴───────┐   ┌───┴────────────────────────────┐
        ▼                                   ▼   ▼                                ▼
┌─────────────────────┐       ┌──────────────────────┐  ┌────────────────┐ ┌────────────────┐
│   Student Portal    │       │  Industry Recruiter  │  │ Academia / TPO │ │ Ministry Admin │
├─────────────────────┤       ├──────────────────────┤  ├────────────────┤ ├────────────────┤
│ • AI Skill Radar    │       │ • Job & Internship   │  │ • Curriculum   │ │ • Macro Skill  │
│ • Gap & Roadmap     │       │   Rubrics Posting    │  │   Gap Analysis │ │   Supply-Demand│
│ • 1-Click Apply     │       │ • ATS Kanban Board   │  │ • Student Skill│ │ • Institutional│
│ • Verified Badges   │       │ • Candidate Search   │  │   Endorsements │ │   Readiness    │
│ • Joint R&D Capstone│       │ • Post R&D Challenges│  │ • MoU Manager  │ │ • State Trends │
└─────────────────────┘       └──────────────────────┘  └────────────────┘ └────────────────┘
```

---

## 🌟 Key Features & Innovations

### 1. 🎓 Student & Jobseeker Portal
- **AI Skill Gap & Compatibility Engine:** Select any target industry benchmark role (e.g. *Ayurvedic Formulation Scientist*, *Clinical Trial Associate*, *QC Analyst*, *Biomedical Data Scientist*). The platform computes an automated compatibility index ($0-100\%$) and dynamically generates a **Skill Radar Chart** comparing the student's mastery against industry standards.
- **Actionable Upskilling Roadmap:** Missing or partial skills are paired with direct recommendations: targeted micro-courses, accredited institutions (NPTEL, SWAYAM, PCIM&H, NMPB), and practical bridge lab project specifications.
- **Smart Internship & Placement Matchmaker:** Real-time percentage compatibility scores on all listings. 1-Click application with immediate status tracking.
- **Accredited Skill Quizzes & Verifiable Badges:** Timed, domain-specific assessments (e.g., HPLC Reverse-Phase Chromatography, ICH-GCP Clinical Protocols, Pharmacopoeial Standardization). Scoring $\ge 70\%$ awards an instant digital verified badge.
- **Joint R&D Challenges:** Discover industry-funded capstones and submit team proposals with faculty guides.

### 2. 🏢 Industry & Recruiter Portal
- **Job & Internship Posting:** Structured skill matrix rubrics, stipend/CTC, duration, work mode (Hybrid, On-site, Remote), and application deadlines.
- **Applicant Tracking System (ATS Kanban):** Drag-and-drop / 1-click status progression (*Applied* $\to$ *Shortlisted* $\to$ *Interview* $\to$ *Offered*).
- **Candidate Talent Pool Search:** Filter students across India by verified skill badges, college, and CGPA.
- **Post R&D Challenges:** Sponsor industry capstones and provide grants to academic research teams.

### 3. 🏛️ Academia & TPO (Training & Placement Officer) Portal
- **Curriculum vs. Industry Alignment Matrix:** Analyzes syllabus topics taught across university semesters and compares them in real-time against skills demanded by open corporate vacancies. Identifies critical curriculum deficiencies (e.g., modern ICH stability testing or MedDRA coding).
- **Student Skill Endorsements:** Faculty review queue to verify student project claims and award institutional credibility.
- **Digital MoU Lifecycle Manager:** Manage bilateral agreements (Dabur, Himalaya, Patanjali, Biocon) with active deliverables and renewal milestones.

### 4. 🇮🇳 Ministry & Central Admin Dashboard
- **Macro Skill Barometer:** Real-time analytics on nationwide talent readiness, active industry collaborations, and sector distribution (*Ayush & Phytomedicine*, *Clinical Research*, *Biotechnology*, *Herbal QA*).
- **Regional Hub Performance:** Track institutional placement velocity and employability index across state clusters (Delhi-NCR, Maharashtra, Karnataka, Gujarat, Kerala).

---

## 🚀 Quick Start & Installation

### Prerequisites
- Python 3.10+ (Tested and verified on Python 3.14)
- Web browser (Chrome, Edge, Firefox, Safari)

### 1. Clone or Open the Project
```bash
cd C:\Users\ASUS\.gemini\antigravity\scratch\sih26044-collab-portal
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Launch the Server
```bash
python run.py
```
Open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

## 🎬 3-Minute SIH Hackathon Demo Script for Judges

| Step | Action in Demo | What the Judges See |
| :--- | :--- | :--- |
| **1. Student Persona** | Switch top dropdown to **Priya Sharma (Student)**. | Interactive **Skill Radar Chart** comparing Priya's skills against "Ayurvedic Formulation Scientist". Show matched vs missing skills, and the curated **AI Upskilling Roadmap**. |
| **2. 1-Click Match & Apply** | Navigate to **Internships & Placements** tab. | Notice the **Match Score** badge on each card (e.g., 88% Match for Dabur, 94% for Himalaya). Click **"1-Click Apply"** to submit instantly. |
| **3. Take Skill Assessment** | Navigate to **Domain Quizzes & Badges** tab. Click **"Take Assessment"** on HPLC Analysis. | Real-time countdown timer, 3 technical questions. Submit test $\to$ score 100% $\to$ **Verified Skill Badge immediately awarded** to portfolio! |
| **4. Recruiter ATS Kanban** | Switch top persona to **Dr. Rajesh Verma (Dabur R&D)**. | View the **ATS Kanban board**. Advance Priya Sharma from *Applied* to *Shortlisted* to *Interview* with 1 click! |
| **5. Academia / TPO Matrix** | Switch top persona to **Prof. Sunita Rao (AIIA TPO)**. | View the **Curriculum Alignment Matrix** and Bar Chart showing live industry demand vs university syllabus deficiencies. Endorse a student's skill. |
| **6. Ministry Dashboard** | Switch top persona to **Shri V. K. Saxena (Ministry Admin)**. | Nationwide macro analytics: Donut chart of sector distribution, 44 industry partners, and regional state clusters. Click **Export Summary**. |

---

## 🧪 Automated Test Verification

A complete automated test suite is provided in `verify_prototype.py`:
```bash
python verify_prototype.py
```
**Test Coverage:**
- `[PASS]` Test 1: Frontend HTML served with official SIH26044 branding
- `[PASS]` Test 2: Role switching API with 4 distinct personas
- `[PASS]` Test 3: AI Skill Gap Analyzer & Radar benchmark scoring
- `[PASS]` Test 4: Dynamic job match calculation across vacancies
- `[PASS]` Test 5: 1-Click internship application submission
- `[PASS]` Test 6: Recruiter ATS Kanban stage transitions
- `[PASS]` Test 7: Domain skill assessment, grading & verified badge issuance
- `[PASS]` Test 8: TPO curriculum gap analysis & faculty endorsements
- `[PASS]` Test 9: Ministry macro dashboard & regional state clusters

---

## 📁 Project Structure

```
sih26044-collab-portal/
├── app.py                      # Flask application & REST API endpoints
├── database.py                 # SQLite schema & domain-rich seed data
├── portal.db                   # SQLite database (auto-initialized)
├── requirements.txt            # Python dependencies (Flask)
├── run.py                      # One-command server runner
├── verify_prototype.py         # Automated verification test suite
├── README.md                   # Hackathon documentation & demo guide
├── services/
│   └── matching_engine.py      # Skill gap analysis & job compatibility scoring algorithms
└── static/
    ├── index.html              # Responsive single-page application
    ├── css/
    │   └── styles.css          # Design system, glassmorphism, ATS Kanban, Radar layouts
    └── js/
        └── app.js              # Client-side reactivity, Chart.js integrations, API handlers
```

---

## 📜 Compliance & Accreditations
- **Ministry of Ayush** National Competency Framework alignment
- **NAAC / NBA** criterion for Academia-Industry linkage and syllabus benchmarking
- **ICH-GCP & Ayurvedic Pharmacopoeia of India (API)** standard references
