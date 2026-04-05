"""Test 2: Navigation flow — header links, cross-page navigation."""
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


def goto(page, url):
    page.goto(url, timeout=120000)
    page.wait_for_load_state("domcontentloaded")
    page.wait_for_timeout(3000)


def nav_click(page, locator):
    locator.click()
    page.wait_for_timeout(5000)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 720})
    goto(page, BASE)

    print("\n[Navigation Flow]")

    # --- Header elements ---
    logo = page.locator("a[href='/']").first
    check(logo.is_visible(), "Logo/brand link visible")

    converter_nav = page.locator("header a[href='/convert']")
    check(converter_nav.count() > 0 and converter_nav.first.is_visible(), "Header: Converter link visible")

    pricing_nav = page.locator("header a[href='/pricing']")
    check(pricing_nav.count() > 0 and pricing_nav.first.is_visible(), "Header: Pricing link visible")

    # --- Navigate: Home -> Converter ---
    nav_click(page, page.locator("header a[href='/convert']"))
    check("/convert" in page.url, "Navigated to /convert")
    h1 = page.locator("h1")
    h1_text = h1.first.inner_text(timeout=10000) if h1.count() > 0 else ""
    check("Convert .MSG to PDF" in h1_text, "/convert has correct heading")

    # --- Navigate: Converter -> Pricing ---
    nav_click(page, page.locator("header a[href='/pricing']").first)
    check("/pricing" in page.url, "Navigated to /pricing")
    h1 = page.locator("h1")
    h1_text = h1.first.inner_text(timeout=10000) if h1.count() > 0 else ""
    check("Pick the plan" in h1_text, "/pricing has correct heading")

    # --- Navigate: Pricing -> Login ---
    goto(page, BASE + "/login")
    check("/login" in page.url, "Navigated to /login")
    h1 = page.locator("h1")
    h1_text = h1.first.inner_text(timeout=10000) if h1.count() > 0 else ""
    check("Welcome back" in h1_text, "/login has correct heading")

    # --- Navigate: Login -> Signup ---
    signup_link = page.locator("a[href*='/signup']").first
    nav_click(page, signup_link)
    check("/signup" in page.url, "Navigated to /signup")
    h1 = page.locator("h1")
    h1_text = h1.first.inner_text(timeout=10000) if h1.count() > 0 else ""
    check("Create your account" in h1_text, "/signup has correct heading")

    # --- Navigate: Signup -> Login ---
    login_link = page.locator("a[href*='/login']").first
    nav_click(page, login_link)
    check("/login" in page.url, "Navigated back to /login")

    # --- Navigate: Login -> Home via logo ---
    nav_click(page, page.locator("a[href='/']").first)
    check(page.url.rstrip("/") == BASE or page.url == BASE + "/", "Logo navigates home")

    # --- 404 page ---
    goto(page, BASE + "/nonexistent-page-xyz")
    page.screenshot(path="e2e/screenshots/02_404.png")
    body_text = page.locator("body").inner_text(timeout=10000)
    check("404" in body_text or "not found" in body_text.lower(), "404 page shown for invalid route")

    browser.close()

if ERRORS:
    print(f"\n{'='*50}")
    print(f"FAILED ({len(ERRORS)} issues):")
    for e in ERRORS:
        print(f"  - {e}")
    sys.exit(1)
else:
    print(f"\nAll navigation checks passed.")
