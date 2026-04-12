# Playwright tests for sql-lab/index.html
from playwright.sync_api import Page, expect

def test_page_loads(serve, page: Page):
    url = serve("sql-lab")

    page.goto(url)
    expect(page).to_have_title("SQL Lab")

def test_controls_visible(serve, page: Page):
    url = serve("sql-lab")

    page.goto(url)
    # Wait for page to fully load
    page.wait_for_load_state("networkidle")
    # Click sandbox tab to reveal controls
    page.locator('button.tab-btn:has-text("SQL Sandbox")').click()
    page.wait_for_selector("#sandbox.active")
    expect(page.locator("#queryInput")).to_be_visible()
    expect(page.locator("#queryInput")).to_be_visible()
    expect(page.locator("#output")).to_be_attached()

def test_no_uncaught_errors(serve, page: Page):
    errors = []

    page.on("pageerror", lambda exc: errors.append(str(exc)))

    url = serve("sql-lab")

    page.goto(url)
    page.wait_for_timeout(500)
    assert not errors, f"Uncaught JS errors: {errors}"
