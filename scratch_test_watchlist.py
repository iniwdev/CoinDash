import asyncio
import httpx

async def run():
    async with httpx.AsyncClient() as client:
        print("Logging in...")
        login = await client.post('http://localhost:8000/api/v1/auth/login', json={'email': 'test2@example.com', 'password': 'password123'})
        print(f"Login status: {login.status_code}")
        token = login.json()['access_token']
        print(f"Token: {token[:10]}...")
        
        print("Fetching watchlists...")
        res = await client.get('http://localhost:8000/api/v1/watchlists/', headers={'Authorization': f'Bearer {token}'})
        print(f"Watchlists status: {res.status_code}")
        if res.status_code == 200:
            print(res.json())
        else:
            print(res.text)

if __name__ == "__main__":
    asyncio.run(run())
