# Playwright tests for javascript-lab/index.html
from playwright.sync_api import Page, expect

def test_page_loads(serve, page: Page):
    url = serve("javascript-lab")

    page.goto(url)
    expect(page).to_have_title("JavaScript Practice")

def test_no_uncaught_errors(serve, page: Page):
    errors = []

    page.on("pageerror", lambda exc: errors.append(str(exc)))

    url = serve("javascript-lab")

    page.goto(url)
    page.wait_for_timeout(500)
    assert errors == [], f"Uncaught JS errors: {errors}"
