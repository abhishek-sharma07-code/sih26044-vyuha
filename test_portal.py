import json
import os
import sys

from app import app
from database import get_db_connection

def run_tests():
    client = app.test_client()
    passed = 0
    failed = 0

    def test(name, condition, details=""):
        nonlocal passed, failed
        if condition:
            print(f"  [PASS] {name}")
            passed += 1
        else:
            print(f"  [FAIL] {name}: {details}")
            failed += 1

    print("\n=======================================================")
    print(" AYUSHSETU: AUTOMATED PRODUCTION VERIFICATION SUITE")
    print("=======================================================")

    # 1. Frontend Assets & Zero SIH Branding
    res = client.get('/')
    test("Frontend index.html served (HTTP 200)", res.status_code == 200)
    html_text = res.data.decode('utf-8')
    test("HTML contains AyushSetu branding", "AyushSetu" in html_text)
    test("Zero SIH references in HTML", "SIH" not in html_text, "Found 'SIH' in HTML")
    test("Hero heading has <= 5 words", "Bridge Academia To Industry." in html_text)

    css_res = client.get('/css/styles.css')
    test("CSS styles served (HTTP 200)", css_res.status_code == 200)

    js_res = client.get('/js/app.js')
    test("JavaScript app.js served (HTTP 200)", js_res.status_code == 200)

    # 2. Database & Data Retrieval APIs
    roles_res = client.get('/api/roles')
    test("API GET /api/roles returns HTTP 200", roles_res.status_code == 200)
    roles = json.loads(roles_res.data)
    test("API GET /api/roles returns >= 8 users", len(roles) >= 8)

    gap_res = client.get('/api/skill-gap-analysis?student_id=1&target_role_id=1')
    test("Skill Gap API returns HTTP 200", gap_res.status_code == 200)
    gap_data = json.loads(gap_res.data)
    test("Skill Gap calculates match percentage", ("compatibility_score" in gap_data or "match_percentage" in gap_data))

    jobs_res = client.get('/api/jobs?student_id=1')
    test("Jobs API returns HTTP 200", jobs_res.status_code == 200)
    jobs = json.loads(jobs_res.data)
    test("Jobs list has entries with match scores", len(jobs) > 0 and "match_score" in jobs[0])

    # 3. Data Entry APIs (Testing User Requirement: How to enter data)
    import time
    ts = int(time.time())
    new_student = {
        "name": f"Kavita Nair {ts}",
        "email": f"kavita_{ts}@aiia.gov.in",
        "college": "All India Institute of Ayurveda",
        "degree": "B.Pharm (Ayurveda)",
        "graduation_year": 2026,
        "cgpa": 9.2,
        "skills": ["HPLC Analysis", "GLP", "Spectroscopy"]
    }
    stu_post = client.post('/api/students', json=new_student)
    test("Data Entry: POST /api/students inserts record", stu_post.status_code == 201)

    new_job = {
        "recruiter_id": 4,
        "company": "Patanjali Bio-Research",
        "title": f"Phytochemical Formulation Trainee {ts}",
        "job_type": "Internship",
        "location": "Haridwar",
        "stipend_salary": "₹35,000 / month",
        "duration": "6 Months",
        "description": "Standardization of botanical extracts",
        "required_skills": ["Phytochemical Extraction", "HPLC Analysis"]
    }
    job_post = client.post('/api/jobs', json=new_job)
    test("Data Entry: POST /api/jobs creates opportunity", job_post.status_code == 201)

    skill_post = client.post('/api/skills/add', json={
        "student_id": 1,
        "skill_name": "Nuclear Magnetic Resonance (NMR)",
        "proficiency": "Intermediate"
    })
    test("Data Entry: POST /api/skills/add adds technical skill", skill_post.status_code == 201)

    # 4. Winning Features: Credentials & AI Syllabus Proposal
    cred_res = client.get('/api/credentials/1')
    test("Winning Feature: GET /api/credentials/1 returns verifiable badges", cred_res.status_code == 200)
    creds = json.loads(cred_res.data)
    test("Credentials have SHA-256 hashes", len(creds) > 0 and "sha256_hash" in creds[0])

    prop_res = client.post('/api/curriculum/generate-proposal', json={
        "institution": "All India Institute of Ayurveda",
        "course": "B.Pharm (Ayurveda)"
    })
    test("Winning Feature: AI Curriculum Proposal generated (HTTP 200)", prop_res.status_code == 200)
    prop_data = json.loads(prop_res.data)
    test("Proposal contains recommended bridge modules", len(prop_data.get("recommended_modules", [])) >= 3)

    # 5. Live Database Stats
    stats_res = client.get('/api/database/stats')
    test("Database Stats API returns live metrics", stats_res.status_code == 200)

    print("-------------------------------------------------------")
    print(f"Results: {passed} PASSED, {failed} FAILED")
    print("=======================================================\n")
    return failed == 0

if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)
