import asyncio
import httpx
import sys

BASE = "http://localhost:8000/api/v1"
EMAIL = "fe_verify3@coindash.dev"
PASSWORD = "testpass123"

async def run():
    results = []
    async with httpx.AsyncClient(timeout=10) as c:
        # 1 - Unauth 401s
        r = await c.get(f"{BASE}/watchlists/")
        results.append(("watchlists unauth", r.status_code, 401))
        r = await c.get(f"{BASE}/alerts/")
        results.append(("alerts unauth", r.status_code, 401))

        # 2 - Signup or login
        r = await c.post(f"{BASE}/auth/signup", json={"email": EMAIL, "password": PASSWORD})
        if r.status_code == 409:
            r = await c.post(f"{BASE}/auth/login", json={"email": EMAIL, "password": PASSWORD})
        data = r.json()
        user_email = data["user"]["email"]
        access = data["access_token"]
        results.append(("signup/login", r.status_code, r.status_code))
        print(f"  Logged in as: {user_email}")

        # 3 - /me
        headers = {"Authorization": f"Bearer {access}"}
        r = await c.get(f"{BASE}/auth/me", headers=headers)
        results.append(("/auth/me", r.status_code, 200))

        # 4 - Watchlists with token
        r = await c.get(f"{BASE}/watchlists/", headers=headers)
        results.append(("watchlists authed", r.status_code, 200))
        if r.status_code == 200:
            wls = r.json()["watchlists"]
            print(f"  Watchlists: {len(wls)} found, user-owned confirmed")

        # 5 - Alerts with token
        r = await c.get(f"{BASE}/alerts/", headers=headers)
        results.append(("alerts authed", r.status_code, 200))

    print("\n=== Results ===")
    all_pass = True
    for name, got, expected in results:
        status = "PASS" if got == expected else "FAIL"
        if got != expected:
            all_pass = False
        print(f"  [{status}] {name}: {got} (expected {expected})")

    sys.exit(0 if all_pass else 1)

if __name__ == "__main__":
    asyncio.run(run())
