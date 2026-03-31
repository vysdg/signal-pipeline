import os
import sys
from dotenv import load_dotenv
load_dotenv()

print("[worker] iniciando...", flush=True)

try:
    print("[worker] importando consumer...", flush=True)
    from src.services.consumer import start_consumer
    print("[worker] consumer importado, conectando...", flush=True)
    start_consumer()
except Exception as e:
    import traceback
    print(f"[worker] ERRO: {e}", flush=True)
    traceback.print_exc()
    sys.exit(1)
