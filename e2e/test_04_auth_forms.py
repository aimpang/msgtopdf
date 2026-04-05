"""Test 4: Auth forms — login, signup, forgot password, form validation."""
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


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 720})

    # ===================== LOGIN PAGE =====================
    print("\n[Login Page]")
    goto(page, BASE + "/login")

    h1 = page.locator("h1")
    h1_text = h1.first.inner_text(timeout=10000) if h1.count() > 0 else ""
    check("Welcome back" in h1_text, "Login heading: Welcome back")

    subtitle = page.locator("text=Log in to see your conversion history")
    check(subtitle.count() > 0 and subtitle.first.is_visible(), "Login subtitle visible")

    # Form fields
    email_input = page.locator("#email")
    check(email_input.count() > 0 and email_input.first.is_visible(), "Email field visible")
    check(email_input.first.get_attribute("type") == "email", "Email field type=email")
    check(email_input.first.get_attribute("required") is not None, "Email field required")

    password_input = page.locator("#password")
    check(password_input.count() > 0 and password_input.first.is_visible(), "Password field visible")
    check(password_input.first.get_attribute("type") == "password", "Password field type=password")

    # Labels
    email_label = page.locator("label[for='email']")
    check(email_label.count() > 0 and "Email" in email_label.first.inner_text(), "Email label")

    password_label = page.locator("label[for='password']")
    check(password_label.count() > 0 and "Password" in password_label.first.inner_text(), "Password label")

    # Forgot password link
    forgot = page.locator("a[href='/forgot-password']")
    check(forgot.count() > 0 and forgot.first.is_visible(), "Forgot password link visible")

    # Submit button
    login_btn = page.locator("button[type='submit']")
    check(login_btn.count() > 0 and login_btn.first.is_visible(), "Log in button visible")

    # Guest mode link
    guest = page.locator("text=Continue as guest")
    check(guest.count() > 0 and guest.first.is_visible(), "Continue as guest button")

    guest_note = page.locator("text=3 conversions per session")
    check(guest_note.count() > 0 and guest_note.first.is_visible(), "Guest limitation note")

    # Link to signup
    signup_link = page.locator("a[href*='/signup']").first
    check(signup_link.is_visible(), "Link to signup page")

    page.screenshot(path="e2e/screenshots/04_login.png")

    # ===================== SIGNUP PAGE =====================
    print("\n[Signup Page]")
    goto(page, BASE + "/signup")

    h1 = page.locator("h1")
    h1_text = h1.first.inner_text(timeout=10000) if h1.count() > 0 else ""
    check("Create your account" in h1_text, "Signup heading")

    subtitle = page.locator("text=Get 8 free conversions a month")
    check(subtitle.count() > 0 and subtitle.first.is_visible(), "Signup subtitle visible")

    email_input = page.locator("#email")
    check(email_input.count() > 0 and email_input.first.is_visible(), "Signup: email field")

    password_input = page.locator("#password")
    check(password_input.count() > 0 and password_input.first.is_visible(), "Signup: password field")

    min_chars = page.locator("text=At least 8 characters")
    check(min_chars.count() > 0 and min_chars.first.is_visible(), "Password minimum hint visible")

    create_btn = page.locator("button[type='submit']")
    check(create_btn.count() > 0 and create_btn.first.is_visible(), "Create account button visible")

    login_link = page.locator("a[href*='/login']").first
    check(login_link.is_visible(), "Link back to login")

    page.screenshot(path="e2e/screenshots/04_signup.png")

    # ===================== FORGOT PASSWORD =====================
    print("\n[Forgot Password Page]")
    goto(page, BASE + "/forgot-password")

    page.screenshot(path="e2e/screenshots/04_forgot_password.png")
    body_text = page.locator("body").inner_text(timeout=10000).lower()
    check("forgot" in body_text or "reset" in body_text or "password" in body_text,
          "Forgot password page has relevant content")

    email_field = page.locator("#email")
    check(email_field.count() > 0 and email_field.first.is_visible(), "Forgot password: email field present")

    # ===================== LOGIN FORM INTERACTION =====================
    print("\n[Login Form Interaction]")
    goto(page, BASE + "/login")

    page.locator("#email").fill("test@example.com")
    page.locator("#password").fill("testpassword123")

    page.locator("button[type='submit']").first.click()
    page.wait_for_timeout(3000)

    page.screenshot(path="e2e/screenshots/04_login_submitted.png")

    # Check guest mode navigation works
    goto(page, BASE + "/login")
    page.locator("text=Continue as guest").click()
    page.wait_for_timeout(5000)
    check("/convert" in page.url, "Guest mode navigates to /convert")

    browser.close()

if ERRORS:
    print(f"\n{'='*50}")
    print(f"FAILED ({len(ERRORS)} issues):")
    for e in ERRORS:
        print(f"  - {e}")
    sys.exit(1)
else:
    print(f"\nAll auth form checks passed.")
