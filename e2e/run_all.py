"""Run all e2e tests sequentially and report results."""
import subprocess
import sys
import os

TESTS = [
    ("01 Landing Page", "test_01_landing_page.py"),
    ("02 Navigation", "test_02_navigation.py"),
    ("03 Convert Page", "test_03_convert_page.py"),
    ("04 Auth Forms", "test_04_auth_forms.py"),
    ("05 Pricing Page", "test_05_pricing_page.py"),
]

script_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.dirname(script_dir)
passed = []
failed = []

for name, script in TESTS:
    print(f"\n{'='*60}")
    print(f"Running: {name}")
    print(f"{'='*60}")
    result = subprocess.run(
        [sys.executable, os.path.join(script_dir, script)],
        cwd=project_dir,
    )
    if result.returncode == 0:
        passed.append(name)
    else:
        failed.append(name)

print(f"\n{'='*60}")
print(f"RESULTS: {len(passed)} passed, {len(failed)} failed out of {len(TESTS)}")
print(f"{'='*60}")
if passed:
    print("Passed:")
    for t in passed:
        print(f"  + {t}")
if failed:
    print("Failed:")
    for t in failed:
        print(f"  - {t}")
    sys.exit(1)
