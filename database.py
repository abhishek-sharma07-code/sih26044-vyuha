import sqlite3
import json
import os
import shutil

# Respect path set by app.py (handles Vercel /tmp vs local dev)
_default_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "portal.db")
DB_PATH = os.environ.get("AYUSHSETU_DB_PATH") or (
    "/tmp/portal.db" if (os.environ.get("VERCEL") or os.environ.get("NOW_REGION")) else _default_path
)


def get_db_connection():
    if not os.path.exists(DB_PATH):
        init_db()
    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    cursor = conn.cursor()


    # Create tables
    cursor.executescript("""
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS student_profiles;
    DROP TABLE IF EXISTS skills;
    DROP TABLE IF EXISTS student_skills;
    DROP TABLE IF EXISTS target_roles;
    DROP TABLE IF EXISTS jobs;
    DROP TABLE IF EXISTS applications;
    DROP TABLE IF EXISTS mous;
    DROP TABLE IF EXISTS joint_projects;
    DROP TABLE IF EXISTS assessments;
    DROP TABLE IF EXISTS curriculum_modules;

    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL, -- 'student', 'recruiter', 'tpo', 'admin'
        organization TEXT NOT NULL,
        avatar_initials TEXT NOT NULL,
        bio TEXT
    );

    CREATE TABLE student_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        college TEXT NOT NULL,
        degree TEXT NOT NULL,
        graduation_year INTEGER NOT NULL,
        cgpa REAL NOT NULL,
        resume_summary TEXT,
        target_role_id INTEGER,
        target_location TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL,
        description TEXT
    );

    CREATE TABLE student_skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        skill_name TEXT NOT NULL,
        proficiency TEXT NOT NULL, -- 'Beginner', 'Intermediate', 'Advanced'
        verified INTEGER DEFAULT 0, -- 0 = self-declared, 1 = verified
        verified_by TEXT,
        FOREIGN KEY (student_id) REFERENCES users(id)
    );

    CREATE TABLE target_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        sector TEXT NOT NULL,
        description TEXT,
        required_skills_json TEXT NOT NULL,
        avg_salary TEXT,
        demand_level TEXT
    );

    CREATE TABLE jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recruiter_id INTEGER NOT NULL,
        company TEXT NOT NULL,
        title TEXT NOT NULL,
        job_type TEXT NOT NULL, -- 'Internship', 'Placement'
        location TEXT NOT NULL,
        work_mode TEXT NOT NULL, -- 'On-site', 'Remote', 'Hybrid'
        stipend_salary TEXT NOT NULL,
        duration TEXT NOT NULL,
        description TEXT NOT NULL,
        required_skills_json TEXT NOT NULL,
        openings INTEGER DEFAULT 1,
        deadline TEXT NOT NULL,
        status TEXT DEFAULT 'Open',
        FOREIGN KEY (recruiter_id) REFERENCES users(id)
    );

    CREATE TABLE applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        match_score INTEGER NOT NULL,
        status TEXT DEFAULT 'Applied', -- 'Applied', 'Shortlisted', 'Interview', 'Offered', 'Rejected'
        applied_date TEXT NOT NULL,
        notes TEXT,
        FOREIGN KEY (job_id) REFERENCES jobs(id),
        FOREIGN KEY (student_id) REFERENCES users(id)
    );

    CREATE TABLE mous (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        institution_name TEXT NOT NULL,
        industry_partner TEXT NOT NULL,
        title TEXT NOT NULL,
        signed_date TEXT NOT NULL,
        valid_until TEXT NOT NULL,
        status TEXT DEFAULT 'Active',
        focus_area TEXT NOT NULL,
        deliverables TEXT NOT NULL,
        joint_initiatives_count INTEGER DEFAULT 0
    );

    CREATE TABLE joint_projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company TEXT NOT NULL,
        title TEXT NOT NULL,
        domain TEXT NOT NULL,
        description TEXT NOT NULL,
        mentor_name TEXT NOT NULL,
        academic_collaborator TEXT,
        stipend_or_grant TEXT NOT NULL,
        duration TEXT NOT NULL,
        skills_json TEXT NOT NULL,
        status TEXT DEFAULT 'Open for Teams'
    );

    CREATE TABLE assessments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        skill_name TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        sector TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL,
        passing_score INTEGER NOT NULL,
        questions_json TEXT NOT NULL
    );

    CREATE TABLE curriculum_modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        institution_name TEXT NOT NULL,
        program TEXT NOT NULL,
        course_name TEXT NOT NULL,
        syllabus_topics_json TEXT NOT NULL,
        industry_alignment_score INTEGER NOT NULL,
        gap_recommendations TEXT NOT NULL
    );
    """)

    conn.commit()
    seed_data(conn)
    conn.close()
    print("Database initialized and seeded successfully.")

def seed_data(conn):
    cursor = conn.cursor()

    # 1. Users with Requested Personas:
    # Student: Rasshi Sharma
    # Teacher / TPO: Prof. Vaibhav Jain
    # Recruiter: Chetan Deshmukh
    # Admin: Atharva Pandey
    users_data = [
        # Student 1: Rasshi Sharma (Default active student)
        (1, 'rasshi_ayush', 'Rasshi Sharma', 'rasshi.sharma@aiia.gov.in', 'student', 'All India Institute of Ayurveda, New Delhi', 'RS', 'Final year B.Pharm (Ayurveda) scholar specializing in herbal drug standardization and phytochemistry.'),
        # Student 2
        (2, 'rohan_pharma', 'Rohan Deshmukh', 'rohan.d@niper.ac.in', 'student', 'NIPER Mohali', 'RD', 'Postgraduate researcher in Clinical Research and Pharmacovigilance.'),
        # Student 3
        (3, 'ananya_biotech', 'Ananya Gupta', 'ananya.g@iitd.ac.in', 'student', 'IIT Delhi - Dept of Biochemical Engg', 'AG', 'Biotechnology undergrad working on bioinformatics and computational herbal compound screening.'),
        # Recruiter 1: Chetan Deshmukh (Default active recruiter)
        (4, 'chetan_dabur', 'Chetan Deshmukh', 'chetan.deshmukh@dabur.com', 'recruiter', 'Dabur India Ltd', 'CD', 'Head of R&D Talent & Natural Healthcare Innovation, Dabur India Ltd.'),
        # Recruiter 2
        (5, 'priya_himalaya', 'Priya Nair', 'p.nair@himalayawellness.com', 'recruiter', 'Himalaya Wellness Company', 'PN', 'Head of University Relations and Drug Discovery Partnerships at Himalaya.'),
        # Recruiter 3
        (6, 'arvind_patanjali', 'Dr. Arvind Swaminathan', 'arvind.s@patanjali.res.in', 'recruiter', 'Patanjali Research Foundation', 'AS', 'Director of Phytopharmacology & Research Fellowships.'),
        # Teacher / TPO: Prof. Vaibhav Jain (Default active TPO)
        (7, 'vaibhav_tpo', 'Prof. Vaibhav Jain', 'tpo@aiia.gov.in', 'tpo', 'All India Institute of Ayurveda, New Delhi', 'VJ', 'Dean of Academic Collaborations & Head Training & Placement Officer.'),
        # Admin: Atharva Pandey (Default active admin)
        (8, 'atharva_ayush', 'Atharva Pandey', 'director.skill@ayush.gov.in', 'admin', 'Ministry of Ayush, Govt. of India', 'AP', 'National Mission Director, Ayush Academia-Industry Innovation & Placement Council.')
    ]
    cursor.executemany("""
        INSERT INTO users (id, username, name, email, role, organization, avatar_initials, bio)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, users_data)

    # 2. Student Profiles
    profiles = [
        (1, 1, 'All India Institute of Ayurveda, New Delhi', 'B.Pharm (Ayurveda)', 2026, 8.85, 'Passionate about botanical extract formulation, HPLC analysis, and clinical trials for traditional polyherbal drugs.', 1, 'Delhi-NCR / Hybrid'),
        (2, 2, 'NIPER Mohali', 'M.S. (Pharmaceutics)', 2026, 8.70, 'Expertise in Good Clinical Practices (GCP), adverse drug reaction reporting, and regulatory submissions.', 2, 'Mumbai / Pune'),
        (3, 3, 'IIT Delhi', 'B.Tech Biotechnology', 2026, 9.15, 'Molecular docking, Python bioinformatics pipelines, and high-throughput drug screening algorithms.', 4, 'Bengaluru / Hyderabad')
    ]
    cursor.executemany("""
        INSERT INTO student_profiles (id, user_id, college, degree, graduation_year, cgpa, resume_summary, target_role_id, target_location)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, profiles)

    # 3. Student Skills (Rasshi Sharma's skills)
    student_skills_data = [
        # Rasshi Sharma (Student 1)
        (1, 'Phytochemical Extraction', 'Advanced', 1, 'Prof. Vaibhav Jain (AIIA)'),
        (1, 'HPLC Analysis', 'Intermediate', 1, 'Dabur Certified Assessment'),
        (1, 'Ayurvedic Pharmacopoeia (API)', 'Advanced', 1, 'Ministry of Ayush Portal'),
        (1, 'Good Laboratory Practices (GLP)', 'Intermediate', 1, 'Prof. Vaibhav Jain (AIIA)'),
        (1, 'Formulation Development', 'Intermediate', 0, None),
        (1, 'Spectroscopy (UV-Vis)', 'Intermediate', 0, None),

        # Rohan (Student 2)
        (2, 'Clinical Trial Design', 'Advanced', 1, 'NIPER Reviewer'),
        (2, 'Pharmacovigilance', 'Advanced', 1, 'PVPI Accredited Test'),
        (2, 'GCP Guidelines', 'Advanced', 1, 'CDSCO Workshop'),
        (2, 'Regulatory Affairs (USFDA/AYUSH)', 'Intermediate', 0, None),

        # Ananya (Student 3)
        (3, 'Molecular Docking (AutoDock)', 'Advanced', 1, 'IIT Delhi Endorsement'),
        (3, 'Python & BioPython', 'Advanced', 1, 'HackerRank Verified'),
        (3, 'High Throughput Screening', 'Intermediate', 1, 'Biocon Lab Test'),
        (3, 'Biostatistics', 'Advanced', 0, None)
    ]
    cursor.executemany("""
        INSERT INTO student_skills (student_id, skill_name, proficiency, verified, verified_by)
        VALUES (?, ?, ?, ?, ?)
    """, student_skills_data)

    # 4. Target Roles (Industry Benchmarks)
    target_roles_data = [
        (1, 'Ayurvedic Formulation & Drug Design Scientist', 'Phytopharmaceuticals',
         'Formulate novel Ayurvedic phytomedicines, standardize dosage forms, and optimize shelf-stability in accordance with modern Pharmacopoeial guidelines.',
         json.dumps([
             {"name": "Phytochemical Extraction", "level": "Advanced", "weight": 20},
             {"name": "HPLC Analysis", "level": "Advanced", "weight": 20},
             {"name": "Ayurvedic Pharmacopoeia (API)", "level": "Advanced", "weight": 15},
             {"name": "Formulation Development", "level": "Advanced", "weight": 15},
             {"name": "Stability Testing (ICH Guidelines)", "level": "Intermediate", "weight": 15},
             {"name": "Standardization of Herbal Extracts", "level": "Advanced", "weight": 15}
         ]), '₹7.5 - 12 LPA', 'Very High'),

        (2, 'Pharmacovigilance & Clinical Trial Associate', 'Clinical & Regulatory',
         'Oversee safety monitoring, adverse event reporting, and compliance with ethical clinical trial protocols for herbal and polyherbal therapies.',
         json.dumps([
             {"name": "GCP Guidelines", "level": "Advanced", "weight": 25},
             {"name": "Pharmacovigilance", "level": "Advanced", "weight": 25},
             {"name": "Clinical Trial Design", "level": "Intermediate", "weight": 20},
             {"name": "Regulatory Affairs (USFDA/AYUSH)", "level": "Intermediate", "weight": 15},
             {"name": "MedDRA Coding", "level": "Intermediate", "weight": 15}
         ]), '₹6.5 - 10 LPA', 'High'),

        (3, 'Quality Control & Herbal Standardization Specialist', 'Quality & Manufacturing',
         'Audit production batches, perform microbiological limits testing, heavy metal assays, and batch chromatography for export readiness.',
         json.dumps([
             {"name": "HPLC Analysis", "level": "Advanced", "weight": 25},
             {"name": "Good Laboratory Practices (GLP)", "level": "Advanced", "weight": 20},
             {"name": "Heavy Metal & Pesticide Assay", "level": "Intermediate", "weight": 20},
             {"name": "Spectroscopy (UV-Vis)", "level": "Intermediate", "weight": 15},
             {"name": "Ayurvedic Pharmacopoeia (API)", "level": "Advanced", "weight": 20}
         ]), '₹5.5 - 9 LPA', 'High'),

        (4, 'Biomedical Data Scientist & AI Health Researcher', 'Bioinformatics & AI',
         'Apply machine learning models and molecular dynamics simulations to predict therapeutic targets of active botanical compounds.',
         json.dumps([
             {"name": "Python & BioPython", "level": "Advanced", "weight": 25},
             {"name": "Molecular Docking (AutoDock)", "level": "Advanced", "weight": 25},
             {"name": "Machine Learning for Drug Discovery", "level": "Intermediate", "weight": 20},
             {"name": "Biostatistics", "level": "Intermediate", "weight": 15},
             {"name": "Biological Database Querying (PubChem/ChEMBL)", "level": "Advanced", "weight": 15}
         ]), '₹9.0 - 16 LPA', 'Very High'),

        (5, 'Herbal Supply Chain & GAP Compliance Auditor', 'Agri-Supply & Traceability',
         'Ensure Good Agricultural and Collection Practices (GACP) across medicinal botanical farms and digitize batch traceability.',
         json.dumps([
             {"name": "Good Agricultural Practices (GACP)", "level": "Advanced", "weight": 30},
             {"name": "Botanical Geo-Tagging & Traceability", "level": "Intermediate", "weight": 25},
             {"name": "Post-Harvest Drying Tech", "level": "Intermediate", "weight": 25},
             {"name": "Quality Audit & Verification", "level": "Intermediate", "weight": 20}
         ]), '₹5.0 - 8.5 LPA', 'Moderate')
    ]
    cursor.executemany("""
        INSERT INTO target_roles (id, title, sector, description, required_skills_json, avg_salary, demand_level)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, target_roles_data)

    # 5. Jobs & Internships
    jobs_data = [
        (1, 4, 'Dabur India Ltd', 'R&D Phytochemistry Intern', 'Internship', 'Ghaziabad, NCR', 'On-site',
         '₹30,000 / month', '6 Months',
         'Work alongside senior scientists at Dabur Global Research Centre on fingerprinting medicinal herbs and validating modern extract stability.',
         json.dumps(["Phytochemical Extraction", "HPLC Analysis", "Ayurvedic Pharmacopoeia (API)", "Standardization of Herbal Extracts"]),
         3, '2026-10-15', 'Open'),

        (2, 4, 'Dabur India Ltd', 'Ayurvedic Drug Formulation Associate', 'Placement', 'Baddi, HP', 'On-site',
         '₹8.5 LPA + Performance Bonus', 'Full-time',
         'Lead scale-up formulation of traditional herbal churnas into effervescent and nano-emulsion delivery formats.',
         json.dumps(["Formulation Development", "Phytochemical Extraction", "Stability Testing (ICH Guidelines)", "Good Laboratory Practices (GLP)"]),
         2, '2026-10-30', 'Open'),

        (3, 5, 'Himalaya Wellness Company', 'Clinical Research & Pharmacovigilance Trainee', 'Internship', 'Bengaluru', 'Hybrid',
         '₹32,000 / month', '6 Months',
         'Collaborate with medical advisors to draft trial protocols, track ADR reports, and monitor human phase-2 trials for botanical therapeutics.',
         json.dumps(["GCP Guidelines", "Pharmacovigilance", "Clinical Trial Design", "MedDRA Coding"]),
         4, '2026-11-05', 'Open'),

        (4, 6, 'Patanjali Research Foundation', 'Herbal Quality Control Analyst', 'Placement', 'Haridwar, Uttarakhand', 'On-site',
         '₹6.8 LPA', 'Full-time',
         'Perform chromatography analysis (HPLC/HPTLC), pesticide residue testing, and microbiological evaluation according to Pharmacopoeial standards.',
         json.dumps(["HPLC Analysis", "Heavy Metal & Pesticide Assay", "Good Laboratory Practices (GLP)", "Ayurvedic Pharmacopoeia (API)"]),
         5, '2026-10-25', 'Open'),

        (5, 5, 'Himalaya Wellness Company', 'Computational Drug Discovery Intern', 'Internship', 'Bengaluru / Remote', 'Remote',
         '₹35,000 / month', '6 Months',
         'Screen plant secondary metabolites against anti-inflammatory receptors using molecular docking and deep learning scoring models.',
         json.dumps(["Python & BioPython", "Molecular Docking (AutoDock)", "Biological Database Querying (PubChem/ChEMBL)", "Machine Learning for Drug Discovery"]),
         2, '2026-10-20', 'Open')
    ]
    cursor.executemany("""
        INSERT INTO jobs (id, recruiter_id, company, title, job_type, location, work_mode, stipend_salary, duration, description, required_skills_json, openings, deadline, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, jobs_data)

    # 6. Applications (Rasshi Sharma applied)
    applications_data = [
        # Rasshi Sharma applied for Job 1 (Dabur Phytochemistry Intern) - Match score ~88%
        (1, 1, 1, 88, 'Shortlisted', '2026-09-01', 'High skill match in HPLC and Extraction. Endorsed by Prof. Vaibhav Jain.'),
        # Rasshi Sharma applied for Job 2 (Dabur Formulation) - Match score ~72%
        (2, 2, 1, 72, 'Applied', '2026-09-03', 'Application pending Chetan Deshmukh initial screening.'),
        # Rohan applied for Job 3 (Himalaya Clinical Research Trainee) - Match score ~94%
        (3, 3, 2, 94, 'Interview', '2026-08-28', 'Technical interview scheduled for 12th Sept.'),
        # Ananya applied for Job 5 (Himalaya Computational Intern) - Match score ~96%
        (4, 5, 3, 96, 'Offered', '2026-08-22', 'Offer letter rolled out with ₹35,000 stipend.')
    ]
    cursor.executemany("""
        INSERT INTO applications (id, job_id, student_id, match_score, status, applied_date, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, applications_data)

    # 7. MoUs (Academia-Industry Collaborations)
    mous_data = [
        (1, 'All India Institute of Ayurveda, New Delhi', 'Dabur India Ltd',
         'Strategic Research & Student Internship Partnership in Phytomedicine',
         '2025-08-15', '2028-08-14', 'Active', 'Phytochemistry, Formulation, & PG Internships',
         'Annual 15 student internships, co-funded research lab on standardized Rasayana extracts, guest lectures by Chetan Deshmukh and Dabur scientists.', 4),

        (2, 'All India Institute of Ayurveda, New Delhi', 'Himalaya Wellness Company',
         'Joint Clinical Validation and Evidence-Based Ayurveda Initiative',
         '2025-11-10', '2027-11-09', 'Active', 'Human Clinical Trials & Pharmacovigilance Protocols',
         'Joint publishing in indexed international journals, 10 clinical research fellows sponsored annually.', 3),

        (3, 'NIPER Mohali', 'Patanjali Research Foundation',
         'Advanced Chromatography & Standard Testing MoU',
         '2026-01-20', '2029-01-19', 'Active', 'Analytical Chemistry & Skill Certification',
         'Curriculum advisory committee representation, shared access to NMR & LC-MS facilities, student placements.', 2),

        (4, 'IIT Delhi - Biochemical Engg', 'Biocon Biologics',
         'Bioprocess Optimization & Enzyme Engineering Capstones',
         '2024-05-10', '2027-05-09', 'Active', 'Bioinformatics & Microbial Fermentation',
         'Direct campus placement pipeline, ₹50 Lakh seed fund for student startup incubator.', 5)
    ]
    cursor.executemany("""
        INSERT INTO mous (id, institution_name, industry_partner, title, signed_date, valid_until, status, focus_area, deliverables, joint_initiatives_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, mous_data)

    # 8. Joint R&D Projects / Capstones (Industry-Academia)
    joint_projects_data = [
        (1, 'Dabur India Ltd', 'Standardization of Ashwagandha Biomarkers Using HPLC-MS', 'Phytochemistry',
         'Develop a rapid chromatographic protocol to isolate Withaferin-A with >98% purity from dry root extracts and assess thermal stability.',
         'Chetan Deshmukh (Dabur R&D)', 'Prof. Vaibhav Jain (AIIA)', '₹1,50,000 Project Grant + Equipment Access', '4 Months',
         json.dumps(["HPLC Analysis", "Phytochemical Extraction", "Spectroscopy (UV-Vis)"]), 'Open for Teams'),

        (2, 'Himalaya Wellness Company', 'AI-Driven Quality Assurance for Botanical Raw Materials', 'Bioinformatics & Computer Vision',
         'Train a lightweight neural network to authenticate genuine Curcuma longa powders and detect common adulterants from microscopic imagery.',
         'Dr. K. Swaminathan (Himalaya)', 'Dr. Anupam Roy (IIT Delhi)', '₹2,00,000 Industry Grant', '5 Months',
         json.dumps(["Python & BioPython", "Machine Learning for Drug Discovery", "Standardization of Herbal Extracts"]), 'In Progress'),

        (3, 'Patanjali Research Foundation', 'Clinical Protocol for Polyherbal Glycemic Regulator', 'Clinical Pharmacology',
         'Design a double-blind, randomized controlled trial (RCT) protocol evaluating HbA1c efficacy of standardized cinnamon and fenugreek capsules.',
         'Dr. Arvind Swaminathan (Patanjali)', 'Dr. Harish Chandra (NIPER)', '₹1,20,000 Stipend per Scholar', '6 Months',
         json.dumps(["Clinical Trial Design", "GCP Guidelines", "Pharmacovigilance"]), 'Open for Teams')
    ]
    cursor.executemany("""
        INSERT INTO joint_projects (id, company, title, domain, description, mentor_name, academic_collaborator, stipend_or_grant, duration, skills_json, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, joint_projects_data)

    # 9. Skill Assessments & Timed Domain Quizzes (For Badge Verification)
    assessments_data = [
        (1, 'HPLC Analysis', 'High Performance Liquid Chromatography (HPLC) Mastery Test', 'Analytical Chemistry & Quality', 10, 70,
         json.dumps([
             {
                 "id": 1,
                 "question": "Which component in reverse-phase HPLC serves as the stationary phase?",
                 "options": ["Hydrophobic non-polar silica (e.g., C18)", "Aqueous buffer with methanol", "Pure polar silica gel", "Gaseous helium carrier"],
                 "answer": 0,
                 "explanation": "In reverse-phase HPLC, the stationary phase is non-polar (typically octadecyl silica C18), while the mobile phase is polar."
             },
             {
                 "id": 2,
                 "question": "What is the primary formula used to quantify peak resolution (Rs) between two adjacent chromatographic peaks?",
                 "options": ["Rs = 2(tR2 - tR1) / (W1 + W2)", "Rs = (tR1 + tR2) / 2", "Rs = Peak Area 1 / Peak Area 2", "Rs = Column Length / Flow Rate"],
                 "answer": 0,
                 "explanation": "Resolution Rs is calculated as twice the difference in retention times divided by the sum of their baseline peak widths."
             },
             {
                 "id": 3,
                 "question": "When developing an HPLC method for standardizing Withanolide extracts, what detector is most universally suited for UV-active chromophores?",
                 "options": ["Photodiode Array (PDA) / UV-Vis Detector", "Refractive Index Detector (RID)", "Flame Ionization Detector (FID)", "Thermal Conductivity Detector"],
                 "answer": 0,
                 "explanation": "Photodiode Array (PDA) detectors allow simultaneous spectral scanning across multiple wavelengths (typically 227 nm for withanolides)."
             }
         ])),

        (2, 'GCP Guidelines', 'Good Clinical Practice (GCP) & Ethical Protocol Certification', 'Clinical Research', 10, 70,
         json.dumps([
             {
                 "id": 1,
                 "question": "Under ICH-GCP E6(R2), who bears ultimate legal and ethical responsibility for trial conduct at an investigative site?",
                 "options": ["The Principal Investigator (PI)", "The Clinical Research Associate (CRA)", "The Institutional Ethics Committee Secretary", "The Clinical Data Manager"],
                 "answer": 0,
                 "explanation": "The Principal Investigator is responsible for trial conduct, patient safety, and regulatory compliance at the trial site."
             },
             {
                 "id": 2,
                 "question": "Within what mandatory timeframe must a Serious Adverse Event (SAE) be reported to the trial sponsor and Ethics Committee?",
                 "options": ["Within 24 hours of occurrence/knowledge", "Within 14 business days", "At the end of trial phase", "Within 30 calendar days"],
                 "answer": 0,
                 "explanation": "ICH-GCP mandates that all serious adverse events (SAEs) must be reported immediately (within 24 hours) to the sponsor."
             },
             {
                 "id": 3,
                 "question": "What constitutes valid Informed Consent in clinical research?",
                 "options": ["Freely given, written and signed by the subject after full disclosure in understandable language", "Verbal agreement witnessed by clinic staff", "Consent signed exclusively by the treating physician", "Automatic enrollment with opt-out option"],
                 "answer": 0,
                 "explanation": "Informed consent must be voluntary, fully explained in the participant's native tongue, and documented in writing prior to any study procedure."
             }
         ])),

        (3, 'Standardization of Herbal Extracts', 'Ayurvedic Pharmacopoeial Standardization & Assay', 'Ayush Quality Control', 10, 70,
         json.dumps([
             {
                 "id": 1,
                 "question": "What does the Acid-Insoluble Ash value in Ayurvedic Pharmacopoeia (API) signify?",
                 "options": ["Presence of siliceous matter (earth/sand contaminants)", "Total organic carbon content", "Moisture percentage in powder", "Active alkaloid percentage"],
                 "answer": 0,
                 "explanation": "Acid-insoluble ash measures siliceous contamination, such as sand or soil attached to herbal roots and barks."
             },
             {
                 "id": 2,
                 "question": "Which regulatory test is mandatory before exporting herbal medicines to EU and US markets?",
                 "options": ["Heavy Metals (Pb, Cd, As, Hg) & Pesticide Residue Profiling", "Color tintometer test", "Aroma volatility index", "Hand microscopic touch test"],
                 "answer": 0,
                 "explanation": "International export requires stringent limit testing for toxic heavy metals (Lead, Cadmium, Arsenic, Mercury), aflatoxins, and pesticide residues."
             },
             {
                 "id": 3,
                 "question": "What is the primary role of HPTLC (High Performance Thin Layer Chromatography) in herbal QA?",
                 "options": ["High-throughput chromatographic fingerprinting against authentic reference standards", "Measuring solution viscosity", "Calculating biological half-life", "Synthesizing artificial flavorings"],
                 "answer": 0,
                 "explanation": "HPTLC is the gold standard for qualitative fingerprinting to verify botanical identity and detect adulteration."
             }
         ]))
    ]
    cursor.executemany("""
        INSERT INTO assessments (id, skill_name, title, sector, duration_minutes, passing_score, questions_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, assessments_data)

    # 10. Curriculum Modules (For Prof. Vaibhav Jain & Academic Alignment)
    curriculum_data = [
        (1, 'All India Institute of Ayurveda, New Delhi', 'B.Pharm (Ayurveda)',
         'Dravyaguna & Phytopharmaceutics (Sem 6)',
         json.dumps(["Phytochemical Extraction", "Ayurvedic Pharmacopoeia (API)", "Spectroscopy (UV-Vis)", "Classical Churna Formulation"]),
         74,
         'Curriculum lacks modern Stability Testing (ICH Guidelines) and Automated HPTLC/HPLC hands-on hours demanded by Dabur and Himalaya.'),

        (2, 'All India Institute of Ayurveda, New Delhi', 'B.Pharm (Ayurveda)',
         'Pharmaceutical Quality Assurance & GLP (Sem 7)',
         json.dumps(["Good Laboratory Practices (GLP)", "Heavy Metal Assay", "Microbial Limit Testing"]),
         82,
         'Good foundational coverage. Recommended addition: 15 hours of MedDRA safety reporting and digital batch record keeping.'),

        (3, 'NIPER Mohali', 'M.S. (Pharmaceutics)',
         'Advanced Clinical Trials & Regulatory Compliance (Sem 3)',
         json.dumps(["GCP Guidelines", "Clinical Trial Design", "Pharmacovigilance", "CDSCO/USFDA Dossier Filing"]),
         92,
         'Excellent alignment with industry standards. Highly rated by clinical contract research organizations (CROs).'),

        (4, 'IIT Delhi', 'B.Tech Biotechnology',
         'Computational Biology & Drug Design (Sem 7)',
         json.dumps(["Python & BioPython", "Molecular Docking (AutoDock)", "Biological Database Querying", "Biostatistics"]),
         88,
         'Add direct integration modules with traditional medicine phytochemical databases like Ayush Research Portal and IMPPAT.')
    ]
    cursor.executemany("""
        INSERT INTO curriculum_modules (id, institution_name, program, course_name, syllabus_topics_json, industry_alignment_score, gap_recommendations)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, curriculum_data)

    conn.commit()

if __name__ == "__main__":
    init_db()
