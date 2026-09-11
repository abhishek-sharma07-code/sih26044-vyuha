# AyushSetu - Database Management & Data Entry Utility CLI
import sys
import json
import sqlite3
from database import (
    get_db_connection, init_db, get_database_stats,
    add_user, add_student_profile, add_student_skill,
    add_job, add_mou
)

def show_help():
    print("""
===================================================================
 AYUSHSETU: DATABASE MANAGEMENT & DATA ENTRY UTILITY
===================================================================
Usage:
  python data_manager.py stats
      Display live record counts across all database tables.

  python data_manager.py add-student <name> <email> <college> <degree> <cgpa> [skills_comma_separated]
      Add a new student profile and skills into the database.
      Example:
      python data_manager.py add-student "Vikas Mehra" "vikas@aiia.gov.in" "AIIA Delhi" "B.Pharm" 8.9 "HPLC Analysis,GLP"

  python data_manager.py add-job <recruiter_id> <company> <title> <type> <location> <stipend> <skills_comma_separated>
      Post a new internship or placement position.
      Example:
      python data_manager.py add-job 4 "Dabur India" "Phytopharm Analyst" "Placement" "Delhi" "₹7.2 LPA" "HPLC Analysis,GLP"

  python data_manager.py add-mou <institution> <partner> <title> <focus> <deliverables>
      Register an official institutional collaboration MoU.

  python data_manager.py seed
      Reset and re-seed the database with complete official baseline data.

  python data_manager.py query "<SQL>"
      Execute an arbitrary SQL SELECT query and view results formatted in a table.
===================================================================
""")

def cmd_stats():
    stats = get_database_stats()
    print("\n--- AYUSHSETU DATABASE METRICS ---")
    for k, v in stats.items():
        print(f"  {k.replace('_', ' ').capitalize():<22}: {v} records")
    print("----------------------------------\n")

def cmd_add_student(args):
    if len(args) < 5:
        print("[!] Error: Requires <name> <email> <college> <degree> <cgpa> [skills]")
        return
    name, email, college, degree, cgpa = args[:5]
    skills = args[5].split(',') if len(args) > 5 else []

    username = email.split('@')[0].lower()
    initials = "".join([p[0].upper() for p in name.split()[:2]]) or "ST"
    user_id = add_user(username, name, email, 'student', college, initials)
    add_student_profile(user_id, college, degree, 2026, float(cgpa))
    for s in skills:
        add_student_skill(user_id, s.strip(), 'Intermediate', 0, None)
    print(f"[SUCCESS] Student '{name}' (ID: {user_id}) created with {len(skills)} skills.")

def cmd_add_job(args):
    if len(args) < 7:
        print("[!] Error: Requires <recruiter_id> <company> <title> <type> <location> <stipend> <skills>")
        return
    recruiter_id, company, title, jtype, location, stipend, skills_str = args[:7]
    skills = [s.strip() for s in skills_str.split(',')]
    job_id = add_job(
        int(recruiter_id), company, title, jtype, location, 'Hybrid',
        stipend, '6 Months', f'{title} opportunity at {company}', skills
    )
    print(f"[SUCCESS] Job '{title}' (ID: {job_id}) posted for {company}.")

def cmd_query(sql):
    conn = get_db_connection()
    try:
        cur = conn.execute(sql)
        rows = cur.fetchall()
        if not rows:
            print("[i] Query returned 0 rows.")
            return
        cols = rows[0].keys()
        print("\n" + " | ".join([f"{c:<18}" for c in cols]))
        print("-" * (21 * len(cols)))
        for r in rows:
            print(" | ".join([f"{str(r[c])[:18]:<18}" for c in cols]))
        print()
    except Exception as e:
        print(f"[!] SQL Error: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        show_help()
        sys.exit(0)

    cmd = sys.argv[1].lower()
    if cmd in ('help', '--help', '-h'):
        show_help()
    elif cmd == 'stats':
        cmd_stats()
    elif cmd == 'seed':
        init_db()
        print("[SUCCESS] Database re-initialized and baseline data seeded.")
    elif cmd == 'add-student':
        cmd_add_student(sys.argv[2:])
    elif cmd == 'add-job':
        cmd_add_job(sys.argv[2:])
    elif cmd == 'query' and len(sys.argv) > 2:
        cmd_query(sys.argv[2])
    else:
        print(f"[!] Unknown command: {cmd}")
        show_help()
