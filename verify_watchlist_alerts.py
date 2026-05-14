import asyncio
import httpx
import uuid

BASE_URL = "http://localhost:8000/api/v1"
EMAIL = "auth_test_user@example.com"
PASSWORD = "password123"

async def test_watchlist_alerts_auth():
    print("--- Watchlist & Alerts Auth Verification ---")
    
    async with httpx.AsyncClient() as client:
        # 1. Test 401 Unauthorized
        print("\n1. Testing Unauthorized access...")
        res = await client.get(f"{BASE_URL}/watchlists/")
        if res.status_code == 401:
            print("   [SUCCESS] Watchlist list returned 401 as expected")
        else:
            print(f"   [FAILED] Watchlist list returned {res.status_code}")
            
        res = await client.get(f"{BASE_URL}/alerts/")
        if res.status_code == 401:
            print("   [SUCCESS] Alerts list returned 401 as expected")
        else:
            print(f"   [FAILED] Alerts list returned {res.status_code}")

        # 2. Login/Signup to get token
        print("\n2. Getting authentication token...")
        # Try signup first
        await client.post(f"{BASE_URL}/auth/signup", json={"email": EMAIL, "password": PASSWORD})
        # Then login
        login_res = await client.post(f"{BASE_URL}/auth/login", json={"email": EMAIL, "password": PASSWORD})
        if login_res.status_code != 200:
            print(f"   [FAILED] Could not login: {login_res.text}")
            return
        
        tokens = login_res.json()
        headers = {"Authorization": f"Bearer {tokens['access_token']}"}
        user_id = tokens['user']['id']
        print(f"   [SUCCESS] Logged in as {EMAIL} (ID: {user_id})")

        # 3. Test Watchlist CRUD
        print("\n3. Testing Watchlist CRUD...")
        # List (should seed default)
        wl_list_res = await client.get(f"{BASE_URL}/watchlists/", headers=headers)
        if wl_list_res.status_code == 200:
            wls = wl_list_res.json()["watchlists"]
            print(f"   [SUCCESS] Found {len(wls)} watchlists")
            wl_id = wls[0]["id"]
        else:
            print(f"   [FAILED] List watchlists failed: {wl_list_res.status_code}")
            return

        # Create
        new_wl_res = await client.post(f"{BASE_URL}/watchlists/", json={"name": "Test Watchlist"}, headers=headers)
        if new_wl_res.status_code == 201:
            new_wl = new_wl_res.json()
            print(f"   [SUCCESS] Created watchlist: {new_wl['name']}")
        else:
            print(f"   [FAILED] Create watchlist failed: {new_wl_res.status_code}")

        # 4. Test Alerts CRUD
        print("\n4. Testing Alerts CRUD...")
        alert_res = await client.post(f"{BASE_URL}/alerts/", json={
            "coin_id": "bitcoin",
            "type": "price_above",
            "value": 100000.0
        }, headers=headers)
        if alert_res.status_code == 201:
            alert = alert_res.json()
            print(f"   [SUCCESS] Created alert for {alert['coin_id']} at {alert['value']}")
        else:
            print(f"   [FAILED] Create alert failed: {alert_res.status_code}")

        # 5. Verify ownership
        print("\n5. Verifying user ownership...")
        # Check if the created watchlist has our user_id
        # (The response model might not include user_id, but we can verify via list)
        wl_list_res = await client.get(f"{BASE_URL}/watchlists/", headers=headers)
        wls = wl_list_res.json()["watchlists"]
        if any(w["name"] == "Test Watchlist" for w in wls):
            print("   [SUCCESS] Watchlist persists for authenticated user")
        else:
            print("   [FAILED] Watchlist not found in user list")

    print("\n--- Verification Complete ---")

if __name__ == "__main__":
    asyncio.run(test_watchlist_alerts_auth())
