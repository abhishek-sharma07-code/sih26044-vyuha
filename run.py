import os
import sys

# Ensure UTF-8 output on Windows console
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from database import init_db
from app import app

if __name__ == '__main__':
    print("==================================================================")
    print("[*] AYUSHSETU: National Academia - Industry Collaboration Platform")
    print("[*] Ministry of Ayush, Government of India")
    print("==================================================================")
    
    db_path = os.path.join(os.path.dirname(__file__), "portal.db")
    if not os.path.exists(db_path):
        print("Initializing database and seeding demo data...")
        init_db()
    else:
        print("Database portal.db verified.")

    print("\n[OK] Portal is LIVE at: http://127.0.0.1:5000")
    print("     Open http://127.0.0.1:5000 in your browser to explore the prototype.")
    print("     Switch seamlessly between Student, Recruiter, TPO, and Admin roles!")
    print("==================================================================\n")

    app.run(host='127.0.0.1', port=5000, debug=False)
