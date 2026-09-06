import os, sys
BACKEND = r"d:\PERSONAL PROJECTS\BIS-agent\backend"
REPO    = r"d:\PERSONAL PROJECTS\BIS-agent"
os.chdir(BACKEND)
sys.path.insert(0, BACKEND)
sys.path.insert(0, REPO)
from dotenv import load_dotenv
load_dotenv(os.path.join(BACKEND, ".env"))

from rag.retrieval.hybrid import BISHybridRetriever
r = BISHybridRetriever()
result = r.search("Which Indian Standard applies to pressure cookers?", top_k=5)

print("=== SEMANTIC CHUNKS (score + source_title) ===")
for c in result.semantic_chunks:
    print(f"  score={c.get('score',0):.4f}  title={c.get('source_title','?')[:60]}")

print("\n=== ALL SOURCES ===")
for s in result.sources:
    print(f"  [{s.get('source_type','?')}] {s.get('source_title','?')[:60]}")

print(f"\nconfidence_score: {result.confidence_score}")