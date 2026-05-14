import sys
import os
import httpx
import asyncio

async def test_auth_flow():
    base_url = "http://localhost:8005/api/v1"
    email = "test@example.com"
    password = "password123"
    
    print("--- Phase 4.6 Auth Flow Verification ---")
    
    async with httpx.AsyncClient() as client:
        # 1. Signup
        print("\n1. Testing Signup...")
        signup_res = await client.post(f"{base_url}/auth/signup", json={"email": email, "password": password})
        if signup_res.status_code == 409:
            print("   User already exists, proceeding to login.")
        elif signup_res.status_code == 201:
            print(f"   [SUCCESS] Signup successful: {signup_res.json()['user']['email']}")
        else:
            print(f"   [FAILED] Signup error: {signup_res.status_code} {signup_res.text}")
            return

        # 2. Login
        print("\n2. Testing Login...")
        login_res = await client.post(f"{base_url}/auth/login", json={"email": email, "password": password})
        if login_res.status_code == 200:
            tokens = login_res.json()
            access_token = tokens["access_token"]
            refresh_token = tokens["refresh_token"]
            print("   [SUCCESS] Login successful")
        else:
            print(f"   [FAILED] Login error: {login_res.status_code} {login_res.text}")
            return

        # 3. Get Me (Protected)
        print("\n3. Testing Protected /me...")
        headers = {"Authorization": f"Bearer {access_token}"}
        me_res = await client.get(f"{base_url}/auth/me", headers=headers)
        if me_res.status_code == 200:
            print(f"   [SUCCESS] /me returned: {me_res.json()['email']}")
        else:
            print(f"   [FAILED] /me error: {me_res.status_code} {me_res.text}")
            return

        # 4. Refresh Token
        print("\n4. Testing Token Refresh...")
        refresh_res = await client.post(f"{base_url}/auth/refresh", json={"refresh_token": refresh_token})
        if refresh_res.status_code == 200:
            new_tokens = refresh_res.json()
            new_access_token = new_tokens["access_token"]
            new_refresh_token = new_tokens["refresh_token"]
            print("   [SUCCESS] Refresh successful")
        else:
            print(f"   [FAILED] Refresh error: {refresh_res.status_code} {refresh_res.text}")
            return

        # 5. Verify old tokens fail
        print("\n5. Verifying old refresh token is revoked...")
        old_refresh_res = await client.post(f"{base_url}/auth/refresh", json={"refresh_token": refresh_token})
        if old_refresh_res.status_code == 401:
            print("   [SUCCESS] Old refresh token correctly rejected")
        else:
            print(f"   [FAILED] Old refresh token SHOULD have failed but got: {old_refresh_res.status_code}")

        # 6. Logout
        print("\n6. Testing Logout...")
        logout_res = await client.post(f"{base_url}/auth/logout", json={"refresh_token": new_refresh_token})
        if logout_res.status_code == 204:
            print("   [SUCCESS] Logout successful")
        else:
            print(f"   [FAILED] Logout error: {logout_res.status_code} {logout_res.text}")
            return

        # 7. Final Check
        print("\n7. Verifying logged out token fails...")
        final_refresh_res = await client.post(f"{base_url}/auth/refresh", json={"refresh_token": new_refresh_token})
        if final_refresh_res.status_code == 401:
            print("   [SUCCESS] Logged out token rejected")
        else:
            print(f"   [FAILED] Logged out token SHOULD have failed but got: {final_refresh_res.status_code}")

if __name__ == "__main__":
    asyncio.run(test_auth_flow())
