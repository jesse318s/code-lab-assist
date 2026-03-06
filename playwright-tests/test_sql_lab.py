# Playwright tests for sql-lab/index.html
from playwright.sync_api import Page, expect

def test_page_loads(serve, page: Page):
    url = serve("sql-lab")

    page.goto(url)
    expect(page).to_have_title("SQL Practice")

def test_controls_visible(serve, page: Page):
    url = serve("sql-lab")

    page.goto(url)
    expect(page.locator("#queryButton")).to_be_visible()
    expect(page.locator("#runButton")).to_be_visible()
    expect(page.locator("#queryInput")).to_be_visible()
    expect(page.locator("#output")).to_be_attached()

def test_no_uncaught_errors(serve, page: Page):
    errors = []

    page.on("pageerror", lambda exc: errors.append(str(exc)))

    url = serve("sql-lab")

    page.goto(url)
    page.wait_for_timeout(500)
    assert not errors, f"Uncaught JS errors: {errors}"
