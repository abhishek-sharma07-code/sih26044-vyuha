import json

# Curated catalog of upskilling recommendations for domain skills
SKILL_LEARNING_CATALOG = {
    "HPLC Analysis": {
        "course": "SWAYAM / NPTEL: Advanced Analytical Techniques & Chromatography",
        "provider": "IIT Madras & Ministry of Education",
        "duration": "4 Weeks",
        "type": "Certification Course",
        "project_recommendation": "Perform reverse-phase HPLC run on gingerol extracts and calculate peak resolution Rs."
    },
    "Stability Testing (ICH Guidelines)": {
        "course": "ICH Q1A-Q1E Stability Protocols in Pharmaceutical & Ayush Products",
        "provider": "Pharmacopoeia Commission for Indian Medicine (PCIM&H)",
        "duration": "2 Weeks",
        "type": "Workshop",
        "project_recommendation": "Design an accelerated 6-month real-time stability protocol for an Ayurvedic hydro-alcoholic tincture."
    },
    "Standardization of Herbal Extracts": {
        "course": "Quality Standardization & Fingerprinting of Botanical Drugs",
        "provider": "National Medicinal Plants Board (NMPB) & CSIR-NBRI",
        "duration": "3 Weeks",
        "type": "Industry Certificate",
        "project_recommendation": "Conduct HPTLC fingerprinting comparing wild vs cultivated Ashwagandha root samples."
    },
    "Formulation Development": {
        "course": "Novel Drug Delivery Systems for Phytopharmaceuticals",
        "provider": "NIPER & Dabur Research Academy",
        "duration": "6 Weeks",
        "type": "Executive Diploma",
        "project_recommendation": "Formulate a curcumin nano-suspension and measure particle size distribution."
    },
    "GCP Guidelines": {
        "course": "ICH-GCP E6 (R2) Clinical Investigator & Trial Monitoring Certification",
        "provider": "Clinical Development Services Agency (CDSA / THSTI)",
        "duration": "3 Weeks",
        "type": "Accredited Certificate",
        "project_recommendation": "Draft an informed consent form and investigator brochure for a Phase-II herbal trial."
    },
    "MedDRA Coding": {
        "course": "Medical Dictionary for Regulatory Activities (MedDRA) Practical Coding",
        "provider": "Pharmacovigilance Programme of India (PvPI)",
        "duration": "1 Week",
        "type": "Micro-Credential",
        "project_recommendation": "Code 20 real adverse drug reaction (ADR) case narratives to appropriate Preferred Terms (PT)."
    },
    "Heavy Metal & Pesticide Assay": {
        "course": "Atomic Absorption Spectroscopy (AAS) & GC-MS for Contaminant Testing",
        "provider": "Bureau of Indian Standards (BIS) Training",
        "duration": "2 Weeks",
        "type": "Lab Workshop",
        "project_recommendation": "Test lead and arsenic parts-per-million levels in Triphala powder against API monograph limits."
    },
    "Machine Learning for Drug Discovery": {
        "course": "AI & Deep Learning for Virtual Screening and Chemoinformatics",
        "provider": "Bioinformatics Institute of India & Coursera",
        "duration": "6 Weeks",
        "type": "Specialization",
        "project_recommendation": "Train a Random Forest model on ChEMBL bioactivity data to predict COX-2 inhibitors."
    },
    "Python & BioPython": {
        "course": "Python for Computational Biology & Genomic Data Processing",
        "provider": "CSIR-Institute of Genomics and Integrative Biology",
        "duration": "4 Weeks",
        "type": "Hands-on Bootcamp",
        "project_recommendation": "Automate parsing of PDB crystal structures and extract binding pocket coordinates."
    }
}

PROFICIENCY_WEIGHTS = {
    "Beginner": 1,
    "Intermediate": 2,
    "Advanced": 3
}

def analyze_skill_gap(student_skills, target_role_required_skills):
    """
    student_skills: list of dicts [{'name': 'HPLC Analysis', 'proficiency': 'Intermediate', 'verified': 1}]
    target_role_required_skills: list of dicts [{'name': 'HPLC Analysis', 'level': 'Advanced', 'weight': 20}]
    """
    student_map = {s['name'].lower(): s for s in student_skills}

    matched_skills = []
    partial_skills = []
    missing_skills = []

    total_weight = 0
    earned_score = 0

    radar_labels = []
    student_levels = []
    benchmark_levels = []

    for item in target_role_required_skills:
        skill_name = item['name']
        req_level = item.get('level', 'Intermediate')
        weight = item.get('weight', 20)
        total_weight += weight

        radar_labels.append(skill_name)
        req_numeric = PROFICIENCY_WEIGHTS.get(req_level, 2)
        benchmark_levels.append(req_numeric * 33.3) # Scaled to ~100 max

        lower_key = skill_name.lower()
        if lower_key in student_map:
            stu = student_map[lower_key]
            stu_level = stu.get('proficiency', 'Intermediate')
            stu_numeric = PROFICIENCY_WEIGHTS.get(stu_level, 1)
            verified = bool(stu.get('verified', 0))

            student_levels.append(stu_numeric * 33.3)

            if stu_numeric >= req_numeric:
                # Fully matched
                earned_score += weight
                matched_skills.append({
                    "name": skill_name,
                    "acquired_level": stu_level,
                    "required_level": req_level,
                    "verified": verified,
                    "verified_by": stu.get('verified_by', 'Academic Faculty')
                })
            else:
                # Partial match
                earned_score += (weight * 0.6)
                learning = SKILL_LEARNING_CATALOG.get(skill_name, {
                    "course": f"Advanced {skill_name} Industry Immersion Course",
                    "provider": "Ayush Skill Council / NPTEL",
                    "duration": "3 Weeks",
                    "type": "Bridge Course",
                    "project_recommendation": f"Complete an applied industry capstone in {skill_name}."
                })
                partial_skills.append({
                    "name": skill_name,
                    "acquired_level": stu_level,
                    "required_level": req_level,
                    "verified": verified,
                    "learning_recommendation": learning
                })
        else:
            # Completely missing
            student_levels.append(0)
            learning = SKILL_LEARNING_CATALOG.get(skill_name, {
                "course": f"Comprehensive {skill_name} Certification",
                "provider": "Ministry of Ayush / SWAYAM Portal",
                "duration": "4 Weeks",
                "type": "Foundational Course",
                "project_recommendation": f"Develop a baseline portfolio project demonstrating {skill_name}."
            })
            missing_skills.append({
                "name": skill_name,
                "required_level": req_level,
                "weight": weight,
                "learning_recommendation": learning
            })

    # Compatibility percentage
    compatibility_pct = int(round((earned_score / total_weight) * 100)) if total_weight > 0 else 0
    # Add bonus for verified skills
    verified_count = sum(1 for s in matched_skills if s.get('verified'))
    compatibility_pct = min(100, compatibility_pct + (verified_count * 2))

    return {
        "compatibility_score": compatibility_pct,
        "matched_skills": matched_skills,
        "partial_skills": partial_skills,
        "missing_skills": missing_skills,
        "radar_data": {
            "labels": radar_labels,
            "student_scores": [round(s, 1) for s in student_levels],
            "benchmark_scores": [round(b, 1) for b in benchmark_levels]
        }
    }

def calculate_job_match(student_skills, job_skills_list):
    """
    Computes match score between student's skills and a job's required skills list.
    """
    if not job_skills_list:
        return 50

    student_skill_names = {s['name'].lower(): s for s in student_skills}
    matched_count = 0
    verified_bonus = 0

    for req_skill in job_skills_list:
        clean_req = req_skill.strip().lower()
        if clean_req in student_skill_names:
            matched_count += 1
            if student_skill_names[clean_req].get('verified'):
                verified_bonus += 3

    base_score = (matched_count / len(job_skills_list)) * 90
    final_score = min(99, int(round(base_score + verified_bonus)))
    return max(15, final_score)
