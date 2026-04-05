"""Test 5: Pricing page — plan cards, features, CTAs, promises."""
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
    page = browser.new_page(viewport={"width": 1280, "height": 720})
    page.goto(BASE + "/pricing", timeout=120000)
    page.wait_for_load_state("domcontentloaded")
    page.wait_for_timeout(3000)

    print("\n[Pricing Page]")

    # --- Page heading ---
    h1 = page.locator("h1")
    h1_text = h1.first.inner_text(timeout=10000) if h1.count() > 0 else ""
    check(h1.count() > 0 and h1.first.is_visible(), "Pricing heading visible")
    check("Pick the plan" in h1_text, "Correct heading text")

    subtitle = page.locator("text=watermark-free PDFs")
    check(subtitle.count() > 0 and subtitle.first.is_visible(), "Subtitle about watermark-free PDFs")

    tagline = page.locator("text=Fair, transparent pricing")
    check(tagline.count() > 0 and tagline.first.is_visible(), "Fair pricing tagline")

    # --- Free plan card ---
    free_title = page.locator("h3:has-text('Free')").first
    check(free_title.is_visible(), "Free plan card title")

    free_price = page.locator("text=$0")
    check(free_price.count() > 0 and free_price.first.is_visible(), "Free plan price: $0")

    free_features = [
        "8 conversions per month",
        "15 MB per file",
        "watermark-free PDFs",
    ]
    for feat in free_features:
        el = page.locator(f"text={feat}").first
        check(el.is_visible(), f"Free plan: {feat}")

    # --- Pro plan card ---
    pro_title = page.locator("h3:has-text('Pro')").first
    check(pro_title.is_visible(), "Pro plan card title")

    pro_price = page.locator("text=$9")
    check(pro_price.count() > 0 and pro_price.first.is_visible(), "Pro plan price: $9")

    most_popular = page.locator("text=Most popular")
    check(most_popular.count() > 0 and most_popular.first.is_visible(), "Most popular badge on Pro")

    pro_features = [
        "Unlimited conversions",
        "50 MB per file",
        "conversion history with downloads",
        "Priority support",
    ]
    for feat in pro_features:
        el = page.locator(f"text={feat}").first
        check(el.is_visible(), f"Pro plan: {feat}")

    # --- Pro Annual card ---
    annual_title = page.locator("h3:has-text('Pro Annual')")
    check(annual_title.count() > 0 and annual_title.first.is_visible(), "Pro Annual card title")

    annual_price = page.locator("text=$89")
    check(annual_price.count() > 0 and annual_price.first.is_visible(), "Pro Annual price: $89")

    # --- Upgrade buttons ---
    upgrade_pro = page.locator("button:has-text('Upgrade to Pro')").first
    check(upgrade_pro.is_visible(), "Upgrade to Pro button")

    upgrade_annual = page.locator("button:has-text('Upgrade to Pro Annual')")
    check(upgrade_annual.count() > 0 and upgrade_annual.first.is_visible(), "Upgrade to Pro Annual button")

    # --- CTA for free (not logged in = signup link) ---
    signup_cta = page.locator("text=Create free account")
    check(signup_cta.count() > 0 and signup_cta.first.is_visible(), "Free plan CTA: Create free account")

    # --- Promise section ---
    promises = [
        "No watermarks at any tier",
        "same PDF quality as Pro",
        "Cancel anytime",
        "Files are deleted after conversion",
    ]
    for promise in promises:
        el = page.locator(f"text={promise}")
        check(el.count() > 0 and el.first.is_visible(), f"Promise: {promise}")

    # --- Screenshot ---
    page.screenshot(path="e2e/screenshots/05_pricing.png", full_page=True)

    # --- Test CTA interaction ---
    signup_cta.first.click()
    page.wait_for_timeout(5000)
    check("/signup" in page.url, "Free plan CTA navigates to /signup")

    browser.close()

if ERRORS:
    print(f"\n{'='*50}")
    print(f"FAILED ({len(ERRORS)} issues):")
    for e in ERRORS:
        print(f"  - {e}")
    sys.exit(1)
else:
    print(f"\nAll pricing page checks passed.")
