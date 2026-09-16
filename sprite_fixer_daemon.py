"""A background process to automatically fix oversized sprites."""
import time
import subprocess

while True:
    subprocess.run(["python3", "auto_fix_sprites.py"], check=True)
    time.sleep(600) # Run every 10 minutes
