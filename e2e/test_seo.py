"""Verify SEO tags on all pages."""
import sys
import urllib.request
import re

BASE = "http://localhost:3050"
ERRORS = []


def check(condition, label):
    if not condition:
        ERRORS.append(label)
        print(f"  FAIL: {label}")
    else:
        print(f"  PASS: {label}")


def fetch(path=""):
    url = f"{BASE}{path}"
    with urllib.request.urlopen(url) as r:
        return r.read().decode("utf-8")


def fetch_headers(path=""):
    url = f"{BASE}{path}"
    req = urllib.request.Request(url, method="HEAD")
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, dict(r.headers)
    except Exception as e:
        return 0, {}


# === Landing page ===
print("\n[Landing Page SEO]")
html = fetch("/")

check("<title>MSG to PDF" in html, "Title tag present")
check('name="description"' in html, "Meta description present")
check("Convert Outlook .MSG files" in html, "Description contains target copy")
check('property="og:title"' in html, "OG title tag")
check('property="og:description"' in html, "OG description tag")
check('property="og:image"' in html, "OG image tag")
check('name="twitter:card"' in html, "Twitter card tag")
check('rel="canonical"' in html, "Canonical tag present")
check("application/ld+json" in html, "JSON-LD structured data present")
check("SoftwareApplication" in html, "SoftwareApplication schema")
check("FAQPage" in html, "FAQPage schema")
check("Frequently asked questions" in html, "FAQ section rendered")
check("How do I open a .MSG file without Outlook" in html, "FAQ Q1 rendered")
check("convert MSG to PDF for free" in html, "FAQ Q2 rendered")
check("What is a .MSG file" in html, "FAQ Q3 rendered")
check("convert MSG to PDF on Mac" in html, "FAQ Q4 rendered")

# Keywords in copy
check("Open MSG files without Outlook" in html, "Keyword: open MSG without Outlook in subtitle")
check("Convert .MSG files" in html, "Keyword: convert .msg files in feature")
check("Outlook MSG converter" in html, "Keyword: Outlook MSG converter in feature")

# Semantic HTML
check("<main" in html, "Semantic <main> element")
check("<header" in html, "Semantic <header> element")
check("<footer" in html, "Semantic <footer> element")
check("<h1" in html, "h1 element present")

# === Convert page ===
print("\n[Convert Page SEO]")
html = fetch("/convert")
check('rel="canonical"' in html and "/convert" in html, "Canonical on /convert")
check('name="description"' in html, "Meta description on /convert")

# === Pricing page ===
print("\n[Pricing Page SEO]")
html = fetch("/pricing")
check('rel="canonical"' in html and "/pricing" in html, "Canonical on /pricing")
check('name="description"' in html, "Meta description on /pricing")

# === Login page ===
print("\n[Login Page SEO]")
html = fetch("/login")
check('rel="canonical"' in html and "/login" in html, "Canonical on /login")
check('name="description"' in html, "Meta description on /login")

# === Signup page ===
print("\n[Signup Page SEO]")
html = fetch("/signup")
check('rel="canonical"' in html and "/signup" in html, "Canonical on /signup")
check('name="description"' in html, "Meta description on /signup")

# === robots.txt ===
print("\n[robots.txt]")
robots = fetch("/robots.txt")
check("user-agent" in robots.lower(), "robots.txt has User-agent")
check("Allow: /" in robots, "robots.txt allows all")
check("Disallow: /api/" in robots, "robots.txt disallows /api/")
check("sitemap" in robots.lower(), "robots.txt references sitemap")

# === sitemap.xml ===
print("\n[sitemap.xml]")
sitemap = fetch("/sitemap.xml")
check("<urlset" in sitemap, "Valid sitemap XML")
check("/convert" in sitemap, "Sitemap includes /convert")
check("priority" in sitemap, "Sitemap has priorities")

# === OG image ===
print("\n[OG Image]")
try:
    with urllib.request.urlopen(f"{BASE}/opengraph-image") as r:
        og_status = r.status
        og_ct = r.headers.get("Content-Type", "")
        og_data = r.read()
    check(og_status == 200, f"OG image returns 200 (got {og_status})")
    check("image" in og_ct, f"OG image content-type is image (got {og_ct})")
    check(len(og_data) > 1000, f"OG image has substantial content ({len(og_data)} bytes)")
except Exception as e:
    check(False, f"OG image request failed: {e}")

if ERRORS:
    print(f"\n{'='*50}")
    print(f"FAILED ({len(ERRORS)} issues):")
    for e in ERRORS:
        print(f"  - {e}")
    sys.exit(1)
else:
    print(f"\nAll SEO checks passed.")
