"""Test 3: Convert page UI — upload zone, options, file handling, convert button."""
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
    page.goto(BASE + "/convert", timeout=120000)
    page.wait_for_load_state("domcontentloaded")
    page.wait_for_timeout(3000)

    print("\n[Convert Page UI]")

    # --- Page heading ---
    h1 = page.locator("h1")
    h1_text = h1.first.inner_text(timeout=10000) if h1.count() > 0 else ""
    check(h1.count() > 0 and h1.first.is_visible(), "Page heading visible")
    check("Convert .MSG to PDF" in h1_text, "Correct heading text")

    subtitle = page.locator("text=Drop your Outlook .MSG files")
    check(subtitle.count() > 0 and subtitle.first.is_visible(), "Subtitle visible")

    # --- Upload zone ---
    upload_zone = page.locator("text=Drop .MSG files or click to browse")
    check(upload_zone.count() > 0 and upload_zone.first.is_visible(), "Upload zone visible with instructions")

    file_limit = page.locator("text=Up to 25 files")
    check(file_limit.count() > 0 and file_limit.first.is_visible(), "File limit info visible")

    # --- Options card ---
    options_title = page.locator("text=Options")
    check(options_title.count() > 0 and options_title.first.is_visible(), "Options card title visible")

    header_opt = page.locator("text=Include email headers")
    check(header_opt.count() > 0 and header_opt.first.is_visible(), "Option: Include email headers")

    embed_opt = page.locator("text=Embed attachments inside PDF")
    check(embed_opt.count() > 0 and embed_opt.first.is_visible(), "Option: Embed attachments")

    zip_opt = page.locator("text=Save attachments as separate ZIP")
    check(zip_opt.count() > 0 and zip_opt.first.is_visible(), "Option: Save as ZIP")

    # --- Convert button (should be disabled with no files) ---
    convert_btn = page.locator("button:has-text('Convert to PDF')")
    check(convert_btn.count() > 0 and convert_btn.first.is_visible(), "Convert button visible")
    check(convert_btn.first.is_disabled(), "Convert button disabled when no files")

    # --- Privacy notice ---
    privacy = page.locator("text=Files are processed temporarily")
    check(privacy.count() > 0 and privacy.first.is_visible(), "Privacy notice on convert page")

    # --- Upload a fake .msg file ---
    file_input = page.locator("input[type='file']")
    file_input.set_input_files({
        "name": "test-email.msg",
        "mimeType": "application/vnd.ms-outlook",
        "buffer": b"\xd0\xcf\x11\xe0" + b"\x00" * 100,
    })
    page.wait_for_timeout(1000)

    file_entry = page.locator("text=test-email.msg")
    check(file_entry.count() > 0 and file_entry.first.is_visible(), "Uploaded file appears in list")

    # Convert button should now be enabled
    check(not convert_btn.first.is_disabled(), "Convert button enabled after file added")

    # --- Screenshot ---
    page.screenshot(path="e2e/screenshots/03_convert_with_file.png", full_page=True)

    # --- Toggle ZIP checkbox ---
    checkboxes = page.locator("button[role='checkbox']")
    if checkboxes.count() >= 3:
        checkboxes.nth(2).click()
        page.wait_for_timeout(300)
        check(True, "ZIP checkbox toggled")
    else:
        check(False, "ZIP checkbox toggled (not enough checkboxes found)")

    # --- Try clicking convert ---
    convert_btn.first.click()
    page.wait_for_timeout(3000)

    # Should show converting state or an error (backend uses dummy env)
    body_text = page.locator("body").inner_text(timeout=5000)
    has_feedback = "Converting" in body_text or "failed" in body_text.lower() or "error" in body_text.lower()
    check(has_feedback, "Convert attempt shows feedback (progress or error)")

    page.screenshot(path="e2e/screenshots/03_convert_after_attempt.png", full_page=True)

    browser.close()

if ERRORS:
    print(f"\n{'='*50}")
    print(f"FAILED ({len(ERRORS)} issues):")
    for e in ERRORS:
        print(f"  - {e}")
    sys.exit(1)
else:
    print(f"\nAll convert page checks passed.")
