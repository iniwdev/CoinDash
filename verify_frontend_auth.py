"""
verify_frontend_auth.py — CoinDash AI
Tests the entire frontend auth integration stack from the Python client side.
Verifies backend endpoints that the frontend now wires against.
"""
import asyncio
import httpx

BASE = "http://localhost:8000/api/v1"
EMAIL = "fe_auth_test@coindash.dev"
PASSWORD = "securepass123"

PASS = "\033[92m[PASS]\033[0m"
FAIL = "\033[91m[FAIL]\033[0m"

def ok(msg): print(f"  {PASS} {msg}")
def fail(msg): print(f"  {FAIL} {msg}")

async def run():
    print("\n── Frontend Auth Integration Verification ────────────────────")

    async with httpx.AsyncClient(timeout=10) as c:

        # 1. Unauthenticated access returns 401
        print("\n[1] Protected endpoints return 401 without token")
        for path in ["/watchlists/", "/alerts/"]:
            r = await c.get(f"{BASE}{path}")
            if r.status_code == 401:
                ok(f"GET {path} → 401")
            else:
                fail(f"GET {path} → {r.status_code} (expected 401)")

        # 2. Signup
        print("\n[2] Signup flow")
        r = await c.post(f"{BASE}/auth/signup", json={"email": EMAIL, "password": PASSWORD})
        if r.status_code == 201:
            data = r.json()
            access = data["access_token"]
            refresh = data["refresh_token"]
            user_email = data["user"]["email"]
            ok(f"Signed up as {user_email}")
        elif r.status_code == 409:
            # Already exists — login instead
            r2 = await c.post(f"{BASE}/auth/login", json={"email": EMAIL, "password": PASSWORD})
            data = r2.json()
            access = data["access_token"]
            refresh = data["refresh_token"]
            ok(f"User exists, logged in — got tokens")
        else:
            fail(f"Signup returned {r.status_code}: {r.text}")
            return

        headers = {"Authorization": f"Bearer {access}"}

        # 3. /auth/me works with access token
        print("\n[3] /auth/me with access token")
        r = await c.get(f"{BASE}/auth/me", headers=headers)
        if r.status_code == 200:
            ok(f"/me returned email: {r.json()['email']}")
        else:
            fail(f"/me returned {r.status_code}")

        # 4. Protected watchlist access works with token
        print("\n[4] Watchlist access with Bearer token")
        r = await c.get(f"{BASE}/watchlists/", headers=headers)
        if r.status_code == 200:
            wls = r.json()["watchlists"]
            ok(f"Got {len(wls)} watchlist(s) — user-owned data confirmed")
        else:
            fail(f"Watchlists returned {r.status_code}: {r.text}")

        # 5. Protected alerts access works with token
        print("\n[5] Alerts access with Bearer token")
        r = await c.get(f"{BASE}/alerts/", headers=headers)
        if r.status_code == 200:
            ok(f"Alerts endpoint OK — returned {len(r.json()['alerts'])} alert(s)")
        else:
            fail(f"Alerts returned {r.status_code}: {r.text}")

        # 6. Token refresh works
        print("\n[6] Refresh token rotation")
        r = await c.post(f"{BASE}/auth/refresh", json={"refresh_token": refresh})
        if r.status_code == 200:
            new_data = r.json()
            new_access = new_data["access_token"]
            new_refresh = new_data["refresh_token"]
            ok(f"Refresh → new access_token obtained")
        else:
            fail(f"Refresh returned {r.status_code}")
            return

        # 7. Old refresh token is revoked
        print("\n[7] Old refresh token is revoked after rotation")
        r = await c.post(f"{BASE}/auth/refresh", json={"refresh_token": refresh})
        if r.status_code == 401:
            ok("Old refresh token correctly rejected (401)")
        else:
            fail(f"Old refresh token was NOT rejected — got {r.status_code}")

        # 8. New token still works
        print("\n[8] New access token works on protected endpoint")
        r = await c.get(f"{BASE}/watchlists/", headers={"Authorization": f"Bearer {new_access}"})
        if r.status_code == 200:
            ok("New access token works on /watchlists/")
        else:
            fail(f"New access token failed on /watchlists/ → {r.status_code}")

        # 9. Logout
        print("\n[9] Logout revokes refresh token")
        r = await c.post(f"{BASE}/auth/logout", json={"refresh_token": new_refresh})
        if r.status_code == 204:
            ok("Logout successful (204)")
        else:
            fail(f"Logout returned {r.status_code}")

        # 10. Post-logout refresh fails
        print("\n[10] Post-logout refresh token rejected")
        r = await c.post(f"{BASE}/auth/refresh", json={"refresh_token": new_refresh})
        if r.status_code == 401:
            ok("Logged-out refresh token correctly rejected (401)")
        else:
            fail(f"Logged-out refresh token returned {r.status_code}")

    print("\n── Verification complete ─────────────────────────────────────\n")

if __name__ == "__main__":
    asyncio.run(run())
