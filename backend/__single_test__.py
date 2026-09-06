import os, sys
BACKEND = r"d:\PERSONAL PROJECTS\BIS-agent\backend"
REPO    = r"d:\PERSONAL PROJECTS\BIS-agent"
os.chdir(BACKEND)
sys.path.insert(0, BACKEND)
sys.path.insert(0, REPO)
from dotenv import load_dotenv
load_dotenv(os.path.join(BACKEND, ".env"))

import time
print("Waiting 70s for API quota to reset after test load...")
time.sleep(70)

from fastapi.testclient import TestClient
from app.main import app
client = TestClient(app)

print("\n=== LIVE API TEST: Pressure Cooker ===")
resp = client.post("/api/chat", json={"message": "Which Indian Standard applies to pressure cookers?"})
d = resp.json()
print(f"HTTP status     : {resp.status_code}")
print(f"intent          : {d.get('intent')}")
print(f"confidence      : {d.get('confidence')}")
print(f"confidence_level: {d.get('confidence_level')}")
print(f"needs_clarif    : {d.get('needs_clarification')}")
print(f"sources         : {len(d.get('sources', []))}")
src_titles = [s.get('title','') for s in d.get('sources',[])[:5]]
print(f"top sources     : {src_titles}")
print(f"evidence_used   : {d.get('evidence_used',[])[:3]}")
answer = d.get('answer','')
print(f"\nANSWER:\n{answer[:600]}")
warns = [w for w in d.get('warnings',[]) if 'LLM generation warning' in w]
if warns:
    print(f"\nLLM WARNING: {warns[0][:200]}")
else:
    print("\nNo LLM generation warnings — Gemini succeeded.")
print("\n=== DONE ===")