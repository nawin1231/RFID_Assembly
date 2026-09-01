import subprocess
import sys
import os
import time

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PORT     = 8001

def start():
    env = os.environ.copy()
    env['PYTHONUNBUFFERED'] = '1'
    return subprocess.Popen([
        sys.executable, '-m', 'uvicorn', 'main_assy:app',
        '--port', str(PORT), '--log-level', 'warning'
    ], cwd=BASE_DIR, env=env)

process = None
try:
    process = start()
    print(f"[start_assy] Started on port {PORT}")
    while True:
        if process.poll() is not None:
            print("[start_assy] Crashed → Restarting...")
            time.sleep(3)
            process = start()
        time.sleep(3)
except KeyboardInterrupt:
    if process:
        process.terminate()
    print("[start_assy] Stopped")