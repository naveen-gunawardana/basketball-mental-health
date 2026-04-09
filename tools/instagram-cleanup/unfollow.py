#!/usr/bin/env python3
"""
Instagram cleanup — unfollow accounts that don't follow you back.

Setup:
    pip install -r requirements.txt
    playwright install chromium
    cp .env.example .env   # then fill in your credentials

Run:
    python unfollow.py

Options (edit at the top of the file):
    DRY_RUN          = True   → just prints who'd be unfollowed, doesn't click
    UNFOLLOW_LIMIT   = 50     → max unfollows per run (keep low to avoid bans)
    DELAY_BETWEEN    = 12     → seconds between each unfollow action
"""

import os, time, random, sys
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

load_dotenv()

# ── Config ────────────────────────────────────────────────────────────────────
USERNAME        = os.environ.get("IG_USERNAME", "")
PASSWORD        = os.environ.get("IG_PASSWORD", "")
DRY_RUN         = False    # set True to preview without unfollowing
UNFOLLOW_LIMIT  = 50       # max per session — keep ≤ 50 to stay under radar
DELAY_BETWEEN   = (10, 20) # random seconds between unfollows (lo, hi)
WHITELIST       = set()    # usernames to never unfollow e.g. {"friend1", "brand2"}

if not USERNAME or not PASSWORD:
    sys.exit("Error: set IG_USERNAME and IG_PASSWORD in .env")

# ── Helpers ───────────────────────────────────────────────────────────────────
def jitter(lo=1.5, hi=3.5):
    time.sleep(random.uniform(lo, hi))

def log(msg):
    print(f"  {msg}")

def dismiss_popups(page):
    """Dismiss 'Save login info' and 'Turn on notifications' dialogs."""
    for _ in range(4):
        for label in ["Not now", "Not Now", "Skip", "Dismiss"]:
            try:
                btn = page.get_by_text(label, exact=True).first
                if btn.is_visible(timeout=2000):
                    btn.click()
                    jitter(1, 2)
            except Exception:
                pass


def scroll_dialog_and_collect(page, api_data_store, modal_type):
    """
    Open following/followers modal, scroll to load all accounts, and
    collect usernames via intercepted API responses.
    """
    log(f"Clicking '{modal_type}' link on profile...")
    try:
        page.locator(f'a[href*="/{modal_type}/"]').first.click(timeout=8000)
    except PWTimeout:
        # Fallback: try text-based click
        page.get_by_text(modal_type, exact=False).first.click()

    jitter(2.5, 4)

    dialog = page.locator('[role="dialog"]').first
    try:
        dialog.wait_for(state="visible", timeout=10000)
    except PWTimeout:
        log(f"Warning: dialog didn't appear for {modal_type}")
        return

    log(f"Scrolling {modal_type} list (this takes a while for large lists)...")
    stall = 0
    prev  = 0
    while stall < 6:
        # Scroll the scrollable div inside the dialog
        dialog.evaluate("""el => {
            const scroller = el.querySelector('div[style*="overflow"]')
                          || el.querySelector('ul')
                          || el;
            scroller.scrollTop += 800;
        }""")
        jitter(1.8, 3.0)

        total = sum(len(r.get("users", [])) for r in api_data_store)
        if total == prev:
            stall += 1
        else:
            stall = 0
            prev  = total
            log(f"  Loaded {total} {modal_type} so far...")

    page.keyboard.press("Escape")
    jitter(1.5, 2.5)


def collect_usernames(api_data_store):
    return {u["username"] for r in api_data_store for u in r.get("users", [])}


def unfollow_account(page, username):
    """Navigate to a profile and click Unfollow."""
    page.goto(f"https://www.instagram.com/{username}/", wait_until="domcontentloaded")
    jitter(2, 4)

    # The button text might be "Following", "Requested", etc.
    for label in ["Following", "Requested"]:
        try:
            btn = page.get_by_role("button", name=label).first
            if btn.is_visible(timeout=4000):
                btn.click()
                jitter(1, 2)
                # Confirm dialog: "Unfollow"
                try:
                    page.get_by_role("button", name="Unfollow").click(timeout=5000)
                except PWTimeout:
                    pass
                return True
        except PWTimeout:
            continue
    return False


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print(f"\n{'='*52}")
    print(f"  Instagram Cleanup  —  @{USERNAME}")
    print(f"  DRY RUN: {DRY_RUN}  |  Limit: {UNFOLLOW_LIMIT}")
    print(f"{'='*52}\n")

    following_data  = []
    followers_data  = []

    def handle_response(response):
        url = response.url
        try:
            if "/friendships/" in url and "/following" in url:
                following_data.append(response.json())
            elif "/friendships/" in url and "/followers" in url:
                followers_data.append(response.json())
        except Exception:
            pass

    with sync_playwright() as pw:
        browser = pw.chromium.launch(
            headless=False,
            slow_mo=40,
            args=["--disable-blink-features=AutomationControlled"],
        )
        ctx = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/123.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1280, "height": 800},
            locale="en-US",
        )
        page = ctx.new_page()
        page.set_default_timeout(60000)   # 60s global timeout
        page.on("response", handle_response)

        # ── Login ──────────────────────────────────────────────────────────
        print("Step 1 — Logging in...")
        page.goto("https://www.instagram.com/accounts/login/", wait_until="load")
        jitter(3, 5)

        # Dismiss cookie consent banners (common in EU / some regions)
        for label in ["Allow all cookies", "Allow essential and optional cookies",
                      "Accept All", "Accept", "Decline optional cookies"]:
            try:
                btn = page.get_by_role("button", name=label).first
                if btn.is_visible(timeout=2000):
                    btn.click()
                    jitter(1, 2)
                    break
            except Exception:
                pass

        # Wait up to 60s for the username input to actually appear
        try:
            page.wait_for_selector('input[name="username"]', timeout=60000, state="visible")
        except PWTimeout:
            sys.exit("Login page didn't load the form. Instagram may be blocking headless — try running again.")

        username_input = page.locator('input[name="username"]')
        username_input.click()
        jitter(0.3, 0.6)
        page.keyboard.type(USERNAME, delay=random.randint(60, 130))
        jitter(0.6, 1.2)

        password_input = page.locator('input[name="password"]')
        password_input.click()
        jitter(0.3, 0.6)
        page.keyboard.type(PASSWORD, delay=random.randint(60, 130))
        jitter(0.5, 1.0)
        page.keyboard.press("Enter")
        page.wait_for_timeout(5000)

        dismiss_popups(page)

        if "login" in page.url:
            sys.exit("Login failed — check your credentials or complete 2FA manually then re-run.")

        log("Logged in ✓")

        # ── Collect following ──────────────────────────────────────────────
        print("\nStep 2 — Fetching following list...")
        page.goto(f"https://www.instagram.com/{USERNAME}/", wait_until="networkidle")
        jitter(2, 3)
        scroll_dialog_and_collect(page, following_data, "following")
        following = collect_usernames(following_data)
        log(f"You follow {len(following)} accounts")

        # ── Collect followers ──────────────────────────────────────────────
        print("\nStep 3 — Fetching followers list...")
        page.goto(f"https://www.instagram.com/{USERNAME}/", wait_until="networkidle")
        jitter(2, 3)
        scroll_dialog_and_collect(page, followers_data, "followers")
        followers = collect_usernames(followers_data)
        log(f"{len(followers)} accounts follow you back")

        # ── Compute non-followers ──────────────────────────────────────────
        not_following_back = (following - followers) - WHITELIST
        print(f"\nStep 4 — Results")
        log(f"Accounts not following back: {len(not_following_back)}")

        if not not_following_back:
            print("\nEveryone you follow follows you back. Nothing to do!")
            browser.close()
            return

        to_unfollow = sorted(not_following_back)[:UNFOLLOW_LIMIT]
        print(f"\nWill unfollow {len(to_unfollow)} accounts (limit: {UNFOLLOW_LIMIT}):\n")
        for u in to_unfollow:
            print(f"    @{u}")

        if DRY_RUN:
            print("\n[DRY RUN] No changes made. Set DRY_RUN=False to actually unfollow.")
            browser.close()
            return

        # ── Unfollow ───────────────────────────────────────────────────────
        print(f"\nStep 5 — Unfollowing (delays {DELAY_BETWEEN[0]}–{DELAY_BETWEEN[1]}s each)...")
        done = 0
        for username in to_unfollow:
            log(f"Unfollowing @{username}...")
            ok = unfollow_account(page, username)
            if ok:
                log(f"  ✓ Unfollowed @{username}")
                done += 1
            else:
                log(f"  ✗ Couldn't find unfollow button for @{username} (may be a page/business)")
            delay = random.uniform(*DELAY_BETWEEN)
            log(f"  Waiting {delay:.1f}s...")
            time.sleep(delay)

        print(f"\nDone. Unfollowed {done}/{len(to_unfollow)} accounts.")
        browser.close()


if __name__ == "__main__":
    main()
