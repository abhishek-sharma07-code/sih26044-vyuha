import sys
import json
import sqlite3

# Ensure UTF-8 output on Windows console
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from app import app
from database import get_db_connection, init_db

def run_verification():
    print("-------------------------------------------------------")
    print("Running Automated Verification for SIH26044 Prototype...")
    print("-------------------------------------------------------")

    # Reset DB to known pristine state
    init_db()

    client = app.test_client()

    # Test 1: Frontend Route
    res = client.get('/')
    assert res.status_code == 200, f"Frontend failed with {res.status_code}"
    assert b"Ayush-Setu" in res.data, "Brand not found in HTML"
    assert b"SIH26044" in res.data, "SIH26044 badge not found in HTML"
    print("[PASS] Test 1: Frontend HTML served correctly with SIH26044 branding.")

    # Test 2: Roles endpoint
    res = client.get('/api/roles')
    assert res.status_code == 200
    roles = res.get_json()
    assert len(roles) >= 4, "Expected at least 4 switchable demo roles"
    role_names = [r['role'] for r in roles]
    assert 'student' in role_names and 'recruiter' in role_names and 'tpo' in role_names and 'admin' in role_names
    print(f"[PASS] Test 2: Roles API returned {len(roles)} demo personas (Student, Recruiter, TPO, Admin).")

    # Test 3: Target Roles & Skill Gap Engine
    res = client.get('/api/target-roles')
    assert res.status_code == 200
    target_roles = res.get_json()
    assert len(target_roles) >= 3
    
    # Test skill gap analysis for student 1 against target role 1
    res = client.get('/api/skill-gap-analysis?student_id=1&target_role_id=1')
    assert res.status_code == 200
    gap = res.get_json()
    assert 'compatibility_score' in gap
    assert gap['compatibility_score'] > 0
    assert len(gap['matched_skills']) > 0
    assert len(gap['missing_skills']) > 0
    assert 'radar_data' in gap
    assert len(gap['radar_data']['labels']) > 0
    print(f"[PASS] Test 3: AI Skill Gap Analyzer computed {gap['compatibility_score']}% match for Priya Sharma with {len(gap['matched_skills'])} matched & {len(gap['missing_skills'])} missing skills.")

    # Test 4: Jobs & Dynamic Match Score
    res = client.get('/api/jobs?student_id=1')
    assert res.status_code == 200
    jobs = res.get_json()
    assert len(jobs) >= 5
    assert 'match_score' in jobs[0]
    print(f"[PASS] Test 4: Retrieved {len(jobs)} active jobs with dynamic match scores (top: {jobs[0]['match_score']}%).")

    # Test 5: 1-Click Application Workflow
    # Student 1 applies to Job 3 (Himalaya)
    res = client.post('/api/apply', json={'job_id': 3, 'student_id': 1})
    assert res.status_code == 201
    apply_data = res.get_json()
    assert apply_data['success'] is True
    print(f"[PASS] Test 5: 1-Click application submitted successfully (App ID: {apply_data['application_id']}).")

    # Test 6: Recruiter ATS Kanban & Status Progression
    res = client.get('/api/applications?recruiter_id=4')
    assert res.status_code == 200
    apps = res.get_json()
    assert len(apps) >= 1
    app_id = apps[0]['id']

    # Update candidate status to 'Interview'
    patch_res = client.patch(f'/api/applications/{app_id}', json={'status': 'Interview'})
    assert patch_res.status_code == 200
    print(f"[PASS] Test 6: Recruiter ATS Kanban successfully transitioned Application #{app_id} to Interview.")

    # Test 7: Domain Quiz & Instant Skill Badge Awarding
    res = client.get('/api/assessments')
    assert res.status_code == 200
    tests = res.get_json()
    assert len(tests) >= 3

    # Submit quiz for HPLC Analysis (all correct answers)
    res = client.post('/api/assessments/submit', json={
        'assessment_id': 1,
        'student_id': 1,
        'answers': {'1': 0, '2': 0, '3': 0}
    })
    assert res.status_code == 200
    quiz_res = res.get_json()
    assert quiz_res['passed'] is True
    assert quiz_res['percentage'] == 100
    assert quiz_res['badge_awarded'] is True
    print(f"[PASS] Test 7: Domain Skill Quiz evaluated 100% score and awarded Verified Skill Badge for {quiz_res['skill_name']}!")

    # Test 8: TPO Curriculum Gap Analysis & Endorsement
    res = client.get('/api/curriculum-gap')
    assert res.status_code == 200
    curr = res.get_json()
    assert len(curr['modules']) >= 4
    assert len(curr['industry_demand_ranking']) > 0
    assert len(curr['priority_deficiencies']) > 0

    endorse_res = client.post('/api/endorse-skill', json={
        'student_skill_id': 5,
        'faculty_name': 'Prof. Sunita Rao'
    })
    assert endorse_res.status_code == 200
    print("[PASS] Test 8: TPO Curriculum Gap Analysis retrieved with priority deficiencies, and faculty endorsement processed.")

    # Test 9: Ministry Macro Analytics Overview
    res = client.get('/api/analytics/overview')
    assert res.status_code == 200
    overview = res.get_json()
    assert 'metrics' in overview
    assert 'sector_distribution' in overview
    assert 'regional_clusters' in overview
    print(f"[PASS] Test 9: Ministry Macro Dashboard verified ({overview['metrics']['total_students_registered']} registered students, {len(overview['regional_clusters'])} state clusters).")

    print("\n=======================================================")
    print("ALL 9 AUTOMATED VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=======================================================\n")

if __name__ == '__main__':
    run_verification()
