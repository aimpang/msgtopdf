"""Test 1: Landing page — hero, CTAs, features, steps, footer."""
import sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3050"
ERRORS = []


def check(condition, label):
    if not condition:
        ERRORS.append(label)
        print(f"  FAIL: {label}")
    else:
        print(f"  PASS: {label}")


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    # First load compiles on-demand in dev mode — allow extra time
    page.goto(BASE, timeout=120000)
    page.wait_for_load_state("domcontentloaded")
    page.wait_for_timeout(3000)

    # --- Hero section ---
    print("\n[Landing Page]")
    h1 = page.locator("h1")
    check(h1.count() > 0 and h1.first.is_visible(), "Hero h1 is visible")
    h1_text = h1.first.inner_text(timeout=10000) if h1.count() > 0 else ""
    check(".MSG" in h1_text, "Hero mentions .MSG")
    check("PDF" in h1_text, "Hero mentions PDF")

    # Subtitle
    subtitle = page.locator("text=Open MSG files without Outlook")
    check(subtitle.count() > 0 and subtitle.first.is_visible(), "Subtitle visible")

    # Free tier pill
    pill = page.locator("text=Free tier available")
    check(pill.count() > 0 and pill.first.is_visible(), "Free tier pill visible")

    # Privacy strip
    privacy = page.locator("text=Files are processed temporarily")
    check(privacy.count() > 0 and privacy.first.is_visible(), "Privacy notice visible")

    # --- CTA buttons ---
    upload_cta = page.locator("a[href='/convert']").first
    check(upload_cta.is_visible(), "Upload CTA visible")

    pricing_cta = page.locator("a[href='/pricing']").first
    check(pricing_cta.is_visible(), "Pricing CTA visible")

    signup_link = page.locator("a[href='/signup']").first
    check(signup_link.is_visible(), "Signup link visible")

    # --- Feature cards ---
    features = ["Blazing fast", "Private by default", "Headers & attachments"]
    for feat in features:
        el = page.locator(f"text={feat}")
        check(el.count() > 0 and el.first.is_visible(), f"Feature card: {feat}")

    # --- How it works steps ---
    steps = ["Drop your .MSG files", "Pick your options", "Download clean PDFs"]
    for step in steps:
        el = page.locator(f"text={step}")
        check(el.count() > 0 and el.first.is_visible(), f"Step: {step}")

    start_btn = page.locator("text=Start converting")
    check(start_btn.count() > 0 and start_btn.first.is_visible(), "Start converting CTA visible")

    # --- Footer ---
    footer_links = ["/pricing", "/convert", "/login", "/signup"]
    for href in footer_links:
        el = page.locator(f"footer a[href='{href}']")
        check(el.count() > 0 and el.first.is_visible(), f"Footer link: {href}")

    copyright_el = page.locator("footer")
    footer_text = copyright_el.inner_text(timeout=5000) if copyright_el.count() > 0 else ""
    check("MSG to PDF" in footer_text, "Copyright notice in footer")

    # --- Navigation from CTA ---
    page.locator("a[href='/convert']").first.click()
    page.wait_for_timeout(5000)
    check("/convert" in page.url, "Upload CTA navigates to /convert")

    page.goto(BASE, timeout=60000)
    page.wait_for_timeout(3000)
    page.locator("a[href='/pricing']").first.click()
    page.wait_for_timeout(5000)
    check("/pricing" in page.url, "Pricing CTA navigates to /pricing")

    # Screenshot
    page.goto(BASE, timeout=60000)
    page.wait_for_timeout(3000)
    page.screenshot(path="e2e/screenshots/01_landing.png", full_page=True)

    browser.close()

if ERRORS:
    print(f"\n{'='*50}")
    print(f"FAILED ({len(ERRORS)} issues):")
    for e in ERRORS:
        print(f"  - {e}")
    sys.exit(1)
else:
    print(f"\nAll landing page checks passed.")
